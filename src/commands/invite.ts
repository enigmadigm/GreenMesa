import { Command } from "src/gm";

export const command: Command = {
    name: 'invite',
    description: 'invite link to bring the bot to your server',
    usage: "[id of a server you can invite on]",
    async execute(client, message, args) {
        let guildIdParam = "";
        if (args.length && args.length == 1 && !isNaN(parseInt(args[0])) && args[0].toString().length == 18) {
            guildIdParam = `&guild_id=${args[0]}`;
        }
        message.channel.send({
            embed: {
                color: 3447003,
                description: `[Invite to get me on your server](https://discordapp.com/api/oauth2/authorize?client_id=${client.user?.id}&permissions=2147483639&scope=bot&${guildIdParam})`,
                fields: [
                    {
                        name: `\u200b`,
                        value: `**IMPORTANT:** Make sure all moderation commands work by confirming that the bot's role is above every role it should be able to manage, like @everyone.\n\n[Steps to get bot (low effort)](https://git.io/fjmEX).`
                    }
                ],
                timestamp: new Date().getTime(),
                footer: {
                    icon_url: client.user?.avatarURL() || undefined,
                    text: "Invite"
                }
            }
        });

    }
}

