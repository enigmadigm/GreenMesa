import { permLevels } from '../../permissions.js';
import { Command } from "src/gm";
import { MessageEmbedOptions } from 'discord.js';
import { PaginationExecutor } from '../../utils/pagination.js';
import moment from 'moment';

const maxlen = 15;

export const command: Command = {
    name: "elders",
    aliases: ["eldest"],
    description: {
        short: "list oldest members",
        long: "List the oldest members in your server (by account age).",
    },
    flags: [
        {
            f: "h",
            d: "humans only",
        },
    ],
    cooldown: 3,
    permLevel: permLevels.member,
    guildOnly: true,
    async execute(client, message, args, flags) {
        const members = await message.guild.members.fetch();
        const orderedMembers = members.sort((a, b) => a.user.createdTimestamp > b.user.createdTimestamp ? 1 : -1);
        const humansFlag = flags.find(x => x.name === "h" && !x.value);
        const memberMap = orderedMembers
            .filter((x) => !humansFlag || !x.user.bot)
            .map((m) => {
            // const crea = moment(m.user.createdTimestamp);
            return `<t:${moment(m.user.createdTimestamp).unix()}> ${m}${m.user.bot ? " \\🤖" : ""}`;
        });

        const count = memberMap.length;
        const overflowArray: string[][] = [];
        let runs = 0;
        if (memberMap.length > maxlen || memberMap.join("\n").length > 1024) {
            while (memberMap.length) {
                runs++;
                if (runs > 10000) {
                    break;
                }
                const overRoles: string[] = [];
                while (overRoles.length <= maxlen && overRoles.join("\n").length <= 1024) {
                    overRoles.push(memberMap[0]);
                    memberMap.shift();
                }
                overflowArray.push(overRoles);
            }
        } else {
            overflowArray.push(memberMap);
        }

        const pages: MessageEmbedOptions[] = [];
        for (const page of overflowArray) {
            const e: MessageEmbedOptions = {
                color: await client.database.getColor("info"), //7322774
                author: {
                    name: `Elders of ${message.guild.name}`,
                    iconURL: message.guild.iconURL() || undefined
                },
                description: `${page.join("\n") || '*none*'}`,
                footer: {
                    text: `Members: ${count}`,
                },
            };
            pages.push(e);
        }

        await PaginationExecutor.createEmbed(message, pages);
    }
}
