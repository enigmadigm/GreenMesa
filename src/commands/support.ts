import { Command } from 'src/gm';

export const command: Command = {
    name: "support",
    description: "get invite to (new) support server",
    async execute(client, message) {
        const info_embed_color = await client.database.getColor("info");
        await message.channel.send({
            embeds: [{
                color: info_embed_color,
                description: `Invite to the support server: [invite link](https://discord.gg/AvXvvSg)`
            }],
        });
    }
}
