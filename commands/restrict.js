const xlg = require("../xlogger");
const { sendError } = require("../utils/specialmsgs");
const { permLevels } = require('../permissions');

module.exports = {
    name: "restrict",
    description: {
        short: "restrict command usage to a certain role",
        long: ""
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
            sendError(message.channel);
            return false;
        }
    }
}