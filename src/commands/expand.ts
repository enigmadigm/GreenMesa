import xlg from "../xlogger";
import { permLevels } from '../permissions';
//const { getGlobalSetting } = require("../dbmanager");
import { genPhrase } from "../utils/wordfromacronym.js";
import { Command } from "src/gm";

const command: Command = {
    name: "expand",
    description: {
        short: "tells you the expanded version of any acronym",
        long: "Give any set of letters (an acronym), and this bot will tell you what they mean."
    },
    category: "fun",
    usage: "<acronym>",
    args: true,
    specialArgs: 1,
    permLevel: permLevels.member,
    guildOnly: true,
    ownerOnly: false,
    async execute(client, message, args) {
        try {
            //if (args.length > 1) {
            //    client.specials.sendError(message.channel, "Only one abbreviation allowed, for now");
            //    return;
            //}
            //const a = args[0];
            const a = args.join("");
            if (!/^[A-z]+$/.test(a)) {
                client.specials?.sendError(message.channel, "Only (A-z) letters allowed", true);
                return;
            }
            const phrase = genPhrase(a.toLowerCase()).split(" ").map(w => {
                //console.log(w)
                return w[0].toUpperCase() + w.substring(1);
            }).join(" ");
            if (phrase.length > 2000) {
                client.specials?.sendError(message.channel, "😊😏 your acronym was too large");
                return;
            }
            message.channel.send(phrase);
        } catch (error) {
            xlg.error(error);
            await client.specials?.sendError(message.channel);
            return false;
        }
    }
}

export default command;