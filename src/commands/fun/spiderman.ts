import { permLevels } from '../../permissions.js';
import { Command } from "src/gm";

export const command: Command = {
    name: 'spiderman',
    aliases: ['spidey'],
    description: {
        short: "a family guy reference",
        long: "A family guy reference. Ask spiderman for help.",
    },
    guildOnly: true,
    permLevel: permLevels.trustedMember,
    async execute(client, message) {
        if (!message.member) return;
        const xpInfo = await client.database.getXP(message.member);
        if (xpInfo && xpInfo.spideySaved) {
            await message.channel.send({
                embeds: [{
                    color: await client.database.getColor("darkred_embed_color"),
                    description: '<:spidey_face:754750502083887165> says: [everybody gets one](https://digmsl.link/3nn2WFX)',
                }],
            });
            return;
        }
        const savedRes = await client.database.setSpideySaved(message.member);
        if (!savedRes) {
            await client.specials.sendError(message.channel, "**error**, Spiderman was unavailable :/")
            return;
        }
        await message.channel.send({
            embeds: [{
                color: await client.database.getColor("darkred_embed_color"),
                title: "<:spidey_face:754750502083887165> :spider_web:",
                description: "Spiderman saves you",
                footer: {
                    text: `send again`,
                },
            }],
        });
        return;
    }
}
