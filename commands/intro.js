const config = require('../auth.json');

module.exports = {
    name: 'intro',
    description: '',
    execute(client, message, args) {
        message.channel.send({
            embed: {
                color: 3447003,
                title: "Introduction",
                description: "This multifunctioning disfunctioning Discord bot was built by ComradeRooskie#6969, who runs [EnigmaDigm](https://enigmadigm.com). This bot can do a bunch of random stuff right now, and bigger and better features are in development ;).",
                fields: [
                    {
                        name: "Do you have any commands?",
                        value: "*Yes in fact.* I didn't use months of my life setting up nothing. Use the `help` command to get info on them or visit [here](https://github.com/enigmadigm/GreenMesa/blob/master/documentation/commands.md) for a full (almost always up to date) list."
                    },
                    {
                        name: "How do I contribute?",
                        value: "If you want to make a request you can open up an issue [here](https://github.com/enigmadigm/greenmesa/issues) (don't worry an issue doesn't have to be a bug, it's just your opportunity to make your voice heard)."
                    },
                    {
                        name: "What am I supposed to do?",
                        value: `||\` don't  get  caught  doing  anything  stupid \`|| (\`${config.prefix}help\` will tell you everything you can do)`
                    },
                    {
                    name: "How do I find out more?",
                    value: "Use commands like `help` and `info` to get more information. Visit [the GreenMesa GitHub repo](https://github.com/enigmadigm/GreenMesa), or my [website under development](https://enigmadigm.com/apps/greenmesa/) to get more details."
                    }
                ],
                timestamp: new Date(),
                footer: {
                    icon_url: client.user.avatarURL,
                    text: `The Intro | See ${config.prefix}info for next steps`
                }
            }
        });

    }
}