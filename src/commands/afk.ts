import { Command } from "src/gm";

export const command: Command = {
    name: "afk",
    description: {
        short: "set auto afk message",
        long: "Use this command to set a message that this bot will send when you are pinged. This is meant to tell people that you are away, and maybe when you will be back. It will not trigger in messages with multiple mentions.",
    },
    usage: "<text | 'off'>",
    args: true,
    async execute(client, message, args) {
        try {
            const a = args.join(" ");
            if (a === "off" || a === "~~off~~") {
                await client.database.updateUserData({
                    userid: message.author.id,
                    afk: "off",
                });
                message.channel.send("You have disabled your afk response. The bot will send this message when someone mentions you.");
                return;
            }
            if (a.length > 1900) {
                const overLength = a.length - 1900;
                await client.specials.sendError(message.channel, `Your message is ${overLength} characters too long.`);
                return;
            }
            await client.database.updateUserData({
                userid: message.author.id,
                afk: a
            });
            await message.channel.send("Your afk message has been set. The bot will send this message when someone mentions you.\nIf the bot sees you send a message, the message will be cleared.");
        } catch (error) {
            xlg.error(error);
            await client.specials.sendError(message.channel);
            return false;
        }
    }
}
