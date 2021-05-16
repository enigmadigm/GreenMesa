
import { permLevels } from '../permissions';
import { Command } from "src/gm";

export const command: Command = {
    name: "ilovemee6",
    aliases: ["ilovem6"],
    description: {
        short: "send this command",
        long: "I see, I see...",
    },
    permLevel: permLevels.member,
    permissions: ["USE_EXTERNAL_EMOJIS"],
    async execute(client, message) {
        try {
            await message.react("<:x_mee6check:837491038339727390>");
            await message.channel.send(`You cannot ban yourself!`);
        } catch (error) {
            xlg.error(error);
            // await client.specials?.sendError(message.channel);
            return false;
        }
    }
}
