const xlg = require("../xlogger");
const { permLevels } = require('../permissions');

module.exports = {
    name: "giverole",
    aliases: ["role"],
    description: {
        short: "assigns a member a role",
        long: "Assign a member or all members a role."
    },
    usage: "<member> <role>",
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