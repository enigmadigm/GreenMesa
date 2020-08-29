const { permLevels } = require('../permissions');

module.exports = {
    name: 'purge',
    description: 'This command removes all messages from all users in the channel, up to 100',
    aliases: ['bulkdelete'],
    usage: "<# of messages to delete>",
    args: true,
    guildOnly: true,
    permLevel: permLevels.mod,
    async execute(client, message, args) {
        // get the delete count, as an actual number.
        const deleteCount = parseInt(args[0], 10);

        // Ooooh nice, combined conditions. <3
        if (!deleteCount || deleteCount < 2 || deleteCount > 100)
            return message.reply("please provide a number between 2 and 100 for the number of messages to delete");

        // So we get our messages, and delete them. Simple enough, right?
        const fetched = await message.channel.messages.fetch({ limit: deleteCount });
        message.channel.bulkDelete(fetched)
            .catch(error => message.reply(`couldn't delete messages because of: ${error}`));
    }
}