const xlg = require("../xlogger");
const { sendError } = require("../utils/specialmsgs");
const { permLevels } = require('../permissions');

module.exports = {
    name: "",
    aliases: [""],
    description: {
        short: "",
        long: ""
    },
    usage: "",
    args: false,
    permLevel: permLevels.trustedMember,
    guildOnly: false,
    ownerOnly: false,
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