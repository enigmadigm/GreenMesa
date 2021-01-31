import xlg from "../xlogger";
import { permLevels } from '../permissions';
import { Command } from "src/gm";
//const { getGlobalSetting } = require("../dbmanager");

/*export class Template implements Command {
    name = "";
    async execute(client: XClient, message: XMessage, args: string[]): Promise<boolean | void> {
        try {
            //
        } catch (error) {
            xlg.error(error);
            await client.specials.sendError(message.channel);
            return false;
        }
    }
}*/

export const command: Command = {
    name: "",
    aliases: [""],
    description: {
        short: "",
        long: ""
    },
    category: "misc",
    usage: "",
    args: false,
    specialArgs: undefined,
    cooldown: 1,
    permLevel: permLevels.trustedMember,
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


