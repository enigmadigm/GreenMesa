import xlg from "../../xlogger";
import { permLevels } from '../../permissions';
import { Command } from "src/gm";
//import { getGuildSetting } from "../dbmanager";

export const command: Command = {
    name: "restrict",
    description: {
        short: "restrict command usage to a certain role",
        long: "Use to restrict the usage of all commands for this bot to a certain specified role in the server"
    },
    usage: "<command> <role>",
    args: true,
    permLevel: permLevels.admin,
    guildOnly: true,
    ownerOnly: true,
    moderation: true,
    async execute(client, message) {
        try {
            if (!message.guild) return;
            
            client.specials?.sendError(message.channel, "Command currently in development");
        } catch (error) {
            xlg.error(error);
            client.specials?.sendError(message.channel);
            return false;
        }
    }
}

