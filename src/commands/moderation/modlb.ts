import { permLevels } from '../../permissions.js';
import { Command, GuildMessageProps, ModActionData } from "src/gm";
import { MessageEmbed, MessageEmbedOptions } from 'discord.js';
import { PaginationExecutor } from '../../utils/pagination.js';
import { getDashboardLink, isSnowflake } from '../../utils/specials.js';

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
                await client.specials.sendError(message.channel)
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
                title: `Moderator Influence Leaderboard`,
                description: ``,
            }
            const pages: string[] = [""];
            let pi = 0;
            for (const d of groupings.sort((a,b) => b.cases.length - a.cases.length)) {
                const u = isSnowflake(d.mod) ? message.guild.members.cache.get(d.mod)?.user : undefined;
                const mod = d.mod ? u ? `${u.tag}${u.bot ? ` [BOT](${getDashboardLink()})` : ""}` : d.cases[0].agenttag : `anonymous#0000`;
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
