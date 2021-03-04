import xlg from "../../xlogger";
import { getPermLevel, permLevels } from '../../permissions';
import { stringToMember, stringToRole } from "../../utils/parsers";
//import { getGlobalSetting, getGuildSetting } from "../dbmanager";
import { getFriendlyUptime } from "../../utils/time";
import { Role, GuildMember } from "discord.js";
import { Command } from "src/gm";
const roleDelay = 1000;
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

async function* delayedLoop(start: number, end: number, increment: number, delay: number) {
    for (let i = start; i < end; i += increment) {
        yield i
        await sleep(delay)
    }
}

function parseFriendlyUptime(t: {hours: number, minutes: number, seconds: number, days: number}) {
    const th = t.hours + (t.days * 24);
    const tm = t.minutes;
    const ts = t.seconds;
    const ttypes = ["hours", "minutes", "seconds"];
    if (!th)
        ttypes.splice(ttypes.indexOf("hours"), 1);
    if (!tm)
        ttypes.splice(ttypes.indexOf("minutes"), 1);
    if (!ts)
        ttypes.splice(ttypes.indexOf("seconds"), 1);
    const tt = [th, tm, ts].filter(x => x > 0).map((x, i, xt) => {
        return `${x} ${ttypes[i]}${i !== (xt.length - 1) ? (xt.length > 1 && xt.length - 2 === i ? `${xt.length > 2 ? "," : ""} and ` : ", ") : ""}`;
    });
    return tt.join("");
}

