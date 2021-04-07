import xlg from "../../xlogger";
import { permLevels } from '../../permissions';
//import { getGlobalSetting, getGuildSetting } from "../dbmanager";
import { stringToChannel } from '../../utils/parsers';
import { Command } from "src/gm";

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
            if (!message.guild) return;
            
            const target = stringToChannel(message.guild, args[0], true, true);
            if (!target) {
                xlg.log(target)
                await client.specials?.sendError(message.channel, "Invalid channel");
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
                client.specials?.sendError(message.channel, "Could not copy the channel. Do I lack permissions?");
                return false;
            }
            
            await message.channel.send({
                embed: {
                    color: await client.database.getColor("info"),
                    description: `Channel copied`
                }
            });
        } catch (error) {
            xlg.error(error);
            await client.specials?.sendError(message.channel);
            return false;
        }
    }
}

