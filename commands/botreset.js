const config = require("../auth.json");

module.exports = {
    name: 'botreset',
    description: 'Restarts the bot',
    aliases:[],
    ownerOnly: true,
    execute(client, message) {
        // Turn bot off (destroy), then turn it back on
        message.channel.send('Resetting...')
            .then(() => client.destroy())
            .then(() => client.login(config.token))
            .then(() => message.channel.send("Reset!"));
    }
}
