import moment from 'moment';
import { Command, GuildMessageProps } from 'src/gm';
import { permLevels } from '../../permissions';
import { stringToMember } from '../../utils/parsers';

export const command: Command<GuildMessageProps> = {
    name: "purge",
    description: {
        short: "bulk delete messages in a channel",
        long: "This command can remove up to 100 messages from all members or a single target in a channel.",
    },
    aliases: ['clear'],
    usage: "<# of messages to delete> [@target]",
    args: true,
    guildOnly: true,
    permLevel: permLevels.mod,
    moderation: true,
    async execute(client, message, args) {
        try {
            const deleteCount = parseInt(args[0], 10); // get the delete count, as an actual number.
            args.shift();
            const target = await stringToMember(message.guild, args.join(" "));

            // Ooooh nice, combined conditions. <3
            if (!deleteCount || deleteCount < 2) {
                await client.specials?.sendError(message.channel, "Provide a number (2-100) for the number of messages to delete.");
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
            const messages = await message.channel.messages.fetch(opts);
            let c = 0;
            if (target) {
                if (target.user.lastMessage?.channel.id === message.channel.id) {
                    messages.set(target.user.lastMessage.id, target.user.lastMessage);
                }
                const mc = messages.filter(m => (m.author.id === target.user.id || m.id === message.id) && moment().diff(m.createdAt, "s") < 1209600).array().slice(0, deleteCount);
                if (mc.length == 0) {
                    await message.channel.send(`Could not find any recent messages younger than 14 days.`);
                    await message.delete();
                    return;
                }
                c = mc.length;
                mc.push(message);
                await message.channel.bulkDelete(mc);
            } else {
                // console.log(moment().diff(messages.first()?.createdAt, "s"))
                const mc = messages.filter(m => moment().diff(m.createdAt, "s") < 1209600).array().slice(0, deleteCount);
                if (mc.length == 0) {
                    await message.channel.send(`Could not find any recent messages younger than 14 days.`);
                    await message.delete();
                    return;
                }
                c = messages.size;
                mc.push(message);
                await message.channel.bulkDelete(mc);
            }

            if (args.join(" ").endsWith("-m")) {
                await message.channel.send(`Purged ${c} messages`);// People don't seem to like that it says a message at the end.
            }
        } catch (error) {
            xlg.error(error);
            await client.specials?.sendError(message.channel);
            return false;
        }
    }
}
