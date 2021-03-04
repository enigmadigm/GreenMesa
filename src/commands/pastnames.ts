import xlg from "../xlogger";
import { permLevels } from '../permissions';
import { Command } from "src/gm";
import { stringToMember } from "../utils/parsers";
import { MessageEmbedOptions } from "discord.js";
import { PaginationExecutor } from "../utils/pagination";

export const command: Command = {
    name: "pastnames",
    description: {
        short: "get past nicknames",
        long: "Get a list of past nicknames of a member in a server."
    },
    usage: "[member]",
    cooldown: 3,
    permLevel: permLevels.member,
    guildOnly: true,
    async execute(client, message, args) {
        try {
            if (!message.guild) return;

            const target = await stringToMember(message.guild, args.join(" "), true, true, true) || message.member;
            if (!target) {
                client.specials?.sendError(message.channel, "Target invalid");
                return;
            }
            const ud = await client.database?.getGuildUserData(target.guild.id, target.user.id);
            if (!ud || !ud.nicknames) {
                client.specials?.sendError(message.channel, `Could not access user data. ${target} may not have any nicknames yet.`);
                return;
            }
            const names = ud.nicknames.split(",");
            let runs = 0;
            const overflowArray: string[][] = [];// an array of sets of names, a new array is pushed whenever the names of the previous overflow (max of 10 names)
            if (names.length > 10 || names.join("\n").length > 1024) {
                while (names.length) {
                    runs++;
                    if (runs > 10000) {
                        break;
                    }
                    const overLines: string[] = [];
                    for (const item of names) {
                        if (overLines.length > 10 || overLines.join("\n").length > 1024) {
                            break;
                        }
                        overLines.push(item);
                    }
                    names.splice(0, overLines.length);
                    overflowArray.push(overLines);
                }
            } else if (names.length) {
                overflowArray.push(names);
            } else {
                names[0] = `*no names to display*`;
                overflowArray.push(names);
            }

            const pages: MessageEmbedOptions[] = [];
            for (const page of overflowArray) {
                const e: MessageEmbedOptions = {
                    color: await client.database?.getColor("info_embed_color"),
                    title: `Nicknames of ${target.user.tag.escapeDiscord()}`,
                    description: `\`\`\`\n${page.join("\n")}\n\`\`\``
                }
                pages.push(e);
            }

            PaginationExecutor.createEmbed(message, pages);
            //message.channel.send(`${ud.nicknames.split(",").join("\n")}`, { code: true });
        } catch (error) {
            xlg.error(error);
            await client.specials?.sendError(message.channel);
            return false;
        }
    }
}
