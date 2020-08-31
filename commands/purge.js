const { permLevels } = require('../permissions');

module.exports = {
    name: 'purge',
    description: 'This command removes all messages from all users in the channel, up to 100',
    aliases: ['bulkdelete'],
    usage: "<# of messages to delete> [target member @]",
    args: true,
    guildOnly: true,
    permLevel: permLevels.mod,
    async execute(client, message, args) {

        const targetMember = message.mentions.users.first();
        const deleteCount = parseInt(args[0], 10); // get the delete count, as an actual number.

        // Ooooh nice, combined conditions. <3
        if (!deleteCount || deleteCount < 2)
            return message.reply("provide a number (2-100) for the number of messages to delete");
        
        let opts = {
            limit: (deleteCount < 100) ? deleteCount : 100,
            before: message.id
        }
        if (targetMember) {
            opts = {
                limit: 100,
                before: targetMember.lastMessageID
            }
        }
        
        // So we get our messages, and delete them. Simple enough, right?
        message.channel.messages.fetch( opts ).then(async messages => {
            if (targetMember) {
                messages = messages.filter(m => m.author.id === targetMember.id).array().slice(0, deleteCount);
            }
            if (messages.length == 0) {
                return message.channel.send(`Could not find any recent messages.`);
            }

            message.channel.bulkDelete(messages)
                .then(message.delete())
                .catch(e => {
                    console.log(e.stack);
                    message.reply(`couldn't delete messages because of: ${e}`);
                });
        });
    }
}