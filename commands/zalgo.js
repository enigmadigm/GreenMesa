const xlg = require("../xlogger");
const { permLevels } = require('../permissions');
//const { getGlobalSetting } = require("../dbmanager");
const Z = require("../utils/zalgo");

module.exports = {
    name: "zalgo",
    aliases: ["za"],
    description: {
        short: "generate zalgo text",
        long: "This will generate beautiful zalgo text from an input."
    },
    category: "fun",
    usage: "<text>",
    args: true,
    permLevel: permLevels.trustedMember,
    guildOnly: false,
    async execute(client, message, args) {
        try {
            const ja = args.join(" ");
            const zt = Z.generate(ja);
            message.channel.send(zt);
        } catch (error) {
            xlg.error(error);
            await client.specials.sendError(message.channel);
            return false;
        }
    }
}