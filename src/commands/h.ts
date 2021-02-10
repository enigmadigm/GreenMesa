import xlg from "../xlogger";
import { permLevels } from '../permissions';
import { Command } from "src/gm";

export const command: Command = {
    name: "h",
    description: {
        short: "ignore me",
        long: "ignore me"
    },
    specialArgs: 0,
    cooldown: 1,
    permLevel: permLevels.trustedMember,
    guildOnly: true,
    async execute(client, message, args) {
        try {
            if (message.gprefix !== "sm" || args.length || message.content !== "smh") return;// I pretty much only need the last check, but whatever
            message.channel.send("my head");// It kind of annoys me when people say this actually
        } catch (error) {
            xlg.error(error);
            await client.specials?.sendError(message.channel);
            return false;
        }
    }
}
