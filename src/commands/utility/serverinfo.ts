import { Invite } from 'discord.js';
import moment from 'moment';
import { Command } from 'src/gm';


export const command: Command = {
    name: 'serverinfo',
    description: 'get info on the current server',
    aliases: ['server', 'si'],
    guildOnly: true,
    cooldown: 4,
    async execute(client, message) {
        try {
            if (!message.guild) return;
            const createdAt = moment(message.guild.createdAt).utc();
            const mems = await message.guild.members.fetch();
            const memberCount = mems.size;
            const botCount = mems.filter(member => member.user.bot).size;
            const channels = [
                `Categories: ${message.guild.channels.cache.filter(x => x.type == 'category').size}`,
                `Text: ${message.guild.channels.cache.filter(x => x.type == 'text').size}`,
                `Voice: ${message.guild.channels.cache.filter(x => x.type == 'voice').size}`
            ]
            if (message.guild.channels.cache.filter(x => x.type == 'news').size) channels.push(`News: ${message.guild.channels.cache.filter(x => x.type == 'news').size}`);
            if (message.guild.channels.cache.filter(x => x.type == 'store').size) channels.push(`Store: ${message.guild.channels.cache.filter(x => x.type == 'store').size}`);

            let invites: boolean | Invite[] = false;
            if (message.guild.me?.hasPermission("MANAGE_GUILD")) {
                const invitesCollection = await message.guild.fetchInvites();
                invites = invitesCollection.array();
            }
            message.channel.send({
                embed: {
                    "color": await client.database.getColor("info"),
                    "thumbnail": {
                        "url": message.guild.iconURL() || ""
                    },
                    "author": {
                        "name": message.guild.name,
                        "icon_url": message.guild.iconURL() || ""
                    },
                    "fields": [
                        {
                            "name": "Owner",
                            "value": message.guild.owner?.toString(),
                            "inline": true
                        },
                        {
                            "name": "Members",
                            "value": `:slot_machine: ${memberCount}\n👥 ${memberCount - botCount}\n🤖 ${botCount}`,
                            "inline": true
                        },
                        {
                            "name": "Online <:736903507436896313:752118506950230067>",
                            "value": `${mems.filter(member => (member.presence.status == 'online' || member.presence.status == 'idle') && !member.user.bot).size} human`,
                            "inline": true
                        },
                        {
                            "name": `Channels (${message.guild.channels.cache.size - message.guild.channels.cache.filter(x => x.type == 'category').size})`,
                            "value": `${channels.join("\n") || 'none'}`,
                            "inline": true
                        },
                        {
                            "name": "Roles <:atsign_1:757386730960584815>",
                            "value": `${message.guild.roles.cache.size}`,
                            "inline": true
                        },
                        {
                            "name": "Open Invites",
                            "value": `${invites ? invites.length : "[no invites access]"}`,
                            "inline": true
                        },
                        {
                            "name": "Emojis 😏",
                            "value": `Total: ${message.guild.emojis.cache.size}\nAnimated: ${message.guild.emojis.cache.filter(e => e.animated).size}\n<:giflabel1:757354173086957608>`,
                            "inline": true
                        },
                        {
                            "name": "Created",
                            "value": `${createdAt.format('ddd M/D/Y HH:mm:ss')}\n(${createdAt.fromNow()})`,
                            "inline": true
                        }
                    ],
                    "footer": {
                        "text": "ID: " + message.guild.id + ' | Region: ' + message.guild.region + ' | All dates in UTC'
                    },
                }
            });
        } catch (error) {
            xlg.error(error);
            await client.specials?.sendError(message.channel);
            return false;
        }
    }
}

