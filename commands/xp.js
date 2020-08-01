// NOTE: This whole xp system is in long-term development and needs work. The updates will probably come with a web console if there ever is one.
const { getGlobalSetting, getXP } = require("../dbmanager");
const xlg = require("../xlogger");
//const { getPermLevel } = require('../permissions');

module.exports = {
    name: 'xp',
    description: 'Get the current amount of xp for the person requested or the author of the message. This system is explained elsewhere, but it should be known that xp is earned by sending messages of any kind globally (on any server GreenMesa is in).',
    usage: "[other user]",
    async execute(client, message, args) {
        let target = message.mentions.users.first() || ((message.guild && message.guild.available) ? message.guild.members.cache.get(args[1]) : false) || message.author;

        let wec_gs = await getGlobalSetting("warn_embed_color");
        let rows = await getXP(message, target);
        let warn_embed_color = parseInt(wec_gs[0].value);
        let iec_gs = await getGlobalSetting("info_embed_color");

        if (!rows[0]) {
            return message.channel.send({
                embed: {
                    "title": "This user has no XP on record.",
                    "description": "To gain XP send messages in chat.",
                    "color": warn_embed_color || 16750899,
                    "timestamp": new Date(),
                    "footer": {
                        "text": this.name
                    }
                }
            }).catch(xlg.error);
        }

        message.channel.send({
            embed: {
                description: `${target} currently has ${rows[0].xp} xp`,
                color: parseInt(iec_gs[0].value) || 0
            }
        });
    }
}
