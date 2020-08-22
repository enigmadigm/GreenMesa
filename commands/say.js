const { permLevels } = require("../permissions");

module.exports = {
    name: 'say',
    description: 'Make the bot say something. Must be moderator.',
    args: true,
    usage: "<bot message>",
    guildOnly: true,
    permLevel: permLevels.mod,
    execute(client, message, args) {
        message.delete().catch();
        message.channel.send(args.join(" "));
    }
}