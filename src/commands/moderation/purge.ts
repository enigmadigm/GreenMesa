import xlg from '../../xlogger';
import { DMChannel } from 'discord.js';
import { Command } from 'src/gm';
import { permLevels } from '../../permissions';
import { stringToMember } from '../../utils/parsers';
//import { getGuildSetting } from "../dbmanager";

export const command: Command = {
    name: 'purge',
    description: {
        short: 'bulk delete messages in a channel',
        long: 'This command can remove up to 100 messages from all members or a single target in a channel.'
    },
    aliases: ['bulkdelete'],
    usage: "<# of messages to delete> [target member @]",
    args: true,
    guildOnly: true,
    permLevel: permLevels.mod,
    moderation: true,
    async execute(client, message, args) {
        try {
            if (!message.guild || message.channel instanceof DMChannel) return;
    
            const deleteCount = parseInt(args[0], 10); // get the delete count, as an actual number.
            args.shift();
            const target = await stringToMember(message.guild, args.join(" "));
    
            // Ooooh nice, combined conditions. <3
            if (!deleteCount || deleteCount < 2) {
                client.specials?.sendError(message.channel, "Provide a number (2-100) for the number of messages to delete.");
                return;
            }
            
            let opts = {
                limit: (deleteCount < 100) ? deleteCount : 100,
                before: message.id
            }
            if (target) {
                opts = {
                    limit: 100,
                    before: (target.user.lastMessage?.channel.id === message.channel.id) ? target.user.lastMessageID || "" : message.id
                }
            }
            
            // Get messages and delete them. Simple enough, right?
            const messages = await message.channel.messages.fetch( opts )
            messages.set(message.id, message);
            let c = 0;
            if (target) {
                if (target.user.lastMessage?.channel.id === message.channel.id) {
                    messages.set(target.user.lastMessage.id, target.user.lastMessage);
                }
                const mc = messages.filter(m => m.author.id === target.user.id || m.id === message.id).array().slice(0, deleteCount);
                if (mc.length == 0) {
                    message.channel.send(`Could not find any recent messages.`);
                    message.delete();
                    return;
                }
                c = mc.length;
                message.channel.bulkDelete(mc);
            } else {
                c = messages.size;
                message.channel.bulkDelete(messages);
            }

            message.channel.send(`Purged ${c} messages`)
        } catch (error) {
            xlg.error(error);
            await client.specials?.sendError(message.channel);
            return false;
        }
    }
}

