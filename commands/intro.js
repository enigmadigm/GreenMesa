module.exports = {
    name: 'intro',
    description: '',
    execute(client, message, args) {
        message.channel.send({
            embed: {
                color: 3447003,
                author: {
                    name: client.user.username,
                    icon_url: client.user.avatarURL
                },
                title: "Introduction",
                description: "YAGPDB, you get the idea.",
                fields: [{
                    name: "More",
                    value: "`$help`"
                }],
                timestamp: new Date(),
                footer: {
                    icon_url: client.user.avatarURL,
                    text: "The Intro"
                }
            }
        });

    }
}