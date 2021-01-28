import { Command } from "src/gm";
import xlg from "../xlogger";
//import { getGlobalSetting } from "../dbmanager";

const command: Command = {
    name: "botfor",
    description: "find the right bot for a topic",
    usage: "<topic>",
    args: true,
    category: 'fun',
    async execute(client, message, args) {
        try {
            message.channel.send({
                embed: {
                    color: await client.database?.getColor("fail_embed_color"),
                    title: "Error 501",
                    description: "This command will deliver you the right bot for what you want, using AI!"
                }
            });
            if (args.length) {
                const term = args.join(" ");
                message.channel.send(term);
            }
        } catch (error) {
            xlg.error(error);
            await client.specials?.sendError(message.channel);
            return false;
        }
    }
}

export default command;