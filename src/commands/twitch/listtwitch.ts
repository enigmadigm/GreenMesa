import { permLevels } from '../../permissions';
import { Command } from "src/gm";

export const command: Command = {
    name: "listtwitch",
    aliases: ["lstwitch"],
    description: {
        short: "list twitch subscriptions",
        long: "Get all of the Twitch streamers your server is subscribed to."
    },
    permLevel: permLevels.member,
    guildOnly: true,
    async execute(client, message) {
        try {
            const subs = await client.database.getTwitchSubsGuild(message.guild.id);
            if (!subs) {
                client.specials.sendError(message.channel, "No subscriptions found.");
                return false;
            }

            const streamers = subs.map((s) => {
                const name = s.streamerlogin || s.streamerid;
                const chan = message.guild?.channels.cache.get(s.channelid);
                if (name) {
                    return `• [${name}](https://twitch.tv/${name})${(chan && chan.id) ? ` ${chan}` : ''}`
                }
            })

            const iec = await client.database.getColor("info");
            await message.channel.send({
                embeds: [{
                    color: iec,
                    title: "Twitch Subscriptions",
                    url: client.specials.getDashboardLink(message.guild.id, "twitch"),
                    description: `${streamers.join("\n")}\n`,
                }],
            })
        } catch (error) {
            xlg.error(error);
            await client.specials.sendError(message.channel);
            return false;
        }
    }
}
