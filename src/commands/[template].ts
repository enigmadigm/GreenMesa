import { permLevels } from '../permissions.js';
import { Command } from "src/gm";

export const command: Command = {
    name: "",
    aliases: [""],
    description: {
        short: "",
        long: ""
    },
    flags: undefined,
    examples: undefined,
    usage: "",
    args: false,
    cooldown: 1,
    permLevel: permLevels.member,
    moderation: undefined,
    guildOnly: true,
    ownerOnly: false,
    permissions: [],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async execute(client, message, args, flags) {
        try {
            //
        } catch (error) {
            xlg.error(error);
            await client.specials.sendError(message.channel);
            return false;
        }
    }
}
