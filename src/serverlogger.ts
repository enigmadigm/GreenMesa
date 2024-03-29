import { stringToChannel, combineMessageText } from './utils/parsers.js';
import Discord, { Collection, DMChannel, Guild, GuildChannel, GuildEmoji, GuildMember, Message, MessageEmbedOptions, Role, TextChannel, ThreadChannel } from 'discord.js';
import moment from 'moment';
import { Bot } from './bot.js';
import { ServerlogData } from './gm';
import { ChannelTypeKey } from './utils/specials.js';

const LoggingFlags = {
    MEMBER_STATE: 1 << 0,
    MESSAGE_DELETION: 1 << 1,
    MESSAGE_UPDATE: 1 << 2,
    ROLE_CREATION: 1 << 3,
    ROLE_DELETION: 1 << 4,
    CHANNEL_CREATION: 1 << 5,
    CHANNEL_DELETION: 1 << 6,
    CHANNEL_UPDATE: 1 << 7,
    EMOJI_CREATION: 1 << 8,
    EMOJI_DELETION: 1 << 9,
    NICKNAME_UPDATE: 1 << 10,
    MEMBER_UPDATE: 1 << 11,
    VOICE_ANY: 1 << 12,
    OTHER_EVENTS: 1 << 13,
    ALL_EVENTS: 1 << 14,
    // _: 1n << 14n,
    // _: 1n << 15n,
    // _: 1n << 16n,
    // _: 1n << 17n,
    // _: 1n << 18n,
    // _: 1n << 19n,
    // _: 1n << 20n,
};

async function getLogChannel(guild: Guild, address: number, category: 'log_channel' | 'member_channel' | 'server_channel' | 'voice_channel' | 'messages_channel' | 'movement_channel', channel?: GuildChannel | ThreadChannel): Promise<TextChannel | false> {
    try {
        if (!guild) return false;
        const logValue = await Bot.client.database.getGuildSetting(guild, 'serverlog');
        if (!logValue) {
            return false;
        }
        const logging: ServerlogData = JSON.parse(logValue.value);
        if (!logging.events || ((logging.events & LoggingFlags.ALL_EVENTS) !== LoggingFlags.ALL_EVENTS && (logging.events & address) !== address)) {
            return false;
        }
        const logID = logging[category] || logging.log_channel || false;
        if (logID) {
            const logChannel = stringToChannel(guild, logID, false, false);
            if (logChannel && logChannel instanceof TextChannel) {
                if (channel && logging.ignored_channels && logging.ignored_channels.includes(channel.id)) {
                    return false;
                }
                return logChannel;
            }
        }
        return false;
        // const logChannel = logValue && logValue.value ? stringToChannel(guild, logValue.value, false, false) : null;
        // if (logValue && (!logChannel || !(logChannel instanceof TextChannel))) {
        //     Bot.client.database.editGuildSetting(guild, 'server_log', undefined, true);
        //     return false;
        // }
        // if (!logChannel || !(logChannel instanceof TextChannel)) {
        //     return false;
        // }
    } catch (error) {
        xlg.error(error);
        return false;
    }
}

export async function logMember(member: GuildMember, joining: boolean): Promise<void> {
    try {
        if (!joining) {
            await Bot.client.database.updateGuildUserData({
                roles: member.roles.cache.map(r => r.id).join(",")
            });
        }

        const logChannel = await getLogChannel(member.guild, LoggingFlags.MEMBER_STATE, "movement_channel");
        if (!logChannel) return;

        
        // "color": joining ? 0x00ff00 : 0xff0000,
        await logChannel.send({
            embeds: [{
                author: {
                    name: `Member ${joining ? 'Joined' : 'Left'}`,
                    iconURL: member.user.displayAvatarURL()
                },
                description: `${member.user.tag.escapeDiscord()} (${member})${!joining ? `\n ${member.nickname ? member.nickname.escapeDiscord() : "***No nickname***"}` : ''}`,
                fields: [
                    {
                        name: `${joining ? 'Created' : 'Joined'}`,
                        value: `(${joining ? moment(member.user.createdAt).utc().format('ddd M/D/Y HH:mm:ss') : moment(member.joinedAt).utc().format('ddd M/D/Y HH:mm:ss')}) **${joining ? moment(member.user.createdAt).utc().fromNow() : moment(member.joinedAt).utc().fromNow()}**`,
                        inline: false,
                    },
                ],
                color: joining ? await Bot.client.database.getColor("success") : await Bot.client.database.getColor("fail"),
                timestamp: joining ? member.joinedAt?.getTime() || new Date().getTime() : new Date().getTime(),
                footer: {
                    text: `ID: ${member.id}`
                }
            }]
        })
    } catch (err) {
        xlg.error(err)
    }
}

