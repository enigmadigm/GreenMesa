const xlg = require("../xlogger");
const { permLevels } = require('../permissions');
//const { getGlobalSetting } = require("../dbmanager");

module.exports = {
    name: "",
    aliases: [""],
    description: {
        short: "",
        long: ""
    },
    category: "misc",
    usage: "",
    args: false,
    specialArgs: undefined,
    permLevel: permLevels.trustedMember,
    guildOnly: true,
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