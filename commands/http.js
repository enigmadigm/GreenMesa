const xlg = require("../xlogger");
const { getGlobalSetting } = require("../dbmanager");
const httpdcodes = require("../httpcodes.json");

module.exports = {
    name: "https",
    description: "find an http error code",
    usage: "<code>",
    aliases: ["http"],
    async execute(client, message, args) {
        if (!args.length) {
            message.channel.send({
                embed: {
                    color: parseInt((await getGlobalSetting('fail_embed_color'))[0].value),
                    title: "error 422",
                    description: "(lack of arguments)"
                }
            }).catch(xlg.error);
            return;
        }
        message.channel.send({
            embed: {
                color: parseInt((await getGlobalSetting('fail_embed_color'))[0].value),
                title: "error 501",
                description: "(command in development)"
            }
        }).catch(xlg.error);
        const randcode = httpdcodes[Math.random() * httpdcodes.length].code
        message.channel.send({
            embed: {
                color: parseInt((await getGlobalSetting('darkgreen_embed_color'))[0].value),
                title: `${randcode}`,
                description: "here's a random code"
            }
        }).catch(xlg.error);
    }
}