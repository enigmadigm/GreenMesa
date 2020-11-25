const xlg = require("../xlogger");
const { permLevels } = require('../permissions');

module.exports = {
    name: "restrict",
    description: {
        short: "restrict command usage to a certain role",
        long: "Use to restrict the usage of all commands for this bot to a certain specified role in the server"
    },
    usage: "<command> <role>",
    args: true,
    permLevel: permLevels.admin,
    guildOnly: true,
    ownerOnly: true,
    execute(client, message, args) {
        try {
            if (!args);
        } catch (error) {
            xlg.error(error);
            client.specials.sendError(message.channel);
            return false;
        }
    }
}