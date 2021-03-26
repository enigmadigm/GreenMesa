import { Command } from "src/gm";
import xlg from "../xlogger";
// import { getGlobalSetting } from "../dbmanager";

export const command: Command = {
    name: "triangle",
    description: "find the area of a triangle",
    usage: "<base> <height>",
    args: true,
    async execute(client, message, args) {
        try {
            if (!(await client.specials?.argsNumRequire(message.channel, args, 2))) return false;
            if (!(await client.specials?.argsMustBeNum(message.channel, args))) return false;
    
            const x = parseInt(args[0], 10);
            const y = parseInt(args[1], 100);
    
            message.channel.send({
                embed: {
                    color: await client.database.getColor("darkgreen_embed_color"),
                    title: "Area of Triangle",
                    description: `The area of a triangle with \`BASExHEIGHT\` \`${x}x${y}\` is \`${(x * y) / 2}\``
                }
            });
        } catch (error) {
            xlg.error(error);
            await client.specials?.sendError(message.channel);
            return false;
        }
    }
}

