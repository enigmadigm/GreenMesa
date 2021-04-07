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
                color: await client.database.getColor("info"),
                description: `Add ${client.user?.username} to your server **[here](https://stratum.hauge.rocks/invite${guildIdParam ? `/${guildIdParam}` : ""})**.\n\n**IMPORTANT:** Initial issues are likely caused by misconfigured permissions.\n\n[Steps to get bot (low effort)](https://git.io/fjmEX).`,
                timestamp: new Date().getTime(),
                footer: {
                    icon_url: client.user?.avatarURL() || undefined,
                    text: "Invite"
                }
            }
        });

    }
}

