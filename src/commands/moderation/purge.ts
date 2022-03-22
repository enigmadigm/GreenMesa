import { ChannelLogsQueryOptions, Message } from 'discord.js';
import moment from 'moment';
import { Command, GuildMessageProps } from 'src/gm';
import { permLevels } from '../../permissions.js';
import { stringToMember } from '../../utils/parsers.js';
import { argsMustBeNum } from '../../utils/specials.js';

export const command: Command<GuildMessageProps> = {
    name: "purge",
    description: {
        short: "bulk delete messages in a channel",
        long: "This command can remove up to 100 messages from all members or a single target in a channel.",
    },
    aliases: ['clear'],
    usage: "<# of messages to delete> [@target]",
    args: true,
    flags: [
        {
            f: "r",
            d: "show receipt"
        }
    ],
    guildOnly: true,
    permLevel: permLevels.mod,
    moderation: true,
    permissions: ["MANAGE_MESSAGES"],
    async execute(client, message, args, flags) {
        try {
            if (!(await argsMustBeNum(message.channel, [args[0]]))) {// check to make sure first argument is a number (any number)
                return;
            }
            const deleteCount = parseInt(args[0], 10); // get the delete count, as an actual number.
            args.shift();
            const a = args.join(" ");
            const target = await stringToMember(message.guild, a);

            // Ooooh nice, combined conditions. <3
            if (!deleteCount || deleteCount < 2) {
                await client.specials.sendError(message.channel, "Provide a number (2-100) for the number of messages to delete.");
                return;
            }

            let opts: ChannelLogsQueryOptions = {
                limit: (deleteCount < 100) ? deleteCount : 100,
                before: message.id
            }
            let lastMessage: false | Message = false;
            if (target) {
                lastMessage = client.specials.findLastMessage(target);
                opts = {
                    limit: 100,
                    before: (lastMessage && lastMessage.channel.id === message.channel.id) ? lastMessage.id || undefined : message.id,
                }
            }

            // Get messages and delete them. Simple enough, right?
            const messages = await message.channel.messages.fetch(opts);
            let c = 0;// the number of messages to be deleted (after they are fetched and filtered)
            if (target) {
                if (lastMessage && lastMessage.channel.id === message.channel.id) {
                    messages.set(lastMessage.id, lastMessage);
                }
                const mc = [...messages.filter(m => (m.author.id === target.user.id || m.id === message.id) && moment().diff(m.createdAt, "s") < 1209600).values()].slice(0, deleteCount);
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
                const mc = [...messages.filter(m => moment().diff(m.createdAt, "s") < 1209600).values()].slice(0, deleteCount);
                if (mc.length == 0) {
                    await message.channel.send(`Could not find any recent messages younger than 14 days.`);
                    await message.delete();
                    return;
                }
                c = messages.size;
                mc.push(message);
                await message.channel.bulkDelete(mc);
            }

            if (flags.find(x => x.name === "r")) {// if receipt flag is provided, send deletion receipt
                await message.channel.send(`Purged ${c} messages`);// People don't seem to like that it says a message at the end.
            }
        } catch (error) {
            xlg.error(error);
            await client.specials.sendError(message.channel);
            return false;
        }
    }
}