export async function logMessageDelete(message: Message): Promise<void> {// add attachment cache system (posts all deleted attachments in a specific channel in the server and uses the link to that attachment in the msg log) 
    //TODO: NEW PROPOSITION: USE rooskie.is-a-virg.in temp cdn
    try {
        if (!message.guild || message.channel.type === "DM") return;
        const logChannel = await getLogChannel(message.guild, LoggingFlags.MESSAGE_DELETION, "messages_channel", message.channel);
        if (!logChannel) return;
        //if (logChannel.id === message.channel.id) return;
        if (message.author.id === message.client.user?.id) return;
        // shorten message if it's longer then 1024 (thank you bulletbot)
        let shortened = false;
        let content = combineMessageText(message);
        if (content.length > 1024) {
            content = content.slice(0, 1020) + '...';
            shortened = true;
        }
        const embed: MessageEmbedOptions = {
            // "color": await Bot.client.database.getColor("fail") || 0xff0000,
            author: {
                name: "Message Deleted",
                icon_url: message.author.displayAvatarURL(),
            },
            description: `by ${message.author} in ${message.channel}\ncreated ${moment(message.createdAt).utc().fromNow()}`,
            fields: [],
            timestamp: new Date(message.createdAt),
            footer: {
                text: `Message ID: ${message.id} | Author ID: ${message.author.id}`,
            },
        };

        if (message.attachments.size) {
            let images = 0;
            let other = 0;
            embed.fields?.push({
                name: `Attachments [${message.attachments.size}]`,
                value: `${message.attachments.sort((p) => p.height || p.attachment ? -1 : 1).map((a) => {
                    if (a.height || a.width) {
                        images += 1;
                    } else {
                        other += 1;
                    }
                    const name = a.name?.split(".");
                    return `[${a.height || a.width ? "Image" : "Attachment"} ${a.height || a.width ? images : other}](${a.url})${name ? ` (${name[name.length - 1]})` : ""}`;
                })}`,
            });
        }

        if (!embed.fields?.length || content) {
            embed.fields?.push({
                name: 'Content' + (shortened ? ' (shortened)' : ''),
                value: content.length > 0 ? content.escapeDiscord() : '*content unavailable*',
            });
        }

        logChannel.send({ embeds: [embed] });
    } catch (err) {
        xlg.error(err);
    }
}

