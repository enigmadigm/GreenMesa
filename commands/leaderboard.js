const xlg = require("../xlogger");
const { getTop10 } = require('../dbmanager');

module.exports = {
    name: "leaderboard",
    aliases: ['lb'],
    description: 'get rankings for xp in your guild',
    guildOnly: true,
    async execute(client, message) {
        let rowobj = await getTop10(message.guild.id, message.author.id);
        if (!rowobj.rows.length) return message.channel.send('No users');
        let joinedLb = rowobj.rows.map((row, i) => `**${i + 1}** ⁞⁞ ${(message.guild && message.guild.available && message.guild.members.cache.get(row.userid)) ? message.guild.members.cache.get(row.userid) : 'user'} 💎 ${row.xp}`);
        message.channel.send({
            embed: {
                author: {
                    name: 'Leaderboard',
                    icon_url: message.guild.iconURL() || client.user.displayAvatarURL()
                },
                description: joinedLb.join("\n"),
                footer: {
                    text: `${message.member.displayName}'s rank: ${rowobj.personal.rank || "none"}`
                }
            }
        }).catch(xlg.error)
    }
}