module.exports = {
    name: 'invite',
    description: 'Get the invite link for the bot so you can invite it to *your* server! If you already have the id for the server you wish to invite it to, add that as an argument. Remember you can only invite it to a server you have admin powers on.',
    usage: "[id of a server you are an admin on]",
    execute(client, message, args) {
        let guildIdParam = "";
        if (args.length && args.length == 1 && !isNaN(args[0]) && args[0].toString().length == 18) {
            guildIdParam = `&guild_id=${args[0]}`;
        }
        message.channel.send({
            embed: {
                color: 3447003,
                fields: [{
                        name: "Direct OAuth link",
                        value: `[Here](https://discordapp.com/api/oauth2/authorize?client_id=560223567967551519&permissions=8&redirect_uri=https%3A%2F%2Fdigmsl.link%2Fgreenmesa&scope=bot&${guildIdParam}) is the direct invite link to get GM on your server, there is no documentation, just the Discord OAuth invite page.`
                    },
                    {
                        name: "Step by step process",
                        value: "[Step by step process to get GM (really takes no effort)](https://git.io/fjmEX)."
                    }
                ],
                timestamp: new Date(),
                footer: {
                    icon_url: client.user.avatarURL,
                    text: message.id
                }
            }
        });

    }
}