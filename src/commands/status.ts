import { Command } from "src/gm";

export const command: Command = {
    name: "status",
    description: "returns ok",
    async execute(client, message) {
        await message.channel.send({
            embeds: [{
                color: await client.database.getColor("info"),
                description: "ok"
            }],
        });
    }
}
