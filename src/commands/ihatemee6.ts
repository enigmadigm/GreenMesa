import xlg from "../xlogger";
import { permLevels } from '../permissions';
import { Command } from "src/gm";

export const command: Command = {
    name: "ihatemee6",
    aliases: ["ihatem6"],
    description: {
        short: "do you?",
        long: "But, alas, it is a self sustaining feedback loop of user growth and support from Discord.",
    },
    permLevel: permLevels.member,
    permissions: [],
    async execute(client, message) {
        try {
            await message.react("<:x_mee6check:837491038339727390>");
            await message.author.send(`So do I <:x_mee6wink:837491049608904764>`);
        } catch (error) {
            xlg.error(error);
            // await client.specials?.sendError(message.channel);
            return false;
        }
    }
}
