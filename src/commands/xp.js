// NOTE: This whole xp system is in long-term development and needs work. The updates will probably come with a web console if there ever is one.
const { getGlobalSetting, getXP } = require("../dbmanager");
const xlg = require("../xlogger");
//const { getPermLevel } = require('../permissions');

module.exports = {
    name: 'xp',
    description: 'Get the amount of xp someone has. Earn xp by sending any message in a guild with this bot. Points can only be generated once per minute for spam protection.',
    aliases: ['exp', 'orbs', 'level', 'points'],
    usage: "[other user]",
    guildOnly: true,
    category: 'fun',
    async execute(client, message, args) {
        try {
            let target = message.mentions.members.first() || ((message.guild && message.guild.available) ? message.guild.members.cache.get(args[0]) : false) || message.member || false;
            if (!target) return message.channel.send('Invalid target.');

            let rows = await getXP(target);
            
            let warn_embed_color = parseInt((await getGlobalSetting("warn_embed_color"))[0].value, 10);
            let info_embed_color = parseInt((await getGlobalSetting("info_embed_color"))[0].value, 10);

            let xpTypeGlobal = await getGlobalSetting('xp_type');


            if (!rows[0]) {
                return message.channel.send({
                    embed: {
                        "title": "This user has no XP on record.",
                        "description": "To gain XP send messages in chat.",
                        "color": warn_embed_color || 16750899,
                        "footer": {
                            "text": this.name
                        }
                    }
                }).catch(xlg.error);
            }

            message.channel.send({
                embed: {
                    description: `${target} currently has ${rows[0].xp} ${(xpTypeGlobal[0]) ? xpTypeGlobal[0].value : 'xp'} **⁛** level ${rows[0].level}`,
                    color: info_embed_color || 0
                }
            });
        } catch (error) {
            xlg.error(error);
            await client.specials.sendError(message.channel);
            return false;
        }
    }
}
