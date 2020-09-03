const moment = require('moment');
const { getGlobalSetting } = require("../dbmanager");
//const { getDayDiff } = require('../utils/time');
const xlg = require("../xlogger");

module.exports = {
    name: 'serverinfo',
    aliases: ['server'],
    cooldown: 8,
    async execute(client, message) {
        let createdAt = moment(message.guild.createdAt).utc();
        var memberCount = message.guild.memberCount;
        var botCount = message.guild.members.cache.filter(member => member.user.bot).size;
        message.channel.send({
            embed: {
                "color": parseInt((await getGlobalSetting('info_embed_color'))[0].value),
                "footer": {
                    "text": "ID: " + message.guild.id + ' | Region: ' + message.guild.region + ' | All dates in UTC'
                },
                "thumbnail": {
                    "url": message.guild.iconURL
                },
                "author": {
                    "name": message.guild.name,
                    "icon_url": message.guild.iconURL
                },
                "fields": [
                    {
                        "name": "Owner",
                        "value": message.guild.owner.toString(),
                        "inline": true
                    },
                    {
                        "name": "Members",
                        "value": `${memberCount}\n(${botCount} non-human)`,
                        "inline": true
                    },
                    {
                        "name": "Online",
                        "value": message.guild.members.cache.filter(member => member.presence.status == 'online').size,
                        "inline": true
                    },
                    {
                        "name": "Channels",
                        "value": `Categories: ${message.guild.channels.cache.filter(x => x.type == 'category').size}\nText: ${message.guild.channels.cache.filter(x => x.type == 'text').size}\nVoice: ${message.guild.channels.cache.filter(x => x.type == 'voice').size}`,
                        "inline": true
                    },
                    {
                        "name": "Roles",
                        "value": message.guild.roles.cache.size,
                        "inline": true
                    },
                    {
                        "name": "Created",
                        "value": `${createdAt.format('ddd M/D/Y HH:mm:ss')}\n(${createdAt.fromNow()})`,
                        "inline": true
                    }
                ]
            }
        }).catch(xlg.error);
    }
}