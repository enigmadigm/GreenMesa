import { permLevels } from '../../permissions.js';
import { Command } from "src/gm";
import { stringToUser } from '../../utils/parsers.js';
import { Util } from 'discord.js';

export const command: Command = {
    name: 'mutualcount',
    description: 'count mutual servers for a member',
    permLevel: permLevels.botMaster,
    async execute(client, message, args) {
        try {
            const a = args.join(" ");
            const target = await stringToUser(client, a);
            if (!target) {
                await client.specials.sendError(message.channel, `That's no one I know of`, true);
                return;
            }
            const mutual = await client.specials.shards.getMutualGuilds(target.id);
            if (!mutual) {
                throw "Shard Unavailable";
            }
            const guildList = mutual.filter(x => 'name' in x).map((x) => {
                return `${x.owner === target.id ? "yes  " : "no   "} ${x.id} ${x.name.escapeDiscord()}`;
            });
            let formatted = `OWNER ID                 NAME`;
            for (const g of guildList) {
                formatted += `\n${g}`;
            }
            const splut = Util.splitMessage(formatted, { char: "\n" });
            for await (const s of splut) {
                await message.channel.send({
                    content: `\`\`\`${Util.cleanCodeBlockContent(s)}\`\`\``,
                });
            }
        } catch (e) {
            xlg.error(e);
            await client.specials.sendError(message.channel, `🔴 Execution Error:\n\`\`\`${e}\`\`\``);
        }
    }
}
