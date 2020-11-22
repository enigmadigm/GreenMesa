const xlg = require("../xlogger");
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
    async execute(client, message, args) {
        try {
            if (!args);
        } catch (error) {
            xlg.error(error);
            await client.specials.sendError(message.channel);
            return false;
        }
    }
}