import { Command } from "src/gm";
import xlg from "../xlogger";

const command: Command = {
    name: 'why',
    description: 'ask: why',
    category: 'fun',
    async execute(client, message) {
        try {
            message.channel.send({
                embed: {
                    color: await client.database?.getColor("info_embed_color") || 3447003,
                    fields: [{
                        name: "Why?",
                        value: "because"
                    }],
                    footer: {
                        text: `The dev knows this cmd is stupid`
                    }
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