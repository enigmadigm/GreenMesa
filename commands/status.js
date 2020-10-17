const xlg = require("../xlogger");
const { getGlobalSetting } = require("../dbmanager");

module.exports = {
    name: "status",
    description: "get bot status",
    async execute(client, message) {
        message.channel.send({
            color: parseInt((await getGlobalSetting("info_embed_color"))[0].value, 10),
            description: "**STATUS**: ok"
        }).catch(xlg.error);
    }
}