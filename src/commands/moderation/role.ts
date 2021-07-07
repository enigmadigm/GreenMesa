import { getPermLevel, permLevels } from '../../permissions';
import { parseFriendlyUptime, stringToMember, stringToRole } from "../../utils/parsers";
import { getFriendlyUptime } from "../../utils/time";
import { Role, GuildMember, CollectorFilter, MessageEmbed, Collection, Permissions, MessageActionRow, MessageButton, MessageComponentInteraction } from "discord.js";
import { Command } from "src/gm";

const roleDelay = 1000;
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
async function* delayedLoop(start: number, end: number, increment: number, delay: number) {
    for (let i = start; i < end; i += increment) {
        yield i
        await sleep(delay)
    }
}

const activeOps = new Collection<string, () => void>();

export const command: Command = {
    name: "role",
    description: {
        short: "toggle roles on members",
        long: "Toggles a role on a member or all members.\nThis command can be used by any members with role management permissions. Members will only be able to toggle roles on themselves that are below the highest one they have.\nSend 'all' or '+all' to give the role to everyone.\n'-all' will remove it from everyone.\nSpecify @member or +@member to give the role to a member.\n-@member will remove the role\nYou can even specify @role, +@role, or -@role to toggle the role on everyone with that role.",
    },
    usage: "<target: [+-]all | [+-]@member | [+-]@role> <role: @role>",
    examples: [
        "+all some role",
    ],
    args: true,
    flags: [
        {
            f: "f",
            d: "force the operation (skip confirmation)"
        },
        {
            f: "x",
            d: "users to not apply to",
            v: "userid1,userid2,userid3",
        },
    ],
    permLevel: permLevels.member,
    permissions: ["MANAGE_ROLES"],
    guildOnly: true,
    moderation: true,
    async execute(client, message, args, flags) {
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
                    await client.specials.sendError(message.channel, "Member/role target not specified/valid.\n`<target> <role>`");
                    return false;
                }
            }
            args.shift();
            const targetRole = stringToRole(g, args.join(" "), true, true);
            if (!targetRole || !(targetRole instanceof Role)) {
                await client.specials.sendError(message.channel, "Role-to-toggle not specified/valid.\n`<target> <role>`");
                return false;
            }

            const permLevel = await getPermLevel(message.member || message.author);
            if (permLevel < permLevels.admin) {
                if (((message.member.permissions.bitfield & 0x10000000n) !== 0x10000000n || target === "all" || target instanceof Role || (targetRole.position >= message.member.roles.highest.position))) {
                    await client.specials.sendError(message.channel, `${message.member}, you don't have permission to toggle this role.`);
                    return;
                }
                if (targetRole.permissions.has(["MANAGE_ROLES"]) && message.member.roles.cache.has(targetRole.id) && message.member.roles.cache.filter(r => (r.permissions.bitfield & 0x10000000n) === 0x10000000n).size === 1 && (message.member.permissions.bitfield & 0x8n) !== 0x8n) {
                    await client.specials.sendError(message.channel, `I cannot remove ${targetRole} from you because doing so would remove your role management permissions. Only an admin may remove this role from you.`);
                    return;
                }
                if (targetRole.permissions.remove(message.member.permissions.bitfield).toArray().length) {
                    await client.specials.sendError(message.channel, `I cannot give ${targetRole} to you because doing so would give you more permissions than you currently have.`);
                    return;
                }
            }
            if (targetRole.position >= message.member.roles.highest.position && message.guild.ownerID !== message.member.id) {
                await client.specials.sendError(message.channel, `Sorry ${message.member}, ${targetRole} has a higher position than your highest role, you aren't allowed to manage it.`);
                return;
            }

            if (target === "all" || target instanceof Role) {
                const exFlag = flags.find(x => x.name === "x");
                const toExclude: ({ id: string })[] = [];
                if (exFlag) {
                    for await (const x of exFlag.value.split(",")) {
                        const m = await stringToMember(message.guild, x, true, false, false);
                        toExclude.push(m ? m : { id: "" });
                    }
                }
                const targets = g.members.cache.filter((m) => {
                    if (toExclude.find(x => x.id === m.id)) return false;
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
                if (targets.length > 10 && !flags.find(f => f.name === "f")) {
                    const { end: confirm } = await client.specials.getUserConfirmation(message.channel, [message.author.id], `Are you sure you want to proceed?\nThis action affects ${targets.length} users.`, "", undefined, true);
                    if (!confirm) {
                        return;
                    }
                }

                const loop = delayedLoop(0, targets.length, 1, roleDelay);
                const d = targets.length * roleDelay + 500;
                const t = getFriendlyUptime(d);
                const fu = parseFriendlyUptime(t);
                const etaMessage = await message.channel.send({
                    embeds: [{
                        color: await client.database.getColor("info"),
                        description: `**Target:** ${target}\n**${add ? "Giving": "Removing"}:** ${targetRole} (max ${targets.length} members)\n**ETA:** ${fu ? fu : "*should take no time at all*"}`,
                        footer: {
                            text: `Click 🔴 to cancel`,
                        },
                    }],
                    components: [
                        new MessageActionRow().addComponents(
                            new MessageButton({ customID: "abort", style: "SECONDARY" }).setEmoji("🔴")
                        )
                    ],
                });
                const cancelOp = () => {
                    loop.return();
                }

                // listener for the cancel button
                const filter: CollectorFilter<[MessageComponentInteraction]> = (inter) => {
                    if (inter.user.id !== client.user?.id &&
                        inter.customID === 'abort' &&
                        (inter.member?.permissions instanceof Permissions && (inter.member.permissions.bitfield & Permissions.FLAGS.ADMINISTRATOR) === Permissions.FLAGS.ADMINISTRATOR || inter.user.id === message.author.id)) {
                        return true;
                    }
                    return false;
                };
                const collector = etaMessage.createMessageComponentInteractionCollector({ filter, time: d, maxUsers: 1 });
                // await etaMessage.react("🔴");

                collector.on('collect', async () => {
                    // const e = new MessageEmbed(etaMessage.embeds[0]).setColor(await client.database.getColor("fail"));
                    // await etaMessage.edit(e);
                    cancelOp();
                });

                collector.on('end', async () => {
                    const e = new MessageEmbed(etaMessage.embeds[0]).setFooter("");
                    await etaMessage.edit({ embeds: [e], components: [] });
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
                            await client.specials.sendError(message.channel, `An error was encountered while giving ${targetRole} to ${m}`);
                            errored = true;
                        }
                    }
                }

                activeOps.delete(`${message.author.id}${message.guild.id}`);
                if (affected) {
                    await message.channel.send({
                        embeds: [{
                            color: await client.database.getColor("success"),
                            description: `${targetRole} ${add ? "given to" : "removed from"} ${affected} member(s)`
                        }],
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
                        embeds: [{
                            color: await client.database.getColor("success"),
                            description: `${targetRole} removed from ${target}`
                        }],
                    });
                } else {
                    if (!add) {
                        await client.specials.sendError(message.channel, `${target} already lacks ${targetRole}`);
                        return;
                    }
                    await target.roles.add(targetRole);
                    await message.channel.send({
                        embeds: [{
                            color: await client.database.getColor("success"),
                            description: `${targetRole} given to ${target}`
                        }],
                    });
                }
            }/*  else {
                client.specials?.sendError(message.channel, "No target to assign", true)
            } */
        } catch (error) {
            xlg.error(error);
            await client.specials.sendError(message.channel);
            return false;
        }
    }
}
