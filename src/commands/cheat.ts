
import { permLevels } from '../permissions';
import { Command } from "src/gm";
import fetch from "node-fetch";
import { MessageAttachment } from "discord.js";

export const command: Command = {
    name: "cheat",
    aliases: ["cht"],
    description: {
        short: "get answers from cheat.sh",
        long: "Use cheat.sh to get cheat sheet answers for various technical questions."
    },
    usage: "<query>",
    examples: [
        "js/how to create function",
        "js/how to create website",
        "python/how to define class"
    ],
    args: true,
    cooldown: 2,
    permLevel: permLevels.member,
    guildOnly: false,
    async execute(client, message, args) {
        try {
            const a = args.join(" ");
            const parts = a.split("/");
            if (parts[0] === "" || parts[0] === "/") {
                parts.shift();
            }
            if (!parts.length) {
                await client.specials.sendError(message.channel, "You must specify actual arguments.");
                return;
            }
            const r = await fetch(`https://cheat.sh/${a}?T`);
            const t = await r.text();

            const lang = parts.length > 1 ? parts[0] : "";
            await message.channel.send({
                files: [new MessageAttachment(Buffer.from(t, 'utf-8'), `cheat_sheet.${lang && lang.length < 20 ? lang : "txt"}`)],
            });
            // const lines = t.split("\n");
            // const groups: string[][] = [[]];
            // for (const line of lines) {
            //     const currGroup = groups[groups.length - 1];
            //     const joined = (currGroup.length ? `${currGroup.join("\n")}\n` : "") + line;
            //     if (joined.length < 2000 && currGroup.length < 18) {
            //         currGroup.push(line);
            //     } else {
            //         if (line.startsWith(" *") || line.startsWith("*")) {
            //             groups.push([line.replace(/ *\*/, "/*")]);
            //         } else {
            //             groups.push([line]);
            //         }
            //     }
            // }
            // const pages: MessageEmbed[] = [];
            // for (const group of groups) {
            //     const joined = group.join("\n");
            //     const e = new MessageEmbed().setColor(await client.database.getColor("info")).setDescription(`\`\`\`${lang || "prolog"}\n${joined}\n\`\`\``);
            //     pages.push(e);
            // }
            // PaginationExecutor.createEmbed(message, pages, undefined, true);
        } catch (error) {
            xlg.error(error);
            await client.specials?.sendError(message.channel);
            return false;
        }
    }
}
