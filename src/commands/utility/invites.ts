
import { permLevels } from '../../permissions';
import { Command } from "src/gm";
import { stringToMember } from "../../utils/parsers";
import { MessageEmbed, MessageEmbedOptions } from "discord.js";
import { PaginationExecutor } from "../../utils/pagination";

export const command: Command = {
    name: "invites",
    aliases: ["invs"],
    description: {
        short: "inviter stats",
        long: "Get the personal invite data of any user in the a server. This will provide how many members a certain user has invited."
    },
    usage: "<@member> [count|list|users|inviter]",
    args: false,
    cooldown: 3,
    permLevel: permLevels.member,
    guildOnly: true,
    permissions: ["MANAGE_GUILD"],
    async execute(client, message, args) {
        try {
            if (!message.guild || !message.member) return;
            const g = await message.guild.fetch();
            let target = message.member;
            const secondaryTarget = await stringToMember(g, args[0], false, false, false);
            if (secondaryTarget) {
                target = secondaryTarget;
                args.shift();
            }
            const data = await client.database.getInvites({ guildid: g.id, inviter: target.id });
            if (!args.length) args.push("count");
            const selector =  args[0];
            args.shift();
            switch (selector) {
                case "list": {
                    const embed: MessageEmbedOptions = {
                        color: await client.database.getColor("info"),
                        author: {
                            name: `${target.user.username}'s Invites`,
                            iconURL: target.user.avatarURL() || "",
                        },
                        description: `The list of the invites used historically (not invites that have not been used).`,
                    }
                    const overflowPages: MessageEmbed[] = [];
                    if (!data.length) {
                        embed.description += `\n*No data is available for past invite use, no invites have been recorded.*`;
                    } else {
                        const add: string[] = [];
                        const codes = data.map(x => {
                            return { code: x.code, uses: data.reduce((p, c) => c.code === x.code ? p + 1 : p, 0) };
                        });
                        for (const c of codes) {
                            if (add.includes(`\` ${c.code} \` (${c.uses} uses)`)) continue;
                            add.push(`\` ${c.code} \` (${c.uses} uses)`);
                        }
                        embed.description += `\n`;
                        const pages: string[] = [];
                        let pagei = 0;
                        for (const a of add) {
                            const page = pages[pagei] || "";
                            if (`${page}\n${a}`.length < 512) {
                                pages[pagei] = `${page}\n${a}`;
                            } else {
                                pagei++;
                                pages[pagei] = a;
                            }
                        }
                        embed.description += pages[0];
                        overflowPages.push(new MessageEmbed(embed))
                        pages.shift();
                        for (const page of pages) {
                            overflowPages.push(new MessageEmbed(embed).setDescription(page));
                        }
                    }
                    PaginationExecutor.createEmbed(message, overflowPages, [message.author.id], true);
                    // await message.channel.send({ embed });
                    break;
                }
                case "invitees":
                case "users": {
                    const embed: MessageEmbedOptions = {
                        color: await client.database.getColor("info"),
                        author: {
                            name: `${target.user.username}'s Invitees`,
                            iconURL: target.user.avatarURL() || "",
                        },
                        description: ``,
                    }
                    const overflowPages: MessageEmbed[] = [];
                    if (!data.length) {
                        embed.description += `**Data for ${target.user.username}'s invitees is not available.**\nThey probably joined before I began recording data.`;
                    } else {
                        // embed.description += `*I can't give this information to you yet because this subcommand hasn't been completed. The developer didn't want to have to write this part right now.*`;
                        const add: string[] = [];
                        for (const inv of data) {
                            const u = inv.inviteename;
                            if (add.includes(`\` ${u} \``)) continue;
                            add.push(`\` ${u} \``);
                        }
                        embed.description += `\n`;
                        const pages: string[] = [];
                        let pagei = 0;
                        for (const a of add) {
                            const page = pages[pagei] || "";
                            if (`${page}\n${a}`.length < 512) {
                                pages[pagei] = `${page}\n${a}`;
                            } else {
                                pagei++;
                                pages[pagei] = a;
                            }
                        }
                        embed.description += pages[0];
                        overflowPages.push(new MessageEmbed(embed))
                        pages.shift();
                        for (const page of pages) {
                            overflowPages.push(new MessageEmbed(embed).setDescription(page));
                        }
                    }
                    PaginationExecutor.createEmbed(message, overflowPages, [message.author.id], true);
                    break;
                }
                case "inviter": {
                    const data = await client.database.getInvites({ guildid: g.id, invitee: target.id });
                    const embed: MessageEmbedOptions = {
                        color: await client.database.getColor("info"),
                        author: {
                            name: `${target.user.username}'s Inviter`,
                            iconURL: target.user.avatarURL() || "",
                        },
                        description: ``,
                    }
                    if (!data.length) {
                        embed.description += `**Data for ${target.user.username}'s inviter is not available.**\nThey probably joined before I began recording data.`;
                    } else {
                        const invite = data[0];
                        const user = g.members.cache.get(invite.inviter)?.user.tag ?? (invite.invitername || "unknown#0000");
                        embed.description += `\` ${user} \` seems to have invited ${target.user.username}.`;
                        embed.footer = {
                            text: `Inviter ID: ${invite.inviter}`,
                        };
                    }
                    await message.channel.send({ embed });
                    break;
                }
                case "count":
                default: {
                    const stillHere = data.filter(x => {
                        return g.members.cache.get(x.invitee);
                    });
                    const hasLeft = data.filter(x => {
                        return !stillHere.find(x2 => x2.id === x.id);
                    });
                    const fake = stillHere.filter(x => {
                        return stillHere.find(x2 => x2.id !== x.id && x2.invitee === x.invitee) || x.invitee === target.id;
                    });
                    const total = data.length;
                    const equated = stillHere.length - fake.length;
                    const embed: MessageEmbedOptions = {
                        color: await client.database.getColor("info"),
                        author: {
                            name: `${target.user.username}'s Invite Statistics`,
                            iconURL: target.user.avatarURL() || "",
                        },
                        description: `**Valid:** \` ${equated} \` **(**total: \`${total}\`**,** (-) left: \`${hasLeft.length}\`**,** (-) fake: \`${fake.length}\`**)**`,
                    }
                    await message.channel.send({ embed });
                    break;
                }
            }
        } catch (error) {
            xlg.error(error);
            await client.specials?.sendError(message.channel);
            return false;
        }
    }
}