export const command: Command = {
    name: "role",
    description: {
        short: "toggles a role on a member",
        long: "Toggles a role on a member or all members. This command can be used by any members with role management permissions. Members will only be able to toggle roles on themselves that are below the highest one they have. There are many options for who to toggle the role on. Specify 'all' to toggle the role on everyone, this will remove it if they have it, or add it if they don't for each person. Specify 'alloff' to remove the role from everyone. Specify 'allon' to add the role to everyone. Specify a @member to toggle the role on or off of. Specify a @role to toggle the role on everyone with that role."
    },
    usage: "<who to toggle role on: all | allon | alloff | @member | @role> <role to toggle: @role>",
    args: true,
    permLevel: permLevels.member,
    guildOnly: true,
    moderation: true,
    async execute(client, message, args) {
        try {
            if (!message || !message.guild || !message.member) return;
            const g = await message.guild.fetch();

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            let target: any = await stringToMember(g, args[0], true, false, false) || stringToRole(g, args[0], true, true, false);
            if (!target) {
                if (args[0] === "all" || args[0] === "everyone" || args[0] === "@everyone") {
                    target = "all";
                } else if (args[0] === "allon") {
                    target = "allon";
                } else if (args[0] === "alloff") {
                    target = "alloff";
                } else {
                    client.specials?.sendError(message.channel, "Member/role target not specified/valid.\n`<target> <role>`");
                    return false;
                }
            }
            args.shift();
            const targetRole = stringToRole(g, args.join(" "), true, true, false);
            if (!targetRole || !(targetRole instanceof Role)) {
                client.specials?.sendError(message.channel, "Role-to-toggle not specified/valid.\n`<target> <role>`");
                return false;
            }

            const permLevel = await getPermLevel(message.member || message.author);
            if (permLevel < permLevels.admin) {
                if (((message.member.permissions.bitfield & 0x10000000) !== 0x10000000 || target === "all" || target === "allon" || target === "alloff" || target instanceof Role || (targetRole.position >= message.member.roles.highest.position))) {
                    client.specials?.sendError(message.channel, `${message.member}, you don't have permission to toggle this role.`);
                    return;
                }
                if (targetRole.permissions.has(["MANAGE_ROLES"]) && message.member.roles.cache.has(targetRole.id) && message.member.roles.cache.filter(r => (r.permissions.bitfield & 0x10000000) === 0x10000000).size === 1 && (message.member.permissions.bitfield & 0x8) !== 0x8) {
                    client.specials?.sendError(message.channel, `I cannot remove ${targetRole} from you because doing so would remove your role management permissions. Only an admin may remove this role from you.`);
                    return;
                }
                if (targetRole.permissions.remove(message.member.permissions.bitfield).toArray().length) {
                    client.specials?.sendError(message.channel, `I cannot give ${targetRole} to you because doing so would give you more permissions than you currently have.`);
                    return;
                }
            }
            if (targetRole.position >= message.member.roles.highest.position && message.guild.ownerID !== message.member.id) {
                client.specials?.sendError(message.channel, `Sorry ${message.member}, ${targetRole} has a higher position than your highest role, you aren't allowed to manage it.`);
                return;
            }

            if (target === "all" || target === "allon" || target === "alloff") {
                const targets = g.members.cache.array();
                if (!targets.length) return;

                const loop = delayedLoop(0, targets.length, 1, roleDelay);
                const t = getFriendlyUptime(targets.length * roleDelay + 500);
                const fu = parseFriendlyUptime(t);
                await message.channel.send({
                    embed: {
                        color: await client.database?.getColor("info_embed_color"),
                        description: `**ETA:**\n${fu}`
                    }
                });
                let affected = 0;
                let errored = false;
                for await (const i of loop) {
                    try {
                        const m = targets[i];
                        if (m.roles.cache.has(targetRole.id)) {
                            if (target !== "allon") {
                                await m.roles.remove(targetRole);
                                affected++;
                            }
                            //await sleep(500);
                        } else {
                            if (target !== "alloff") {
                                await m.roles.add(targetRole);
                                affected++;
                            }
                            //await sleep(500);
                        }
                    } catch (error) {
                        if (!errored) {
                            xlg.error(error);
                            client.specials?.sendError(message.channel, `Error toggling ${targetRole} en mass.`);
                            errored = true;
                        }
                    }
                }

                await message.channel.send({
                    embed: {
                        color: await client.database?.getColor("success_embed_color"),
                        description: `${targetRole || "Role"} ${target === "all" ? "toggled on" : target === "allon" ? "given to" : "removed from"} ${affected} member(s)`
                    }
                });
            } else if (target instanceof Role) {
                const targets = g.members.cache.filter((m) => !!(m.roles && m.roles.cache.get(target.id))).array();
                let errored = false;

                const loop = delayedLoop(0, targets.length, 1, roleDelay);
                const t = getFriendlyUptime(targets.length * roleDelay + 500);
                const fu = parseFriendlyUptime(t);
                await message.channel.send({
                    embed: {
                        color: await client.database?.getColor("info_embed_color"),
                        description: `**ETA:**\n${fu}`
                    }
                });

                for await (const i of loop) {
                    try {
                        const m = targets[i];
                        if (m.roles.cache.has(targetRole.id)) {
                            await m.roles.remove(targetRole);
                            //await sleep(500);
                        } else {
                            await m.roles.add(targetRole);
                            //await sleep(500);
                        }
                    } catch (error) {
                        if (!errored) {
                            xlg.error(error);
                            client.specials?.sendError(message.channel, `Error toggling ${targetRole} en mass to ${target}`);
                            errored = true;
                        }
                    }
                }

                await message.channel.send({
                    embed: {
                        color: await client.database?.getColor("success_embed_color"),
                        description: `${targetRole || "Role"} toggled on ${targets.length} member(s)`
                    }
                });
            } else if (target instanceof GuildMember) {
                if (target.roles.cache.has(targetRole.id)) {
                    await target.roles.remove(targetRole);
                    //await sleep(500);
                    await message.channel.send({
                        embed: {
                            color: await client.database?.getColor("success_embed_color"),
                            description: `${targetRole || "Role"} removed from ${target}`
                        }
                    });
                } else {
                    await target.roles.add(targetRole);
                    //await sleep(500);
                    await message.channel.send({
                        embed: {
                            color: await client.database?.getColor("success_embed_color"),
                            description: `${targetRole || "Role"} given to ${target}`
                        }
                    });
                }
            } else {
                client.specials?.sendError(message.channel, "No target to assign", true)
            }

        } catch (error) {
            xlg.error(error);
            await client.specials?.sendError(message.channel);
            return false;
        }
    }
}

