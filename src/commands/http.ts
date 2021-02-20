import xlg from "../xlogger";
//import { getGlobalSetting } from "../dbmanager";
import httpdcodes from "../../httpcodes.json";
import { permLevels } from '../permissions';
import { Command } from "src/gm";
import { stringSimilarity } from "../utils/parsers";

export const command: Command = {
    name: "http",
    aliases: ["https"],
    description: {
        short: "find an http error code",
        long: "Find out what an http error code means. This command is under development."
    },
    usage: "<code>",
    specialArgs: undefined,
    permLevel: permLevels.trustedMember,
    async execute(client, message, args) {
        try {
            if (!args.length) {
                message.channel.send({
                    embed: {
                        color: await client.database?.getColor("fail_embed_color"),
                        title: "error 422",
                        description: "(lack of arguments)"
                    }
                });
                return;
            }
            const codes = <{ code: string, description: string }[]>httpdcodes;
            const text = args.join(" ");
            //const randcode = httpdcodes[Math.floor(Math.random() * httpdcodes.length)].code
            const code = codes.find(c => c.code === text) || codes.reduce((prev, curr) => {
                return (stringSimilarity(curr.description, text) > stringSimilarity(prev.description, text) ? curr : prev);
            });
            if (!code) {
                await client.specials?.sendError(message.channel, "Sorry friend, I couldn't find your error code. That's gonna be a 404.");
                return;
            }
            message.channel.send({
                embed: {
                    color: await client.database?.getColor("darkgreen_embed_color"),
                    title: `${code.code}`,
                    description: `${code.description}`
                }
            });
        } catch (error) {
            xlg.error(error);
            await client.specials?.sendError(message.channel);
            return false;
        }
    }
}

