import { permLevels } from '../../permissions.js';
import { Z } from "../../utils/zalgo.js";
import { Command } from "src/gm";

export const command: Command = {
    name: "zalgo",
    aliases: ["za"],
    description: {
        short: "generate zalgo text",
        long: "This will generate beautiful zalgo text from an input."
    },
    usage: "<text>",
    args: true,
    permLevel: permLevels.trustedMember,
    async execute(client, message, args) {
        try {
            const ja = args.join(" ");
            const zt = Z.generate(ja);
            await message.channel.send(zt);
        } catch (error) {
            xlg.error(error);
            await client.specials.sendError(message.channel);
            return false;
        }
    }
}
