import { permLevels } from '../../permissions.js';
import { Command } from "src/gm";
import { CollectorFilter, MessageActionRow, MessageButton, MessageComponentInteraction } from 'discord.js';

export const command: Command = {
    name: "invr",
    description: {
        short: "invite rewards",
        long: "Configure the invite rewards system. Send without arguments to view the current reward list summary.",
    },
    usage: "[]",
    args: 0,
    cooldown: 1,
    permLevel: permLevels.admin,
    guildOnly: true,
    permissions: ["MANAGE_GUILD"],
    async execute(client, message) {
        try {
            const row1 = new MessageActionRow()
                .addComponents(
                    new MessageButton()
                        .setCustomId("1")
                        .setLabel("One")
                        .setStyle("PRIMARY")
                );
            const m = await message.channel.send({ content: "Test", components: [row1] });
            const pushFilter: CollectorFilter<[MessageComponentInteraction]> = (interaction) => interaction.user.id === message.author.id;
            const buttonOption = await m.awaitMessageComponent({ filter: pushFilter });
            if (!buttonOption) {
                return;
            }
            await buttonOption.reply(`Wow, you pressed a button`);
            await m.edit({
                content: m.content,
                embeds: m.embeds.length ? [m.embeds[0]] : undefined,
                components: [],
            });
        } catch (error) {
            xlg.error(error);
            await client.specials.sendError(message.channel);
            return false;
        }
    }
}
