//import { getGlobalSetting } from '../dbmanager';
import xlg from '../../xlogger';
import { stringToRole } from "../../utils/parsers";
import { permLevels } from '../../permissions';
import { Command } from 'src/gm';
import { MessageEmbedOptions } from 'discord.js';
import { PaginationExecutor } from '../../utils/pagination';
const maxlen = 15;

export const command: Command = {
    name: 'inrole',
    description: 'get the members that have a role',
    aliases: ['ir'],
    usage: '<role>',
    args: true,
    permLevel: permLevels.trustedMember,
    guildOnly: true,
    async execute(client, message, args) {
        try {
            if (!message.guild) return;
            message.channel.startTyping();
            const g = await message.guild.fetch();
            const target = stringToRole(g, args.join(" "), true, true);
            if (!target) {
                client.specials?.sendError(message.channel, "That role could not be found.")
                message.channel.stopTyping();
                return;
            }
            if (target === "@everyone" || target === "@here") {
                client.specials?.sendError(message.channel, "No @everyone or @here!")
                return;
            }
            let list = [];
            const userList = target.members.array().map(x => {//˾
                const tag = `${x.user.tag || "not identifiable"}`.split("").map((x) => {
                    return x.replace("*", "⁎").replace("_", "\\_").replace("`", "\\`");
                })
                return tag.join("");
            });

            // overflow handling
            list = userList.slice();
            list.unshift(`***[${userList.length}/${target.members.size}]** =>*`);
            /*if (list.join("\n").length > 1024) {
                while (list.join("\n").length > 1018) {
                    list.pop();
                }
            }*/
            
            const overflowArray: string[][] = [];
            if (list.length > maxlen || list.join("\n").length > 1024) {
                const f = list.shift();
                while (list.length) {
                    const overLines: string[] = [];
                    overLines.unshift(f || "");
                    while (list.length && overLines.length <= maxlen && overLines.join("\n").length <= 1024) {
                        
                        overLines.push(list[0]);
                        list.shift();
                    }
                    overLines[0] = `***[${overLines.length - 1}/${target.members.size}]** =>*`;
                    overflowArray.push(overLines);
                }
            } else {
                list[0] = `***[${list.length - 1}/${target.members.size}]** =>*`;
                overflowArray.push(list);
            }

            const pages: MessageEmbedOptions[] = [];
            for (const page of overflowArray) {
                const e: MessageEmbedOptions = {
                    color: await client.database?.getColor("info_embed_color"),
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