export async function logMessageBulkDelete(messageCollection: Collection<string, Message | Discord.PartialMessage>): Promise<void> {
    try {
        const first = messageCollection.first();
        if (!first || !first.guild || first.channel.type == "DM") return;
        if (messageCollection instanceof DMChannel || first.channel instanceof DMChannel) return;
        const logChannel = await getLogChannel(first.guild, LoggingFlags.MESSAGE_DELETION, "messages_channel", first.channel);
        if (!logChannel) return;
        if (logChannel.id === messageCollection.first()?.channel.id) return;
    
        let humanLog = `**Deleted Messages from #${first.channel.name} (${first.channel.id}) in ${first.guild.name} (${first.guild.id})**`;
        for (const message of [...messageCollection.values()].reverse()) {
            humanLog += `\r\n\r\n[${moment(message.createdAt).format()}] ${message.author?.tag.replace("*", "⁎").replace("_", "\\_").replace("`", "\\`")} (${message.id})`;
            humanLog += ' : ' + message.content;
            if (message.attachments.size) {
                humanLog += '\n*Attachments:*';
                humanLog += '\n*No cache found*'
            }
        }
        const attachment = new Discord.MessageAttachment(Buffer.from(humanLog, 'utf-8'), 'DeletedMessages.txt');
    
        const logMessage = await logChannel.send({ files: [attachment] });
        await logMessage.edit({
            embeds: [{
                color: await Bot.client.database.getColor("warn_embed_color") || 0xff0000,
                author: {
                    name: `${first.channel.name}`,
                    icon_url: first.guild.iconURL() || ""
                },
                timestamp: new Date(),
                description: `**Bulk deleted messages in ${first.channel.toString()}**`,
                fields: [
                    {
                        name: 'Message Count',
                        value: `${[...messageCollection.values()].length} messages deleted`
                    },
                    {
                        name: 'Messages',
                        value: `[view](https://txt.discord.website/?txt=${logChannel.id}/${logMessage.attachments.first()?.id}/DeletedMessages)`
                    }
                ]
            }]
        });
    } catch (err) {
        xlg.error(err);
    }
}

export async function logMessageUpdate(omessage: Message, nmessage: Message): Promise<void> {
    try {
        if (omessage.content == nmessage.content || !nmessage.guild || nmessage.channel.type === "DM") return;
        const logChannel = await getLogChannel(nmessage.guild, LoggingFlags.MESSAGE_DELETION, "messages_channel", nmessage.channel);
        if (!logChannel) return;
        if (logChannel.id === nmessage.channel.id) return;
        if (nmessage.author.id == nmessage.client.user?.id) return;
    
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
            embeds: [{
                author: {
                    name: "Message Edited",
                    icon_url: nmessage.author.displayAvatarURL()
                },
                description: `**[m.](${nmessage.url})** edited in ${nmessage.channel} by ${nmessage.author}\n**[m.](${nmessage.url})** created ${moment(omessage.createdAt).utc().fromNow()}\n[${moment(omessage.createdAt).utc().format('M/D/Y HH:mm:ss')}]`,
                fields: [
                    {
                        name: `Before ${oldShortened ? ' (shortened)' : ''}`,
                        value: `${omessage.content.length > 0 ? oldContent : '*content unavailable*'}`
                    },
                    {
                        name: `After ${newShortened ? ' (shortened)' : ''}`,
                        value: `${nmessage.content.length > 0 ? newContent : '*content unavailable*'}`
                    }
                ],
                footer: {
                    text: `Msg ID: ${nmessage.id} | Author ID: ${nmessage.author.id}`
                }
            }]
        });
    } catch (err) {
        xlg.error(err);
    }
}

export async function logRole(role: Role, deletion = false): Promise<void> {
    try {
        const logChannel = await getLogChannel(role.guild, deletion ? LoggingFlags.ROLE_DELETION : LoggingFlags.ROLE_CREATION, "server_channel");
        if (!logChannel || logChannel.type !== "GUILD_TEXT") return;
    
        try {
            await logChannel.send({
                embeds: [{
                    author: {
                        name: `Role ${deletion ? 'Deleted' : 'Created'}`,
                        iconURL: role.guild.iconURL() || ""
                    },
                    description: `${deletion ? `@${role.name} (${role.hexColor})` : `${role}\nName: ${role.name}\nColor: ${role.hexColor}`}${deletion ? "\n created " + moment(role.createdAt).utc().fromNow() : ''}`,
                    color: deletion ? await Bot.client.database.getColor("fail") || 0xff0000 : await Bot.client.database.getColor("success"),
                    timestamp: deletion ? role.createdAt : new Date(),
                    footer: {
                        text: `Role ID: ${role.id}`,
                    },
                }]
            });
        } catch (e) {
            return; // very likely occurring because this client just left the server and its bot specific role got deleted (which is what triggered this event)
        }
    } catch (err) {
        xlg.error(err);
    }
}

