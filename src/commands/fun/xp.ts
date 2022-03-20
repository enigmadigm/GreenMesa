// NOTE: This whole xp system is in long-term development and needs work. The updates will probably come with a web console if there ever is one.
import { MessageAttachment, Permissions } from "discord.js";
import { Command } from "src/gm";
import { stringToMember } from "../../utils/parsers";
import { VACEFronJS } from 'vacefron';

const verbs = [
    "procured",
    "obtained",
    "earned",
    "collected",
    "bagged",
    "banked",
];

export const command: Command = {
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
            const queriedTarget = await stringToMember(message.guild, a, true, true, true);
            const target = queriedTarget || message.member;
            if (a && !queriedTarget) {
                await message.channel.send(`That's not a real target`);
                return;
            }

            const xp = await client.database.getFullPointsData(target);
            if (!xp) {
                await message.channel.send({
                    embeds: [{
                        title: "This user has no XP on record.",
                        description: "To gain XP send messages in chat.",
                        color: await client.database.getColor("warn"),
                    }],
                });
                return;
            }
            const personal = await client.database.getXPPersonal(message.guild.id, target.id);
            const xpTypeGlobal = await client.database.getGlobalSetting('xp_type');
            const sym = (xpTypeGlobal) ? xpTypeGlobal.value : 'exp';

            const bgColor = "1b3080";
            const xpColor = "FaFaFa";

            const percentToNext = Math.round(((xp.pointsLevelNext - xp.pointsToGo) / xp.pointsLevelNext) * 100);
            const pointsFromLevel = xp.pointsLevelNext - xp.pointsToGo;
            const pointsLevelNext = xp.pointsLevelNext;
            const pointsToNext = xp.pointsToGo;
            if (message.guild.me && message.channel.permissionsFor(message.guild.me).has(Permissions.FLAGS.ATTACH_FILES)) {
                const vac = new VACEFronJS();
                // old
                // const r = await fetch(`https://vacefron.nl/api/rankcard?username=${encodeURIComponent(target.user.tag)}&avatar=${encodeURIComponent(target.user.displayAvatarURL())}&currentxp=${xp.pointsInLevel}&nextlevelxp=${xp.pointsLevelNext}&previouslevelxp=${0}&level=${xp.level}&rank=${personal ? personal.rank : "undefined"}&custombg=${bgColor}&xpcolor=${xpColor}&isboosting=${target.premiumSince ? "true" : "false"}&circleavatar=true`);
                // new
                // const r = await fetch(`https://vacefron.nl/api/rankcard?username=${encodeURIComponent(target.user.tag)}&avatar=${encodeURIComponent(target.user.displayAvatarURL())}&currentxp=${xp.points}&nextlevelxp=${client.database.getCumulativePointsForLevel(xp.level + 1)}&previouslevelxp=${client.database.getCumulativePointsForLevel(xp.level)}&level=${xp.level}&rank=${personal ? personal.rank : "undefined"}&custombg=${bgColor}&xpcolor=${xpColor}&isboosting=${target.premiumSince ? "true" : "false"}&circleavatar=true`);
                // if (r.status !== 200) {
                //     const j = await r.json();
                //     throw new Error(`VACEfron API Not OK: ${j.status} (status ${j.code})`);
                // }
                // const b = await r.buffer();
                const r = await vac.rankCard(target.user.tag, target.user.displayAvatarURL(), bgColor, xp.level, personal ? personal.rank : -1, xp.points, client.database.getCumulativePointsForLevel(xp.level + 1), client.database.getCumulativePointsForLevel(xp.level), xpColor, false);
                const att = new MessageAttachment(r);
                await message.channel.send({ files: [att] });
            } else {
                await message.channel.send({
                    embeds: [{
                        color: await client.database.getColor("info"),
                        description: `**${target.displayName}** has ${verbs[Math.floor(Math.random() * verbs.length)]} **${sym}** \`${xp.points}\` total\n**Level:** \`${xp.level}\`\n**${sym}** \`${pointsToNext}\` more is needed for level \`${xp.level + 1}\`\n\`${pointsFromLevel}\` / \`${pointsLevelNext}\` (\`${percentToNext}\`%)`,
                    }],
                });
            }
        } catch (error) {
            xlg.error(error);
            await client.specials.sendError(message.channel);
            return false;
        }
    }
}
