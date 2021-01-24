const xlg = require("../xlogger");
const { getGlobalSetting } = require("../dbmanager");
const httpdcodes = require("../../httpcodes.json");
const { permLevels } = require('../permissions');

module.exports = {
    name: "http",
    aliases: ["https"],
    description: {
        short: "find an http error code",
        long: ""
    },
    category: "misc",
    usage: "<code>",
    specialArgs: undefined,
    permLevel: permLevels.trustedMember,
    guildOnly: true,
    ownerOnly: false,
    async execute(client, message, args) {
        try {
            if (!args.length) {
                message.channel.send({
                    embed: {
                        color: parseInt((await getGlobalSetting('fail_embed_color'))[0].value),
                        title: "error 422",
                        description: "(lack of arguments)"
                    }
                });
                return;
            }
            message.channel.send({
                embed: {
                    color: parseInt((await getGlobalSetting('fail_embed_color'))[0].value),
                    title: "error 501",
                    description: "(command in development)"
                }
            });
            const randcode = httpdcodes[Math.random() * httpdcodes.length].code
            message.channel.send({
                embed: {
                    color: parseInt((await getGlobalSetting('darkgreen_embed_color'))[0].value),
                    title: `${randcode}`,
                    description: "here's a random code"
                }
            });
        } catch (error) {
            xlg.error(error);
            await client.specials.sendError(message.channel);
            return false;
        }
    }
}