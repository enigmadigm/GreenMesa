import xlg from "../xlogger";
import { permLevels } from '../permissions';
import { XClient, XMessage } from "src/gm";
//const { getGlobalSetting } = require("../dbmanager");

module.exports = {
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
    permLevel: permLevels.trustedMember,
    guildOnly: true,
    ownerOnly: false,
    async execute(client: XClient, message: XMessage, args: string[]) {
        try {
            //
        } catch (error) {
            xlg.error(error);
            await client.specials.sendError(message.channel);
            return false;
        }
    }
}
