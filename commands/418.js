module.exports = {
    name: '418',
    aliases: ['http418', 'error418'],
    description: 'oh no!',
    category: 'fun',
    execute(client, message) {
        message.channel.send("Command outdated and is being used as a placeholder. The replacement command will be `sm http`.");
    }
}