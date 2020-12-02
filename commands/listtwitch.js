const xlg = require("../xlogger");
const { permLevels } = require('../permissions');
const { getTwitchSubsGuild, getGlobalSetting } = require("../dbmanager");
//const { twitchIDLookup } = require("../website/routes/twitch");

module.exports = {
    name: "listtwitch",
    aliases: ["lstwitch"],
    description: {
        short: "list twitch subscriptions",
        long: "Get all of the Twitch streamers your server is subscribed to."
    },
    permLevel: permLevels.member,
    guildOnly: true,
    ownerOnly: false,
    async execute(client, message) {
        try {
            const subs = await getTwitchSubsGuild(message.guild.id || "");
            if (!subs) {
                client.specials.sendError(message.channel, "No subscriptions found.");
                return false;
            }

            const streamers = subs.map((s) => {
                const name = s.streamerlogin || s.streamerid;
                if (name) {
                    return `• [${name}](https://twitch.tv/${name})`
                }
            })

            const iec = parseInt((await getGlobalSetting("info_embed_color"))[0].value, 10);
            message.channel.send({
                embed: {
                    color: iec,
                    title: "Twitch Subscriptions",
                    description: `${streamers.join("\n")}\n`
                }
            })
        } catch (error) {
            xlg.error(error);
            await client.specials.sendError(message.channel);
            return false;
        }
    }
}