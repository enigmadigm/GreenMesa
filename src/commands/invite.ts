import { Command } from "src/gm";

export const command: Command = {
    name: "invite",
    description: {
        short: "get bot in your server",
        long: "Get the invite link and steps to bring this bot to your server.",
    },
    usage: "[id of a server you can invite on]",
    async execute(client, message, args) {
        try {
            let guildIdParam = "";
            if (args.length && args.length == 1 && /^[0-9]{18}$/.test(args.join(" "))) {
                guildIdParam = `${args[0]}`;
            }
            await message.channel.send({
                embeds: [{
                    color: await client.database.getColor("info"),
                    description: `Add ${client.user?.username} to your server **[here](${client.specials.getBackendRoot()}/invite${guildIdParam ? `/${guildIdParam}` : ""})**.\n\n**IMPORTANT:** Initial issues are likely caused by misconfigured permissions.\n\n[Steps to get bot (low effort)](https://git.io/fjmEX).`,
                    timestamp: new Date().getTime(),
                    footer: {
                        icon_url: client.user?.avatarURL() || undefined,
                        text: "Invite",
                    },
                }],
            });
        } catch (error) {
            xlg.error(error);
            await client.specials.sendError(message.channel);
            return false;
        }
    }
}