export async function logRoleUpdate(previousrole: Role, currentRole: Role): Promise<void> {
    try {
        const logChannel = await getLogChannel(currentRole.guild, LoggingFlags.OTHER_EVENTS, "server_channel");
        if (!logChannel || logChannel.type !== "GUILD_TEXT") return;

        if (previousrole.name !== currentRole.name) {
            await logChannel.send({
                embeds: [{
                    color: await Bot.client.database.getColor("warn_embed_color"),
                    timestamp: new Date(),
                    author: {
                        name: `Role Name Updated`,
                        iconURL: currentRole.guild.iconURL() || ""
                    },
                    description: `${currentRole}`,
                    fields: [
                        {
                            name: `Previous`,
                            value: `${previousrole.name}`,
                            inline: true
                        },
                        {
                            name: `Updated`,
                            value: `${currentRole.name}`,
                            inline: true
                        }
                    ],
                    footer: {
                        text: `Role ID: ${currentRole.id}`
                    },
                }]
            });
        }
    } catch (err) {
        xlg.error(err);
    }
}

export async function logChannelState(channel: GuildChannel, deletion = false): Promise<void> {
    try {
        const logChannel = await getLogChannel(channel.guild, deletion ? LoggingFlags.CHANNEL_DELETION : LoggingFlags.CHANNEL_CREATION, "server_channel", channel);
        if (!logChannel) return;
        const nameref = channel.name ? ` (${channel.name})` : "";
        const titletyperef = channel.type !== "GUILD_CATEGORY"/*  && channel.type in ChannelTypeKey */ ? `${ChannelTypeKey[channel.type]/* capitalize(channel.type) */} ` : "";

        await logChannel.send({
            embeds: [{
                title: `${deletion ? "<:trashcan:828153494858366997>" : (channel.type in ChannelTypeKey ? ChannelTypeKey[channel.type] : "")} ${titletyperef}${channel.type === "GUILD_CATEGORY" ? "Category" : "Channel"} ${deletion ? 'Deleted' : 'Created'}`,
                description: `${deletion ? `#${channel.name}` : `${channel}`}${nameref}${deletion ? "\n created " + moment(channel.createdAt).utc().fromNow() : ''}`,
                color: deletion ? await Bot.client.database.getColor("fail") || 0xff0000 : await Bot.client.database.getColor("success"),
                timestamp: deletion ? channel.createdAt : new Date(),
                footer: {
                    text: "Channel ID: " + channel.id
                }
            }]
        });
    } catch (err) {
        xlg.error(err);
    }
}

/**
 * grouping of all types of change in channels
 */
