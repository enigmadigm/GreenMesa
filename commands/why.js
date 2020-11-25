module.exports = {
    name: 'why',
    description: 'ask...why',
    category: 'fun',
    execute(client, message) {
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

    }
}