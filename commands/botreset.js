const config = require("../auth.json");

module.exports = {
    name: 'botreset',
    description: 'Reloads/recaches the bot',
    aliases:[],
    ownerOnly: true,
    execute(client, message, args) {
        // Turn bot off (destroy), then turn it back on
        message.channel.send('Resetting...')
            .then(msg => client.destroy())
            .then(() => client.login(config.token))
            .then(() => message.channel.send("Reset!"));
    }
}