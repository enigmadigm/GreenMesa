module.exports = {
    name: 'why',
    description: 'Ask why',
    execute(client, message, args) {
        message.channel.send({
            embed: {
                color: 3447003,
                fields: [{
                    name: "Why?",
                    value: "Because I wanted to."
                }],
                timestamp: new Date(),
                footer: {
                    text: message.id
                }
            }
        });

    }
}