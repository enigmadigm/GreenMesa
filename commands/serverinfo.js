const moment = require('moment');
const { getGlobalSetting } = require("../dbmanager");
const { getDayDiff } = require('../utils/time');
const xlg = require("../xlogger");

module.exports = {
    name: 'serverinfo',
    aliases: ['server'],
    async execute(client, message) {
        var date = new Date();
        var memberCount = message.guild.memberCount;
        var botCount = message.guild.members.cache.filter(member => member.user.bot).size;
        var age = getDayDiff(message.guild.createdTimestamp, date.getTime());
        message.channel.send({
            embed: {
                "color": parseInt((await getGlobalSetting('info_embed_color'))[0].value),
                "footer": {
                    "text": "ID: " + message.guild.id + ' | Region: ' + message.guild.region
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
                        "name": "Channel Categories",
                        "value": message.guild.channels.cache.filter(x => x.type == 'category').size,
                        "inline": true
                    },
                    {
                        "name": "Text Channels",
                        "value": message.guild.channels.cache.filter(x => x.type == 'text').size,
                        "inline": true
                    },
                    {
                        "name": "Voice Channels",
                        "value": message.guild.channels.cache.filter(x => x.type == 'voice').size,
                        "inline": true
                    },
                    {
                        "name": "Members",
                        "value": `${memberCount}\n(${memberCount - botCount} humans)`,
                        "inline": true
                    },
                    {
                        "name": "Bots",
                        "value": botCount,
                        "inline": true
                    },
                    {
                        "name": "Online",
                        "value": message.guild.members.cache.filter(member => member.presence.status == 'online').size,
                        "inline": true
                    },
                    {
                        "name": "Roles",
                        "value": message.guild.roles.cache.size,
                        "inline": true
                    },
                    {
                        "name": "Created",
                        "value": `${moment(message.guild.createdAt).format('ddd dd/mm/yyyy HH:MM:ss')}\n(${age} days ago)`,
                        "inline": true
                    }
                ]
            }
        }).catch(xlg.error);
    }
}