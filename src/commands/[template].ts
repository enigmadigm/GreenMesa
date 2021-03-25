import xlg from "../xlogger";
import { permLevels } from '../permissions';
import { Command } from "src/gm";

export const command: Command = {
    name: "",
    aliases: [""],
    description: {
        short: "",
        long: ""
    },
    usage: "",
    args: false,
    cooldown: 1,
    permLevel: permLevels.trustedMember,
    moderation: undefined,
    guildOnly: true,
    ownerOnly: false,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async execute(client, message, args) {
        try {
            //
        } catch (error) {
            xlg.error(error);
            await client.specials?.sendError(message.channel);
            return false;
        }
    }
}
