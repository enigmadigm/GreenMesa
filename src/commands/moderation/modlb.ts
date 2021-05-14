import { permLevels } from '../../permissions';
import { Command, GuildMessageProps, ModActionData } from "src/gm";
import { MessageEmbed, MessageEmbedOptions } from 'discord.js';
import { PaginationExecutor } from '../../utils/pagination';

export const command: Command<GuildMessageProps> = {
    name: "modlb",
    aliases: ["modslb"],
    description: {
        short: "get a leaderboard for mod actions",
        long: "Get a leaderboard of mods ranked by the number of actions they have."
    },
    args: false,
    cooldown: 1,
    permLevel: permLevels.mod,
    moderation: true,
    guildOnly: true,
    permissions: ["USE_EXTERNAL_EMOJIS"],
    async execute(client, message) {
        try {
            const list = await client.database.getModActions({ guildid: message.guild.id });
            if (!list || !list.length) {
                client.specials.sendError(message.channel)
                return;
            }
            const groupings: { mod: string, cases: ModActionData[] }[] = [];
            for (const incident of list) {
                const pre = groupings.find(x => x.mod === incident.agent);
                if (pre) {
                    pre.cases.push(incident);
                } else {
                    groupings.push({
                        mod: incident.agent,
                        cases: [incident],
                    });
                }
            }
            const embed: MessageEmbedOptions = {
                color: await client.database.getColor("info"),
                author: {
                    name: `Moderator Influence Leaderboard`,
                    iconURL: "https://canary.discord.com/assets/dac778e8126fd5f96b6511d7ad8ffec1.svg",
                },
                description: ``,
            }
            const pages: string[] = [""];
            let pi = 0;
            for (const d of groupings) {
                const mod = d.mod ? message.guild.members.cache.get(d.mod)?.user.tag || d.cases[0].agenttag : `anonymous#0000`;
                const a = `(${d.cases.length} actions) ${mod}`;
                if (`${pages[pi]}\n${a}`.length > 512) {
                    pi++;
                    pages[pi] = a;
                } else {
                    pages[pi] += `\n${a}`;
                }
            }
            const embeds: MessageEmbed[] = [];
            for (const page of pages) {
                embeds.push(new MessageEmbed(embed).setDescription(embed.description + page));
            }
            PaginationExecutor.createEmbed(message, embeds, undefined, true);
        } catch (error) {
            xlg.error(error);
            await client.specials?.sendError(message.channel);
            return false;
        }
    }
}
