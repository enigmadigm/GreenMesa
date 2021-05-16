import { Command } from "src/gm";


export const command: Command = {
    name: 'why',
    description: 'ask: why',
    async execute(client, message) {
        try {
            message.channel.send({
                embed: {
                    color: await client.database.getColor("info") || 3447003,
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

