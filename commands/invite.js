module.exports = {
    name: 'invite',
    description: 'invite link to bring the bot to your server',
    usage: "[id of a server you can invite on]",
    execute(client, message, args) {
        let guildIdParam = "";
        if (args.length && args.length == 1 && !isNaN(args[0]) && args[0].toString().length == 18) {
            guildIdParam = `&guild_id=${args[0]}`;
        }
        message.channel.send({
            embed: {
                color: 3447003,
                fields: [{
                        name: "Direct invite link",
                        value: `[Here is the direct invite link](https://discordapp.com/api/oauth2/authorize?client_id=${client.user.id}&permissions=8&redirect_uri=https%3A%2F%2Fdigmsl.link%2Fgreenmesa&scope=bot&${guildIdParam}) to get GM on your server.\n**IMPORTANT:** When added, to make sure all commands (like management) work, please confirm that the bot's role is above every role it should be able to manage, like @everyone.`
                    },
                    {
                        name: "Step by step process",
                        value: "[Steps to get bot (low effort)](https://git.io/fjmEX)."
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