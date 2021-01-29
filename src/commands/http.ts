import xlg from "../xlogger";
//import { getGlobalSetting } from "../dbmanager";
import httpdcodes from "../../httpcodes.json";
import { permLevels } from '../permissions';
import { Command } from "src/gm";

const command: Command = {
    name: "http",
    aliases: ["https"],
    description: {
        short: "find an http error code",
        long: ""
    },
    category: "misc",
    usage: "<code>",
    specialArgs: undefined,
    permLevel: permLevels.trustedMember,
    guildOnly: true,
    ownerOnly: false,
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
            message.channel.send({
                embed: {
                    color: await client.database?.getColor("fail_embed_color"),
                    title: "error 501",
                    description: "(command in development)"
                }
            });
            const randcode = httpdcodes[Math.random() * httpdcodes.length].code
            message.channel.send({
                embed: {
                    color: await client.database?.getColor("darkgreen_embed_color"),
                    title: `${randcode}`,
                    description: "here's a random code"
                }
            });
        } catch (error) {
            xlg.error(error);
            await client.specials?.sendError(message.channel);
            return false;
        }
    }
}

export default command;