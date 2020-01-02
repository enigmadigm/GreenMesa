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
                description: "YAGPDB (yet another general discord bot), you get the idea. This bot can do a bunch of random stuff right now, and bigger features are in development.",
                fields: [{
                    name: "How to find out more",
                    value: "Use commands like `help` and `info` to get more information. Visit [the GitHub repo for GreenMesa bot](https://github.com/enigmadigm/GreenMesa), or my [website under development](https://enigmadigm.com/apps/greenmesa/) to get more details."
                }],
                timestamp: new Date(),
                footer: {
                    icon_url: client.user.avatarURL,
                    text: "The Intro (may be changed in future)"
                }
            }
        });

    }
}