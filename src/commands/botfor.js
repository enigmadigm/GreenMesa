const xlg = require("../xlogger");
const { getGlobalSetting } = require("../dbmanager")

module.exports = {
    name: "botfor",
    description: "find the right bot for a topic",
    usage: "<topic>",
    args: true,
    category: 'fun',
    async execute(client, message, args) {
        try {
            message.channel.send({
                embed: {
                    color: parseInt((await getGlobalSetting('fail_embed_color'))[0].value),
                    title: "Error 501",
                    description: "This command will deliver you the right bot for what you want, using AI!"
                }
            });
            if (args.length) {
                let term = args.join(" ");
                message.channel.send(term);
            }
        } catch (error) {
            xlg.error(error);
            await client.specials.sendError(message.channel);
            return false;
        }
    }
}