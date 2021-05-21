import { getPermLevel, permLevels } from '../../permissions';
import { parseFriendlyUptime, stringToMember, stringToRole } from "../../utils/parsers";
import { getFriendlyUptime } from "../../utils/time";
import { Role, GuildMember, CollectorFilter, MessageEmbed, Collection } from "discord.js";
import { Command, GuildMessageProps } from "src/gm";
const roleDelay = 1000;
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

async function* delayedLoop(start: number, end: number, increment: number, delay: number) {
    for (let i = start; i < end; i += increment) {
        yield i
        await sleep(delay)
    }
}

const activeOps = new Collection<string, () => void>();

export const command: Command<GuildMessageProps> = {
    name: "role",
    description: {
        short: "toggle roles on members",
        long: "Toggles a role on a member or all members.\nThis command can be used by any members with role management permissions. Members will only be able to toggle roles on themselves that are below the highest one they have.\nSend 'all' or '+all' to give the role to everyone.\n'-all' will remove it from everyone.\nSpecify @member or +@member to give the role to a member.\n-@member will remove the role\nYou can even specify @role, +@role, or -@role to toggle the role on everyone with that role.",
    },
    usage: "<target: [+-]all | [+-]@member | [+-]@role> <role: @role>",
    args: true,
    permLevel: permLevels.member,
    guildOnly: true,
    moderation: true,
    async execute(client, message, args) {
        try {
            if (args.join(" ").toLocaleLowerCase() === "cancel") {
                const op = activeOps.get(`${message.author.id}${message.guild.id}`);
                if (op) {
                    op();
                    await message.reply(`Stopped your running process, hopefully`);
                    activeOps.delete(`${message.author.id}${message.guild.id}`);
                    return;
                }
                await client.specials.sendError(message.channel, `You have not started any currently running processes`);
                return;
            } else if (activeOps.get(`${message.author.id}${message.guild.id}`)) {
                await client.specials.sendError(message.channel, `You already have an active operation running. Send \`${message.gprefix} ${this.name} cancel\` to stop it.`);
                return;
            }
            const g = await message.guild.fetch();

            let target: Role | GuildMember | 'all' | undefined;
            let add = true;
            if (args[0]) {
                if (args[0].startsWith("+")) {
                    args[0] = args[0].slice(1);
                } else if (args[0].startsWith("-")) {
                    add = false;
                    args[0] = args[0].slice(1);
                }
                if (!args[0]) {
                    args.shift();
                }
            }
            if (args[0] === "all" || args[0] === "everyone" || args[0] === "@everyone") {
                target = "all";
            } else {
                target = await stringToMember(g, args[0], true, false, false) || stringToRole(g, args[0], true, true);
                if (!target) {
                    client.specials?.sendError(message.channel, "Member/role target not specified/valid.\n`<target> <role>`");
                    return false;
                }
            }
            args.shift();
            const targetRole = stringToRole(g, args.join(" "), true, true);
            if (!targetRole || !(targetRole instanceof Role)) {
                client.specials?.sendError(message.channel, "Role-to-toggle not specified/valid.\n`<target> <role>`");
                return false;
            }

            const permLevel = await getPermLevel(message.member || message.author);
            if (permLevel < permLevels.admin) {
                if (((message.member.permissions.bitfield & 0x10000000) !== 0x10000000 || target === "all" || target instanceof Role || (targetRole.position >= message.member.roles.highest.position))) {
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

            if (target === "all" || target instanceof Role) {
                const targets = g.members.cache.filter((m) => {
                    if (target instanceof Role) {
                        return !!m.roles.cache.get(target.id);
                    }
                    if (add) {
                        return !m.roles.cache.get(targetRole.id);
                    } else {
                        return !!m.roles.cache.get(targetRole.id);
                    }
                }).array();
                if (!targets.length) {
                    await client.specials.sendError(message.channel, `**Failure:** No members to ${add ? "give this role to" : "remove this role from"}`);
                    return;
                }

                const loop = delayedLoop(0, targets.length, 1, roleDelay);
                const cancelOp = () => {
                    loop.return();
                }
                const d = targets.length * roleDelay + 500;
                const t = getFriendlyUptime(d);
                const fu = parseFriendlyUptime(t);
                const etaMessage = await message.channel.send({
                    embed: {
                        color: await client.database.getColor("info"),
                        description: `**ETA:**\n${fu ? fu : "*should take no time at all*"}`,
                        footer: {
                            text: `React 🔴 to cancel`,
                        },
                    }
                });

                // listener for the cancel button
                const filter: CollectorFilter = (r, u) => u.id !== client.user?.id &&
                    (r.emoji.name === '🔴') &&
                    (message.guild?.members.cache.get(u.id)?.permissions.has(["ADMINISTRATOR"]) || u.id === message.author.id);
                const collector = etaMessage.createReactionCollector(filter, {
                    time: d,
                    maxUsers: 1,
                });
                await etaMessage.react("🔴");

                collector.on('collect', () => {
                    cancelOp();
                });
                
                collector.on('end', async () => {
                    const e = new MessageEmbed(etaMessage.embeds[0]).setFooter("");
                    await etaMessage.edit(e);
                    cancelOp();
                });

                activeOps.set(`${message.author.id}${message.guild.id}`, cancelOp);
                let affected = 0;
                let errored = false;
                for await (const i of loop) {
                    const m = targets[i];
                    try {
                        if (m.roles.cache.has(targetRole.id)) {
                            if (!add) {
                                await m.roles.remove(targetRole);
                                affected++;
                            }
                        } else {
                            if (add) {
                                await m.roles.add(targetRole);
                                affected++;
                            }
                        }
                    } catch (error) {
                        if (!errored) {
                            xlg.error(error);
                            await client.specials?.sendError(message.channel, `An error was encountered while giving ${targetRole} to ${m}`);
                            errored = true;
                        }
                    }
                }

                activeOps.delete(`${message.author.id}${message.guild.id}`);
                if (affected) {
                    await message.channel.send({
                        embed: {
                            color: await client.database.getColor("success"),
                            description: `${targetRole} ${add ? "given to" : "removed from"} ${affected} member(s)`
                        }
                    });
                } else {
                    await client.specials.sendError(message.channel, `**Failure:** No members were ${add ? "given" : "removed"} ${targetRole}`);
                }
            } else if (target instanceof GuildMember) {
                if (target.roles.cache.has(targetRole.id)) {
                    if (add) {
                        await client.specials.sendError(message.channel, `${target} already has ${targetRole}`);
                        return;
                    }
                    await target.roles.remove(targetRole);
                    await message.channel.send({
                        embed: {
                            color: await client.database.getColor("success"),
                            description: `${targetRole} removed from ${target}`
                        }
                    });
                } else {
                    if (!add) {
                        await client.specials.sendError(message.channel, `${target} already lacks ${targetRole}`);
                        return;
                    }
                    await target.roles.add(targetRole);
                    await message.channel.send({
                        embed: {
                            color: await client.database.getColor("success"),
                            description: `${targetRole} given to ${target}`
                        }
                    });
                }
            }/*  else {
                client.specials?.sendError(message.channel, "No target to assign", true)
            } */
        } catch (error) {
            xlg.error(error);
            await client.specials?.sendError(message.channel);
            return false;
        }
    }
}

