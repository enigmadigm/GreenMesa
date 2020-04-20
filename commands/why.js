module.exports = {
    name: 'why',
    description: 'Ask why.',
    execute(client, message) {
        message.channel.send({
            embed: {
                color: 3447003,
                fields: [{
                    name: "Why?",
                    value: "because"
                }],
                timestamp: new Date(),
                footer: {
                    text: message.id | "The dev knows this cmd is stupid"
                }
            }
        });

    }
}