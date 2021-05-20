import { stringToRole } from "../../utils/parsers";
import { permLevels } from '../../permissions';
import { Command, GuildMessageProps } from 'src/gm';
import { MessageEmbedOptions } from 'discord.js';
import { PaginationExecutor } from '../../utils/pagination';
const maxlen = 15;

export const command: Command<GuildMessageProps> = {
    name: 'inrole',
    description: {
        short: `list members with a role`,
        long: `Get an approximate list of members with a role`,
    },
    aliases: ['ir'],
    usage: '<role>',
    examples: [
        "new role",
        "@admin"
    ],
    args: true,
    permLevel: permLevels.trustedMember,
    guildOnly: true,
    async execute(client, message, args) {
        try {
            message.channel.startTyping();
            const g = await message.guild.fetch();
            const target = stringToRole(g, args.join(" "), true, true);
            if (!target) {
                await client.specials?.sendError(message.channel, "That role could not be found.")
                message.channel.stopTyping();
                return;
            }
            // if (target.name === "@everyone" && target.position === 0) {
            //     await client.specials?.sendError(message.channel, "No @everyone! Everyone is in that role, obviously.");
            //     message.channel.stopTyping();
            //     return;
            // }
            let list = [];
            const userList = target.members.array().map(x => {//˾
                const tag = `${x.user.tag || "not identifiable"}`.split("").map((x) => {
                    return x.escapeDiscord();
                })
                return tag.join("");
            });

            // overflow handling
            list = userList.slice();
            //list.unshift(`***[${userList.length}/${target.members.size}]** =>*`);
            /*if (list.join("\n").length > 1024) {
                while (list.join("\n").length > 1018) {
                    list.pop();
                }
            }*/

            const overflowArray: string[][] = [];
            if (list.length > maxlen || list.join("\n").length > 1024) {
                //const f = list.shift();
                const f = `***[${userList.length}/${target.members.size}]** =>*`;
                let runs = 0;
                while (list.length) {
                    runs++;
                    if (runs > 10000) {
                        break;
                    }
                    const overLines: string[] = [];
                    overLines.unshift(f);
                    for (const item of list) {
                        if (overLines.length > maxlen || overLines.join("\n").length > 1024) {
                            break;
                        }
                        overLines.push(item);
                    }
                    list.splice(0, overLines.length - 1);
                    /*while (list.length && ) {
                        overLines.push(list[0]);
                        list.shift();
                    }*/
                    overLines[0] = `***[${overLines.length - 1}/${userList.length}]** =>*`;
                    overflowArray.push(overLines);
                }
            } else if (list.length) {
                list.unshift(`***[${list.length}/${userList.length}]** =>*`);
                overflowArray.push(list);
            } else {
                list[0] = `*no members with this role*`;
                overflowArray.push(list);
            }

            const pages: MessageEmbedOptions[] = [];
            for (const page of overflowArray) {
                const e: MessageEmbedOptions = {
                    color: await client.database.getColor("info"),
                    title: `List of users with role \`${target.name}\``,
                    description: `${page.join("\n")}`
                }
                pages.push(e);
            }

            PaginationExecutor.createEmbed(message, pages);

            message.channel.stopTyping();
        } catch (error) {
            xlg.error(error);
            message.channel.stopTyping(true);
            await client.specials?.sendError(message.channel);
            return false;
        }
    }
}
