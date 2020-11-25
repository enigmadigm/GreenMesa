const xlg = require("../xlogger");
const { getGlobalSetting } = require("../dbmanager")

module.exports = {
    name: "botfor",
    description: "find the right bot for a topic",
    usage: "<topic>",
    args: true,
    category: 'fun',
    async execute(client, message, args) {
        message.channel.send({
            embed: {
                color: parseInt((await getGlobalSetting('fail_embed_color'))[0].value),
                title: "Error 501",
                description: "This command will deliver you the right bot for what you want, using AI!"
            }
        }).catch(xlg.error);
        let term = args.join(" ");
        message.channel.send(term);
    }
}