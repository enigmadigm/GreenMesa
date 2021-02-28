import { Command } from "src/gm";
import { permLevels } from "../permissions";
import xlg from "../xlogger";

export const command: Command = {
    name: 'say',
    description: {
        short: "speak through the bot",
        long: "Make the bot say something. Must be moderator."
    },
    args: true,
    usage: "<bot message>",
    guildOnly: true,
    permLevel: permLevels.mod,
    category: 'utility',
    cooldown: 1,
    async execute(client, message, args) {
        try {
            message.delete();
            message.channel.send(args.join(" "));
        } catch (error) {
            xlg.error(error);
            await client.specials?.sendError(message.channel);
            return false;
        }
    }
}

