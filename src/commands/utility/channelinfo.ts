import xlg from "../../xlogger";
import { permLevels } from '../../permissions';
import { Command } from "src/gm";
import { stringToChannel } from "../../utils/parsers";
import { GuildChannel, MessageEmbedOptions, VoiceChannel } from "discord.js";
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
            const type = channel.type;
            const e: MessageEmbedOptions = {
                color: await client.database.getColor("info_embed_color"),
                title: `Channel Info`,
                description: `**Channel:** ${channel} (\\#${channel.name})\n**ID:** ${channel.id}\n**Type:** ${type}\n`,
                footer: {
                    text: `ID: ${channel.id}`
                }
            }
            if (channel instanceof VoiceChannel) {
                e.description += `\n**Bitrate:** ${channel.bitrate}kbps`;
                e.description += `\n**Joined:** ${channel.members.size} members`;
                e.description += "\n";
            }
            e.description += `\n**Position:** ${channel.position}`;
            if (channel.permissionsLocked) {
                e.description += `\n**Viewable By Everyone:** yes`;
            } else {
                e.description += `\n**Viewable By Everyone:** no`;
            }
            if (!channel.parentID || !channel.parent) {
                e.description += `\n**Has Parent:** no`;
            } else {
                e.description += `\n**Has Parent:** yes (${channel.parent})`;
                if (channel.permissionsLocked) {
                    e.description += `\n**Synced w/ Parent:** yes`;
                } else {
                    e.description += `\n**Synced w/ Parent:** no`;
                }
            }
            e.description += `\n\n**Created:**\n${createdAt.format('ddd M/D/Y HH:mm:ss')} (${createdAt.fromNow()})`;

            message.channel.send({ embed: e });
        } catch (error) {
            xlg.error(error);
            await client.specials?.sendError(message.channel);
            return false;
        }
    }
}
