import { permLevels } from '../../permissions.js';
import { stringToChannel } from '../../utils/parsers.js';
import { Command } from "src/gm";
import { ThreadChannel } from 'discord.js';

export const command: Command = {
    name: "copychannel",
    aliases: ["cpchan"],
    description: {
        short: "copy a channel",
        long: "Send this command with the channel to copy as an argument and almost every part of that channel, including the name and position, will be copied to a new channel."
    },
    usage: "<#channel> [new name]",
    cooldown: 1,
    args: true,
    permLevel: permLevels.admin,
    moderation: true,
    guildOnly: true,
    permissions: ["MANAGE_CHANNELS"],
    async execute(client, message, args) {
        try {
            const target = stringToChannel(message.guild, args[0], true, true);
            if (!target) {
                xlg.log(target)
                await client.specials.sendError(message.channel, `Invalid channel`);
                return;
            }
            if (target instanceof ThreadChannel) {
                await client.specials.sendError(message.channel, `Threads cannot be cloned`);
                return;
            }
            args.shift();
            const n = args.join(" ");
            try {
                /*await message.guild.channels.create(target.name, {
                    type: target.type,
                    parent: target.parent || undefined,
                    permissionOverwrites: target.permissionOverwrites,
                    position: target.position,
                });*/
                await target.clone({
                    name: n.length ? n : undefined
                });
            } catch (error) {
                xlg.error(error);
                await client.specials.sendError(message.channel, "Could not copy the channel. Do I lack permissions?");
                return false;
            }
            
            await message.channel.send({
                embeds: [{
                    color: await client.database.getColor("info"),
                    description: `Channel copied`,
                }],
            });
        } catch (error) {
            xlg.error(error);
            await client.specials.sendError(message.channel);
            return false;
        }
    }
}
