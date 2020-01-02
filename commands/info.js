module.exports = {
    name: 'info',
    description: 'Get info on the bot.',
    execute(client, message, args) {
        message.channel.send({
            embed: {
                color: 3447003,
                author: {
                    name: client.user.username,
                    icon_url: client.user.avatarURL
                },
                title: "GreenMesa Info",
                url: "https://enigmadigm.com/apps/greenmesa/help",
                description: "This multifunctioning Discord bot was built by EnigmaDigm and is served by AtlasAtmos. The purpose of this bot is to do whatever it can to fulfill the commands supplied to it by it's users.",
                fields: [{
                        name: "Do you have any commands?",
                        value: "Believe it or not, yes! That's how you got here. Use $help [specific command] to get info on them or visit [here](https://github.com/enigmadigm/GreenMesa/blob/master/documentation/commands.md) for a full (almost always up to date) list."
                    },
                    {
                        name: "How do I contribute?",
                        value: "If you want to make a request either use the #requests channel in our support discord server, or go to the [enigmadigm contact tab](https://enigmadigm.com/apps/greenmesa/discord/help?conresrec=reset). Now that our GitHub presence is increasing you can open up an issue [here](https://github.com/enigmadigm/greenmesa/issues)"
                    },
                    {
                        name: "What am I supposed to do?",
                        value: "`t r y   n o t   t o   g e t   c a u g h t`. *kidding* You can refer to the status of the bot at any time to remind yourself of the prefix and help command."
                    }
                ],
                timestamp: new Date(),
                footer: {
                    icon_url: client.user.avatarURL,
                    text: "The Help"
                }
            }
        });

    }
}
