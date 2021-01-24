const xlg = require("../xlogger");
const { getGlobalSetting } = require("../dbmanager");

module.exports = {
    name: "status",
    description: "returns ok",
    async execute(client, message) {
        try {
            message.channel.send({
                embed: {
                    color: parseInt((await getGlobalSetting("info_embed_color"))[0].value, 10),
                    description: "ok"
                }
            });
        } catch (error) {
            xlg.error(error);
            await client.specials.sendError(message.channel);
            return false;
        }
    }
}