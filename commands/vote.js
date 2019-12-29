module.exports = {
    name: 'vote',
    description: 'Call a quick vote on the message the command was in',
    usage: "[the content of the vote]",
    guildOnly: true,
    async execute(client, message, args) {
        await message.react('✅')
            //.then(console.log)
            .catch(console.error);
        message.react('❌')
            .catch(console.error);

    }
}