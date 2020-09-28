const xlg = require("../xlogger");
const { getTop10, getGlobalSetting } = require('../dbmanager');

module.exports = {
    name: "leaderboard",
    aliases: ['lb'],
    description: 'get rankings for xp in your guild',
    guildOnly: true,
    category: 'fun',
    async execute(client, message) {
        let rowobj = await getTop10(message.guild.id, message.author.id);
        if (!rowobj.rows.length) return message.channel.send('No users');
        let xptype = (await getGlobalSetting('xp_type'))[0].value;
        let joinedLb = rowobj.rows.map((row, i) => `${(row.userid == message.author.id) ? `[**\`${i + 1}\`** ⫸](https://stratum.hauge.rocks)` : `**\`${(i + 1 < 10) ? (i + 1) : (i + 1 + " ")}\`** ⫸` } ${(message.guild && message.guild.available && message.guild.members.cache.get(row.userid)) ? message.guild.members.cache.get(row.userid) : 'user'} ❖ ${row.xp} ${xptype}`);
        message.channel.send({
            embed: {
                color: parseInt((await getGlobalSetting('info_embed_color'))[0].value) || 6969,
                author: {
                    name: 'Leaderboard',
                    icon_url: message.guild.iconURL() || client.user.displayAvatarURL()
                },
                description: joinedLb.join("\n"),
                footer: {
                    text: (rowobj.personal.rank > 10) ? `${message.member.displayName}'s rank: ${rowobj.personal.rank || "none"}` : `top ten for this server`
                }
            }
        }).catch(xlg.error)
    }
}