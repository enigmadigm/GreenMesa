const xlg = require("../xlogger");

module.exports = {
    name: 'why',
    description: 'ask: why',
    category: 'fun',
    async execute(client, message) {
        try {
            message.channel.send({
                embed: {
                    color: 3447003,
                    fields: [{
                        name: "Why?",
                        value: "because"
                    }],
                    footer: {
                        text: `The dev knows this cmd is stupid`
                    }
                }
            });
        } catch (error) {
            xlg.error(error);
            await client.specials.sendError(message.channel);
            return false;
        }
    }
}