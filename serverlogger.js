var { getGlobalSetting, getGuildSetting, editGuildSetting } = require("./dbmanager");
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

    let embed = {
        embed: {
            "author": {
                "name": `Member ${joining ? 'Joined' : 'Left'}`,
                "icon_url": member.user.displayAvatarURL()
            },
            "description": `${member.user.tag} (${member})${!joining ? `\n ${member.nickname || "***No nickname***"}` : ''}`,
            "fields": [
                {
                    "name": `${joining ? 'Created' : 'Joined'}`,
                    "value": `(${joining ? moment(member.user.createdAt).utc().format('ddd M/D/Y HH:mm:ss') : moment(member.joinedAt).utc().format('ddd M/D/Y HH:mm:ss')}) **${joining ? moment(member.user.createdAt).utc().fromNow() : moment(member.joinedAt).utc().fromNow()}**`
                }
            ],
            "color": joining ? 0x00ff00 : 0xff0000,
            "timestamp": joining ? member.joinedAt : new Date(),
            "footer": {
                "text": `ID: ${member.id}`
            }
        }
    };
    logChannel.send(embed).catch(console.error);
}

async function logMessageDelete(message) {
    let logChannel = await getLogChannel(message.guild);
    if (!logChannel || logChannel.type !== 'text') return;
    if (logChannel.id === message.channel.id) return;
    if (message.author.id == message.client.user.id) return;
    // shorten message if it's longer then 1024 (thank you bulletbot)
    let shortened = false;
    let content = message.content;
    if (content.length > 1024) {
        content = content.slice(0, 1020) + '...';
        shortened = true;
    }

    logChannel.send({
        embed: {
            "color": parseInt((await getGlobalSetting('fail_embed_color'))[0].value, 10) || 0xff0000,
            "author": {
                "name": "Message Deleted",
                "icon_url": message.author.displayAvatarURL()
            },
            "description": `message by ${message.author} deleted in ${message.channel}\nmessage created ${moment(message.createdAt).utc().fromNow()}`,
            "fields": [
                {
                    name: 'Content' + (shortened ? ' (shortened)' : ''),
                    value: message.content.length > 0 ? content : '*content unavailable*'
                }
            ],
            "timestamp": new Date(message.createdAt).toISOString(),
            "footer": {
                "text": `Message ID: ${message.id} | Author ID: ${message.author.id}`
            }
        }
    });
}

async function logMessageBulkDelete(messageCollection) {
    let logChannel = await getLogChannel(messageCollection.first().guild);
    if (!logChannel || logChannel.type !== 'text') return;
    if (logChannel.id === messageCollection.first().channel.id) return;

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
            "color": parseInt((await getGlobalSetting('fail_embed_color'))[0].value, 10) || 0xff0000,
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

async function logMessageUpdate(omessage, nmessage) {
    if (omessage.content == nmessage.content) return;
    let logChannel = await getLogChannel(nmessage.guild);
    if (!logChannel || logChannel.type !== 'text') return;
    if (logChannel.id === nmessage.channel.id) return;
    if (nmessage.author.id == nmessage.client.user.id) return;

    // shorten both messages when the content is larger then 1024 chars
    let oldShortened = false;
    let oldContent = omessage.content;
    if (oldContent.length > 1024) {
        oldContent = oldContent.slice(0, 1020) + '...';
        oldShortened = true;
    }
    let newShortened = false;
    let newContent = nmessage.content;
    if (newContent.length > 1024) {
        newContent = newContent.slice(0, 1020) + '...';
        newShortened = true;
    }

    logChannel.send({
        embed: {
            author: {
                name: "Message Edited",
                icon_url: nmessage.author.displayAvatarURL()
            },
            description: `**[m.](${nmessage.url})** edited in ${nmessage.channel} by ${nmessage.author}\n**[m.](${nmessage.url})** created ${moment(omessage.createdAt).utc().fromNow()}\n[${moment(omessage.createdAt).utc().format('M/D/Y HH:mm:ss')}]`,
            fields: [
                {
                    name: "Before" + (oldShortened ? ' (shortened)' : ''),
                    value: `${omessage.content.length > 0 ? omessage.content : '*content unavailable*'}`
                },
                {
                    name: "After" + (newShortened ? ' (shortened)' : ''),
                    value: `${nmessage.content.length > 0 ? nmessage.content : '*content unavailable*'}`
                }
            ],
            footer: {
                text: `Msg ID: ${nmessage.id} | Author ID: ${nmessage.author.id}`
            }
        }
    });
}

async function logRole(role, deletion = false) {
    let logChannel = await getLogChannel(role.guild);
    if (!logChannel || logChannel.type !== 'text') return;

    try {
        await logChannel.send({
            embed: {
                author: {
                    name: `Role ${deletion ? 'Deleted' : 'Created'}`,
                    icon_url: role.guild.iconURL()
                },
                description: `${deletion ? `@${role.name} (${role.hexColor})` : `${role}\nName: ${role.name}\nColor: ${role.hexColor}`}${deletion ? "\n created " + moment(role.createdAt).utc().fromNow() : ''}`,
                color: deletion ? parseInt((await getGlobalSetting('fail_embed_color'))[0].value, 10) || 0xff0000 : parseInt((await getGlobalSetting('success_embed_color'))[0].value, 10),
                timestamp: deletion ? role.createdAt : new Date(),
                footer: {
                    text: "Role ID: " + role.id
                }
            }
        });
    } catch (e) {
        return; // acording to bb devs: very likely just left the server and the bot specific role got deleted
    }
}

async function logChannelState(channel, deletion = false) {
    let logChannel = await getLogChannel(channel.guild);
    if (!logChannel || logChannel.type !== 'text') return;
    
    await logChannel.send({
        embed: {
            author: {
                name: `${channel.type === 'category' ? "Category" : "Channel"} ${deletion ? 'Deleted' : 'Created'}`,
                icon_url: channel.guild.iconURL()
            },
            description: `${deletion ? `#${channel.name}` : `${channel || channel.name}`} (${channel.type})${deletion ? "\n created " + moment(channel.createdAt).utc().fromNow() : ''}`,
            color: deletion ? parseInt((await getGlobalSetting('fail_embed_color'))[0].value, 10) || 0xff0000 : parseInt((await getGlobalSetting('success_embed_color'))[0].value, 10),
            timestamp: deletion ? channel.createdAt : new Date(),
            footer: {
                text: "Channel ID: " + channel.id
            }
        }
    });
}

exports.logMember = logMember;
exports.logMessageDelete = logMessageDelete;
exports.logMessageBulkDelete = logMessageBulkDelete;
exports.logMessageUpdate = logMessageUpdate;
exports.logRole = logRole;
exports.logChannelState = logChannelState;