export async function logChannelUpdate(oc: GuildChannel, nc: GuildChannel): Promise<void> {//FIXME: this event is so incredibly broken, specifically the perms update
    try {
        const logChannel = await getLogChannel(nc.guild, LoggingFlags.CHANNEL_UPDATE, "server_channel", nc);
        if (!logChannel || !(logChannel instanceof Discord.TextChannel)) return;
        if (!(oc instanceof Discord.GuildChannel) || !(nc instanceof Discord.GuildChannel)) return;

        if (oc.name !== nc.name) {//change of channel name
            await logChannel.send({
                embeds: [{
                    color: await Bot.client.database.getColor("warn_embed_color"),
                    timestamp: new Date(),
                    author: {
                        name: `Channel Name Updated`,
                        iconURL: logChannel.guild.iconURL() || ""
                    },
                    description: `${nc}`,
                    fields: [
                        {
                            name: `Previous`,
                            value: `${oc.name}`,
                            inline: true
                        },
                        {
                            name: `Updated`,
                            value: `${nc.name}`,
                            inline: true
                        }
                    ]
                }]
            });
        }

        /*const co = [];
        for (const over of nc.permissionOverwrites) {
            //console.log(JSON.stringify(over))
            const common = {
                allow: [],
                deny: [],
            }

            for (const over2 of oc.permissionOverwrites) {
                // ...
            }
        }*/
        
        // https://github.com/CodeBullet-Community/BulletBot/blob/d5e8f7f5e6649f6b552e4ad7fe5c31f6aa42b1b8/src/megalogger.ts#L125
        // I am going to be honest here, I have no idea as to how this works. That's why I had to take the code from elsewhere.
        // get permission difference between the old and new channel
        const permDiff = oc.permissionOverwrites.cache.filter(x => {
            if (nc.permissionOverwrites.cache.find(y => y.allow.bitfield == x.allow.bitfield && x.id === y.id) && nc.permissionOverwrites.cache.find(y => y.deny.bitfield == x.deny.bitfield && y.id === x.id))
                return false;
            return true;
        }).concat(nc.permissionOverwrites.cache.filter(x => {
            if (oc.permissionOverwrites.cache.find(y => y.deny.bitfield == x.allow.bitfield) && oc.permissionOverwrites.cache.find(y => y.deny.bitfield == x.deny.bitfield))
                return false;
            return true;
        }));
        if (permDiff.size) {
            for (const id of permDiff.keys()) {
                const oldPerm = oc.permissionOverwrites.cache.get(id);
                const newPerm = nc.permissionOverwrites.cache.get(id);
                if (!oldPerm || !newPerm) return;
                const oldBitfield = {
                    allow: oldPerm.allow.bitfield,
                    deny: oldPerm.deny.bitfield
                }
                const newBitfield = {
                    allow: newPerm.allow.bitfield,
                    deny: newPerm.deny.bitfield
                }
                const subject = oldPerm.type == 'role' || newPerm.type == 'role' ? nc.guild.roles.cache.get(newPerm.id || oldPerm.id) : await nc.guild.members.fetch(newPerm.id || oldPerm.id);

                const embed = {
                    color: await Bot.client.database.getColor("warn_embed_color"),
                    timestamp: new Date(),
                    author: {
                        name: `Channel Permissions Changed`,
                        iconURL: logChannel.guild.iconURL() || ""
                    },
                    description: `In channel: ${nc}\nPermissions updated for: \`${(subject instanceof Role ? subject.name.escapeDiscord() : subject instanceof GuildMember ? subject.user.tag.escapeDiscord() : "unknown")}\``,
                    footer: {
                        text: `Channel ID: ${nc.id}`
                    },
                };
                
                let didsomething = false;
                if (oldBitfield.allow !== newBitfield.allow && newBitfield.allow !== 0n) {
                    const flgs = new Discord.Permissions(newBitfield.allow).remove(oldBitfield.allow);
                    embed.description += `\n**Allowed:**\n${flgs.toArray().map(x => x.toLowerCase().replace("_", " ")).join(", ")}`;
                    didsomething = true;
                    //console.log("arr: "+flgs.toArray());

                    // VVV I started something below this and then stopped when I realized I could just do bit math
                    /*const flgs2 = new Discord.Permissions(newBitfield.allow).toArray();
                    for (const f of flgs) {
                        
                    }*/
                }
                if (oldBitfield.deny !== newBitfield.deny && newBitfield.deny !== 0n) {
                    const flgs = new Discord.Permissions(newBitfield.deny).remove(oldBitfield.deny);// i think newbit & oldbit would also work
                    embed.description += `\n**Denied:**\n${flgs.toArray().map(x => x.toLowerCase().replace("_", " ")).join(", ")}`;
                    didsomething = true;
                }
                // VVV Didn't work
                /*const tb = new Discord.Permissions(newBitfield.allow).add(newBitfield.deny).remove(oldBitfield.allow).remove(oldBitfield.deny).missing();
                console.log(tb)
                if (tb.length) {
                    embed.description += `\n**Neutralized:**\n${tb.map(x => x.toLowerCase().replace("_", " ")).join(", ")}`;
                }*/

                if (didsomething) {
                    await logChannel.send({ embeds: [embed] });
                }
            }
        }
    } catch (err) {
        xlg.error(err);
    }
}

