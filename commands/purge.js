const { getGuildSetting } = require("../dbmanager");
const { sendModerationDisabled } = require('../utils/specialmsgs');
const { permLevels } = require('../permissions');
const { stringToMember } = require('../utils/parsers');

module.exports = {
    name: 'purge',
    description: 'This command removes all messages from all users in the channel, up to 100',
    aliases: ['bulkdelete'],
    usage: "<# of messages to delete> [target member @]",
    args: true,
    guildOnly: true,
    category: 'moderation',
    permLevel: permLevels.mod,
    async execute(client, message, args) {
        let moderationEnabled = await getGuildSetting(message.guild, 'all_moderation');
        if (!moderationEnabled[0] || moderationEnabled[0].value === 'disabled') {
            return sendModerationDisabled(message.channel);
        }

        const deleteCount = parseInt(args[0], 10); // get the delete count, as an actual number.
        args.shift();
        const target = await stringToMember(message.guild, args.join(" "));

        // Ooooh nice, combined conditions. <3
        if (!deleteCount || deleteCount < 2)
            return message.reply("provide a number (2-100) for the number of messages to delete");
        
        let opts = {
            limit: (deleteCount < 100) ? deleteCount : 100,
            before: message.id
        }
        if (target) {
            opts = {
                limit: 100,
                before: (target.user.lastMessageChannelID === message.channel.id) ? target.user.lastMessageID : message.id
            }
        }
        
        // So we get our messages, and delete them. Simple enough, right?
        message.channel.messages.fetch( opts ).then(async messages => {
            messages.set(message.id, message);
            if (target) {
                if (target.user.lastMessageChannelID === message.channel.id) messages.set(target.user.lastMessage.id, target.user.lastMessage);
                messages = messages.filter(m => m.author.id === target.user.id || m.id === message.id).array().slice(0, deleteCount);
            }
            if (messages.length == 0) {
                return message.channel.send(`Could not find any recent messages.`).then(message.delete());
            }
            

            message.channel.bulkDelete(messages)
                .then(messages => message.channel.send(`Purged ${messages.size} messages`))
                .catch(e => {
                    console.log(e.stack);
                    message.reply(`couldn't delete messages because of: ${e}`);
                });
        });
    }
}