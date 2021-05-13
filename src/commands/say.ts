import { NewsChannel, TextChannel } from "discord.js";
import { Command } from "src/gm";
import { permLevels } from "../permissions";
import { stringToChannel } from "../utils/parsers";


export const command: Command = {
    name: 'say',
    description: {
        short: "speak through the bot",
        long: "Make the bot say something. Must be moderator."
    },
    args: true,
    usage: "[channel] <bot message>",
    guildOnly: true,
    permLevel: permLevels.mod,
    category: 'utility',
    cooldown: 1,
    async execute(client, message, args) {
        try {
            if (!message.guild) return;
            const channel = stringToChannel(message.guild, args[0], false, false);
            if (channel && (channel instanceof TextChannel || channel instanceof NewsChannel)) {
                args.shift();
                if (!args.length) {
                    client.specials?.sendError(message.channel, `Stuff to send was not specified.`);
                    return;
                }
                await channel.send(args.join(" "));
                return;
            }
            await message.delete();
            await message.channel.send(args.join(" "));
        } catch (error) {
            xlg.error(error);
            await client.specials?.sendError(message.channel);
            return false;
        }
    }
}

