// NOTE: This whole xp system is in long-term development and needs work. The updates will probably come with a web console if there ever is one.
import { Command, GuildMessageProps } from "src/gm";
import { stringToMember } from "../../utils/parsers";

const verbs = [
    "procured",
    "obtained",
    "earned",
    "collected",
    "bagged",
    "banked",
]

export const command: Command<GuildMessageProps> = {
    name: 'xp',
    description: {
        short: "get someone's xp stats",
        long: 'Get the amount of xp someone has. Earn xp by sending any message in a guild with this bot. Points can only be generated once per minute for spam protection.'
    },
    aliases: ['rank', 'level'],
    usage: "[other user]",
    guildOnly: true,
    async execute(client, message, args) {
        try {
            const a = args.join(" ");
            const target = await stringToMember(message.guild, a, true, true, true);
            if (!target) {
                await message.channel.send(`That's not a real target`);
                return;
            }

            const xp = await client.database.getFullPointsData(target);
            const xpTypeGlobal = await client.database.getGlobalSetting('xp_type');
            const sym = (xpTypeGlobal) ? xpTypeGlobal.value : 'exp';

            if (!xp) {
                message.channel.send({
                    embed: {
                        title: "This user has no XP on record.",
                        description: "To gain XP send messages in chat.",
                        color: await client.database.getColor("warn"),
                    }
                });
                return;
            }

            message.channel.send({
                embed: {
                    color: await client.database.getColor("info"),
                    description: `**${target.displayName}** has ${verbs[Math.floor(Math.random() * verbs.length)]} **${sym} ${xp.points}** total at level **${xp.level}**.\n**${sym} ${xp.pointsToGo}** more is needed for level **${xp.level + 1}**.\n${xp.pointsLevelNext - xp.pointsToGo}/${xp.pointsLevelNext} (${Math.round(((xp.pointsLevelNext - xp.pointsToGo) / xp.pointsLevelNext) * 100)}%)`,
                    footer: {
                        text: ``
                    }
                }
            });
        } catch (error) {
            xlg.error(error);
            await client.specials?.sendError(message.channel);
            return false;
        }
    }
}