export async function logEmojiState(emoji: GuildEmoji, deletion = false): Promise<void> {
    try {
        const logChannel = await getLogChannel(emoji.guild, deletion ? LoggingFlags.EMOJI_DELETION : LoggingFlags.EMOJI_CREATION, "server_channel");
        if (!logChannel || logChannel.type !== "GUILD_TEXT" || !(emoji instanceof Discord.GuildEmoji)) return;

        let creator = null;
        if (!deletion) {
            creator = await emoji.fetchAuthor();
        }

        await logChannel.send({
            embeds: [{
                author: {
                    name: `Emoji ${deletion ? 'Removed' : 'Added'}`,
                    iconURL: logChannel.guild.iconURL() || ""
                },
                color: await Bot.client.database.getColor("info"),
                image: {
                    url: emoji.url,
                },
                description: `${deletion ? "created " + moment(emoji.createdAt).utc().fromNow() : `${creator ? `Created by: ${emoji.author?.tag}` : ""}`}`,
                footer: {
                    text: `Usage: :${emoji.name}:`
                },
                timestamp: deletion ? emoji.createdAt : new Date(),
            }]
        });
    } catch (err) {
        xlg.error(err);
    }
}

/**
 * Checks for nickname change in a guildmember update event
 */
export async function logNickname(oldMember: GuildMember, newMember: GuildMember): Promise<void> {
    try {
        if (oldMember.nickname === newMember.nickname) return;

        // This section for the nickname history feature
        const ud = await Bot.client.database.getGuildUserData(newMember.guild.id, newMember.user.id);
        await Bot.client.database.updateGuildUserData({
            guildid: newMember.guild.id,
            userid: newMember.user.id,
            nicknames: ud && ud.nicknames ?
                `${ud.nicknames},${moment().utc().format("DD MMM YY HH:mm")} UTC: ${newMember.nickname?.escapeSpecialChars()}` :
                `${moment().utc().format("DD MMM YY HH:mm")} UTC: ${newMember.nickname?.escapeSpecialChars()}`
        });

        const logChannel = await getLogChannel(newMember.guild, LoggingFlags.NICKNAME_UPDATE, "member_channel");
        if (!logChannel) return;
    
        await logChannel.send({
            embeds: [{
                author: {
                    name: `Nickname Changed`,
                    iconURL: logChannel.guild.iconURL() || ""
                },
                color: await Bot.client.database.getColor("info"),
                description: `Nickname of ${newMember} changed`,
                fields: [
                    {
                        name: "Before",
                        value: `${oldMember.nickname || '*none*'}`,
                        inline: true
                    },
                    {
                        name: "After",
                        value: `${newMember.nickname || '*none*'}`,
                        inline: true
                    }
                ],
                footer: {
                    text: `ID: ${newMember.id}`
                },
                timestamp: new Date(),
            }]
        });
        
    } catch (error) {
        xlg.error(error);
    }
}

/**
 * Logs an event where autoban banned a member on join.
 * @param member member who was autobanned
 */
export async function logAutoBan(member: GuildMember): Promise<void> {
    try {
        const logChannel = await getLogChannel(member.guild, LoggingFlags.OTHER_EVENTS, "log_channel");
        if (!logChannel) return;

        await logChannel.send({
            embeds: [{
                author: {
                    name: `Member Autobanned`,
                    iconURL: logChannel.guild.iconURL() || ""
                },
                color: await Bot.client.database.getColor("info"),
                description: `Autoban has been activated on ${member.user.tag} (${member.id}).\nThey are now banned permanently.`,
                timestamp: new Date(),
            }]
        });
    } catch (error) {
        xlg.error(error);
    }
}
