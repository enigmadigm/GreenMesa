const xlg = require("../xlogger");
const { permLevels } = require('../permissions');
const { stringToChannel } = require("../utils/parsers");
const { addTwitchWebhook } = require("../website/routes/twitch");
//const { getTwitchSubsForID } = require("../dbmanager");

module.exports = {
    name: "addtwitch",
    aliases: ["addt"],
    description: {
        short: "create a twitch notifier",
        long: "Create a Twitch Notifier. Using a Twitch username and channel that you provide, this will send notifications to the channel when your streamer goes live."
    },
    usage: "<#channel> <streamer name> [notification message]",
    args: true,
    permLevel: permLevels.admin,
    guildOnly: true,
    async execute(client, message, args) {
        try {
            const targetChannel = stringToChannel(message.guild, args[0]);
            if (!targetChannel) {
                client.specials.sendError(message.channel, "Invalid Channel");
                return;
            }
            const targetUsername = args[1];
            const hookRes = await addTwitchWebhook(targetUsername, false);
            if (!hookRes) {
                client.specials.sendError(message.channel, "Error When Creating Subscription With Twitch");
                return;
            }
        } catch (error) {
            xlg.error(error);
            await client.specials.sendError(message.channel);
            return false;
        }
    }
}