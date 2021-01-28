import { Command } from "src/gm";

const command: Command = {
    name: "afk",
    description: {
        short: "set an autoresponse afk message",
        long: "Use this command to set a message that this bot will send whenever it sees that you are pinged in a message. This is meant to tell people that you are AFK (Away From Keyboard) and possibly when you might be back."
    },
    async execute(client, message) {
        try {
            message.channel.send("This command is still in development");
        } catch (error) {
            xlg.error(error);
            await client.specials?.sendError(message.channel);
            return false;
        }
    }
}

export default command;