const { permLevels } = require("../permissions");
const xlg = require("../xlogger");

module.exports = {
    name: 'say',
    description: 'Make the bot say something. Must be moderator.',
    args: true,
    usage: "<bot message>",
    guildOnly: true,
    permLevel: permLevels.mod,
    category: 'utility',
    async execute(client, message, args) {
        try {
            message.delete();
            message.channel.send(args.join(" "));
        } catch (error) {
            xlg.error(error);
            await client.specials.sendError(message.channel);
            return false;
        }
    }
}