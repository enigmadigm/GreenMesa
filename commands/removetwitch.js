const xlg = require("../xlogger");
const { permLevels } = require('../permissions');
const { stringToChannel } = require("../utils/parsers");
const { addTwitchWebhook } = require("../website/routes/twitch");
//const { addTwitchSubscription } = require("../dbmanager");

module.exports = {
    name: "removetwitch",
    aliases: ["remt"],
    description: {
        short: "remove the existing twitch notifier",
        long: "Remove a Twitch Notifier. When you send this command, you will be prompted to destroy the current notifier that exists for your guild."
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