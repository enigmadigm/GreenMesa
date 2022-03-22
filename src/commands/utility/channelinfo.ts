import { permLevels } from '../../permissions.js';
import { Command } from "src/gm";
import { stringToChannel } from "../../utils/parsers.js";
import { GuildChannel, MessageEmbedOptions, Permissions, ThreadChannel, VoiceChannel } from "discord.js";
import moment from 'moment';

export const command: Command = {
    name: "channelinfo",
    aliases: ["ci", "channel"],
    description: {
        short: "get channel information",
        long: "Get information about a given channel or the current channel."
    },
    usage: "[channel]",
    cooldown: 1,
    permLevel: permLevels.member,
    guildOnly: true,
    async execute(client, message, args) {
        try {
            if (!message.guild || !(message.channel instanceof GuildChannel)) return;
            const a = args.join(" ");
            const channel = stringToChannel(message.guild, a, true, true) || message.channel;
            const createdAt = moment(channel.createdAt).utc();
            const channelType = channel.type;
            const e: MessageEmbedOptions = {
                color: await client.database.getColor("info"),
                title: `Channel Info`,
                description: `**Channel:** ${channel} (\\#${channel.name})\n**ID:** ${channel.id}\n**Type:** ${channelType}\n`,
                footer: {
                    text: `ID: ${channel.id}`
                }
            }
            if (channel instanceof VoiceChannel) {
                e.description += `\n**Bitrate:** ${channel.bitrate}kbps`;
                e.description += `\n**Joined:** ${channel.members.size} members`;
                e.description += "\n";
            }
            if (channel instanceof GuildChannel) {
                e.description += `\n**Position:** ${channel.position}`;
            }
            if (channel.permissionsFor(channel.guild.roles.everyone).has(Permissions.FLAGS.VIEW_CHANNEL)) {// i had `(channel.permissionsLocked)` here before, not sure what my logic was or if i just forgot to change the condition
                e.description += `\n**Viewable By Everyone:** yes`;
            } else {
                e.description += `\n**Viewable By Everyone:** no`;
            }
            if (!channel.parentId || !channel.parent) {
                e.description += `\n**Has Parent:** no`;
            } else {
                e.description += `\n**Has Parent:** yes (${channel.parent})`;
                if ((channel instanceof GuildChannel && channel.permissionsLocked) || channel instanceof ThreadChannel) {
                    e.description += `\n**Synced w/ Parent:** yes`;
                } else {
                    e.description += `\n**Synced w/ Parent:** no`;
                }
            }
            e.description += `\n\n**Created:**\n${createdAt.format('ddd M/D/Y HH:mm:ss')} (${createdAt.fromNow()})`;

            await message.channel.send({ embeds: [e] });
        } catch (error) {
            xlg.error(error);
            await client.specials.sendError(message.channel);
            return false;
        }
    }
}
