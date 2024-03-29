import { Invite, Permissions } from 'discord.js';
import moment from 'moment';
import { Command, GuildMessageProps } from 'src/gm';

export const command: Command<GuildMessageProps> = {
    name: "serverinfo",
    description: {
        short: "detailed server info",
        long: "Get detailed information on the current server. This command may also save you a trip to server settings.",
    },
    aliases: ['server', 'si'],
    guildOnly: true,
    cooldown: 3,
    async execute(client, message) {
        try {
            const createdAt = moment(message.guild.createdAt).utc();
            const mems = await message.guild.members.fetch();
            const memberCount = mems.size;
            const botCount = mems.filter(member => member.user.bot).size;
            const channels = [
                `Categories: ${message.guild.channels.cache.filter(x => x.type == "GUILD_CATEGORY").size}`,
                `Text: ${message.guild.channels.cache.filter(x => x.isText()).size}`,
                `Voice: ${message.guild.channels.cache.filter(x => x.isVoice()).size}`
            ]
            const guildNewsChannels = message.guild.channels.cache.filter(x => x.type == "GUILD_NEWS").size;
            if (guildNewsChannels) {
                channels.push(`News: ${guildNewsChannels}`);
            }
            if (message.guild.channels.cache.filter(x => x.type == "GUILD_STORE").size) {
                channels.push(`Store: ${message.guild.channels.cache.filter(x => x.type == "GUILD_STORE").size}`);
            }

            let invites: boolean | Invite[] = false;
            if (message.guild.me?.permissions.has(Permissions.FLAGS.MANAGE_GUILD)) {
                invites = [...message.guild.invites.cache.values()];
            }
            const owner = await message.guild.fetchOwner();
            await message.channel.send({
                embeds: [{
                    color: await client.database.getColor("info"),
                    thumbnail: {
                        url: message.guild.iconURL() || ""
                    },
                    author: {
                        name: message.guild.name,
                        icon_url: message.guild.iconURL() || ""
                    },
                    fields: [
                        {
                            name: "Owner",
                            value: `${owner}\n${owner.id}`,
                            inline: true,
                        },
                        {
                            name: "Members",
                            value: `🎰 ${memberCount}\n👥 ${memberCount - botCount}\n🤖 ${botCount}`,
                            inline: true,
                        },
                        {
                            name: "Online <:736903507436896313:752118506950230067>",
                            value: `${mems.filter(member => (member.presence?.status == 'online' || member.presence?.status == 'idle') && !member.user.bot).size} human`,
                            inline: true,
                        },
                        {
                            name: `Channels (${message.guild.channels.cache.size - message.guild.channels.cache.filter(x => x.type == "GUILD_CATEGORY").size})`,
                            value: `${channels.join("\n") || 'none'}`,
                            inline: true,
                        },
                        {
                            name: "Created",
                            value: `<t:${createdAt.unix()}:R>`,
                            inline: true,
                        },
                        {
                            name: "Emojis 😏",
                            value: `Total: ${message.guild.emojis.cache.size}\nAnimated: ${message.guild.emojis.cache.filter(e => !!e.animated).size}\n<:giflabel1:757354173086957608>`,
                            inline: true,
                        },
                        {
                            name: "Roles <:atsign_1:757386730960584815>",
                            value: `\`${message.guild.roles.cache.size}\``,
                            inline: true,
                        },
                        {
                            name: "Open Invites",
                            value: `\`${invites ? invites.length : "NO PERMS"}\``,
                            inline: true,
                        },
                    ],
                    footer: {
                        text: `ID: ${message.guild.id} ● all dates in utc`,
                    },
                }],
            });
        } catch (error) {
            xlg.error(error);
            await client.specials.sendError(message.channel);
            return false;
        }
    }
}
