import { Command } from "src/gm";

export const command: Command = {
    name: "afk",
    description: {
        short: "set an autoresponse afk message",
        long: "Use this command to set a message that this bot will send whenever it sees that you are pinged in a message. This is meant to tell people that you are AFK (Away From Keyboard) and possibly when you might be back."
    },
    usage: "<text | off>",
    args: true,
    async execute(client, message, args) {
        try {
            const a = args.join(" ");
            if (a === "off" || a === "~~off~~") {
                await client.database.updateUserData({
                    userid: message.author.id,
                    afk: "~~off~~"
                });
                message.channel.send("You have disabled your afk response. The bot will send this message when someone mentions you.");
                return;
            }
            if (a.length > 1900) {
                const overLength = a.length - 1900;
                await client.specials?.sendError(message.channel, `Your message is ${overLength} characters too long.`);
                return;
            }
            await client.database.updateUserData({
                userid: message.author.id,
                afk: a
            });
            message.channel.send("Your afk message has been set. The bot will send this message when someone mentions you. If the bot sees you send a message, the message will be cleared.");
        } catch (error) {
            xlg.error(error);
            await client.specials?.sendError(message.channel);
            return false;
        }
    }
}
