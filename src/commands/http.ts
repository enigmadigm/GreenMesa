import httpdcodes from "../../httpcodes.json" assert {type: "json"};
import { permLevels } from '../permissions.js';
import { Command } from "src/gm";
import { stringSimilarity } from "../utils/parsers.js";

export const command: Command = {
    name: "http",
    aliases: ["https"],
    description: {
        short: "find an http error code",
        long: "Find out what an http error code means. This command is under development."
    },
    usage: "<code>",
    permLevel: permLevels.member,
    async execute(client, message, args) {
        if (!args.length) {
            await message.channel.send({
                embeds: [{
                    color: await client.database.getColor("fail"),
                    title: "error 422",
                    description: "(lack of arguments)",
                }],
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
            await client.specials.sendError(message.channel, `Sorry friend, I couldn't find your error code. That's going to be a 404.`);
            return;
        }
        await message.channel.send({
            embeds: [{
                color: await client.database.getColor("darkgreen_embed_color"),
                title: `${code.code}`,
                description: `${code.description}`,
            }],
        });
    }
}
