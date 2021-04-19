import { Command } from "src/gm";
import xlg from "../../xlogger";

export const command: Command = {
    name: "leaderboard",
    aliases: ['lb'],
    description: 'get rankings for xp in your guild',
    guildOnly: true,
    async execute(client, message) {
        try {
            if (!message.guild) return;
            const rowobj = await client.database.getTop10(message.guild.id, message.author.id);
            if (!rowobj || !rowobj.rows.length) {
                message.channel.send('No users');
                return;
            }
            const typeres = await client.database.getGlobalSetting('xp_type');
            let xptype = "";
            if (typeres) {
                xptype = typeres.value;
            }
            const joinedLb = rowobj.rows.map((row, i) => `${(row.userid == message.author.id) ? `[\`${(i + 1 < 10) ? (i + 1 + " ") : (i + 1)}\` ⫸](https://stratum.hauge.rocks "Your Rank")` : `**\`${(i + 1 < 10) ? (i + 1 + " ") : (i + 1)}\`** ⫸`} ${(message.guild && message.guild.available && message.guild.members.cache.get(row.userid)) ? message.guild.members.cache.get(row.userid) : 'user'} → ${row.xp} ${xptype}`);
            message.channel.send({
                embed: {
                    color: await client.database.getColor("info") || 6969,
                    author: {
                        name: 'Leaderboard',
                        icon_url: message.guild.iconURL() || client.user?.displayAvatarURL()
                    },
                    description: joinedLb.join("\n"),
                    footer: {
                        text: (rowobj.personal.rank > 10) ? `${message.member?.displayName}'s rank: ${rowobj.personal.rank}` : `top ten for this server`
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

