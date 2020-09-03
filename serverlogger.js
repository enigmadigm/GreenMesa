var { getGuildSetting, editGuildSetting } = require("./dbmanager");
const { stringToChannel } = require('./utils/parsers');
const Discord = require('discord.js')
const moment = require('moment')

async function getLogChannel(guild) {
    let logValue = await getGuildSetting(guild, 'server_log');
    let logChannel = logValue[0] && logValue[0].value ? stringToChannel(guild, logValue[0].value, false, false) : null;
    if (logValue && !logChannel) {
        editGuildSetting(guild, 'server_log', null, true);
        return null;
    }
    return logChannel;
}

async function logMember(member, joining) {
    let logChannel = await getLogChannel(member.guild);
    if (!logChannel || logChannel.type !== 'text') return;

    logChannel.send({
        embed: {
            "author": {
                "name": `Member ${joining ? 'Joined' : 'Left'}`,
                "icon_url": member.user.displayAvatarURL
            },
            "description": `${member}\n${member.nickname || "***No nickname***"}\n${member.user.tag}`,
            "color": joining ? 0x00ff00 : 0xff0000,
            "timestamp": new Date().toISOString(),
            "footer": {
                "text": `ID: ${member.id}`
            }
        }
    });
}

async function logMessageDelete(message) {
    let logChannel = await getLogChannel(message.guild);
    if (!logChannel || logChannel.type !== 'text') return;

    logChannel.send({
        embed: {
            "author": {
                "name": "Message Deleted",
                "icon_url": message.author.avatarURL
            },
            "description": `Message deleted in ${message.channel}\n${message.content || "*content not able to be shown*"}`,
            "timestamp": new Date().toISOString(),
            "footer": {
                "text": `Message ID: ${message.id} | Author ID: ${message.author.id}`
            }
        }
    });
}

async function logMessageBulkDelete(messageCollection) {
    let logChannel = await getLogChannel(messageCollection.first().guild);
    if (!logChannel || logChannel.type !== 'text') return;

    let humanLog = `**Deleted Messages from #${messageCollection.first().channel.name} (${messageCollection.first().channel.id}) in ${messageCollection.first().guild.name} (${messageCollection.first().guild.id})**`;
    for (const message of messageCollection.array().reverse()) {
        humanLog += `\r\n\r\n[${moment(message.createdAt).format()}] ${message.author.tag} (${message.id})`;
        humanLog += ' : ' + message.content;
        if (message.attachments.size) {
            humanLog += '\n*Attachments:*';
            humanLog += '\n*No cache found*'
        }
    }
    let attachment = new Discord.MessageAttachment(Buffer.from(humanLog, 'utf-8'), 'DeletedMessages.txt');

    let logMessage = await logChannel.send(attachment);
    logMessage.edit({
        embed: {
            "author": {
                "name": `${messageCollection.first().channel.name}`,
                "icon_url": messageCollection.first().guild.iconURL
            },
            "timestamp": new Date().toISOString(),
            "description": `**Bulk deleted messages in ${messageCollection.first().channel.toString()}**`,
            fields: [
                {
                    name: 'Message Count',
                    value: `${messageCollection.array().length} messages deleted`
                },
                {
                    name: 'Messages',
                    value: `[view](https://txt.discord.website/?txt=${logChannel.id}/${logMessage.attachments.first().id}/DeletedMessages)`
                }
            ]
        }
    });
}

exports.logMember = logMember;
exports.logMessageDelete = logMessageDelete;
exports.logMessageBulkDelete = logMessageBulkDelete;
