import xlg from "../../xlogger";
import { permLevels } from '../../permissions';
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
        long: "Toggles a role on a member or all members."
    },
    usage: "<@member|@role> <@role to toggle>",
    args: true,
    permLevel: permLevels.admin,
    guildOnly: true,
    async execute(client, message, args) {
        try {
            if (!message || !message.guild) return;
            const g = await message.guild.fetch();

            const moderationEnabled = await client.database?.getGuildSetting(g, 'all_moderation');
            if (!moderationEnabled || moderationEnabled.value === 'disabled') {
                return client.specials?.sendModerationDisabled(message.channel);
            }

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            let target: any = await stringToMember(g, args[0], true, false, false) || stringToRole(g, args[0], true, true, false);
            if (!target) {
                if (args[0] === "all" || args[0] === "everyone" || args[0] === "@everyone") {
                    target = "all";
                } else {
                    client.specials?.sendError(message.channel, "Member/role target not specified/valid.");
                    return false;
                }
            }
            args.shift();
            const targetRole = stringToRole(g, args.join(" "), true, true, false);
            if (!targetRole || !(targetRole instanceof Role)) {
                client.specials?.sendError(message.channel, "Role-to-toggle not specified/valid.");
                return false;
            }
            if (target === "all") {
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

                let errored = false;
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
                            client.specials?.sendError(message.channel, `Error toggling ${targetRole} en mass.`);
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

