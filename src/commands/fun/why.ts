import { Command } from "src/gm";

export const command: Command = {
    name: 'why',
    description: 'ask: why',
    args: 0,
    async execute(client, message) {
        try {
            await message.channel.send({
                embeds: [{
                    color: await client.database.getColor("info") || 3447003,
                    fields: [{
                        name: "Why?",
                        value: "because"
                    }],
                    footer: {
                        text: `ALERT: this command may be stupid`
                    },
                }],
            });
        } catch (error) {
            xlg.error(error);
            await client.specials.sendError(message.channel);
            return false;
        }
    }
}
