import { permLevels } from '../../permissions';
import { Command, GuildMessageProps } from "src/gm";
import { PaginationExecutor } from "../../utils/pagination";
import { MessageActionRow, MessageButton } from 'discord.js';

export const command: Command<GuildMessageProps> = {
    name: "invr",
    description: {
        short: "invite rewards",
        long: "Configure the invite rewards system. Send without arguments to view the current reward list summary.",
    },
    usage: "[]",
    args: 0,
    cooldown: 1,
    permLevel: permLevels.mod,
    guildOnly: true,
    permissions: ["MANAGE_GUILD", "EMBED_LINKS"],
    async execute(client, message, args) {
        try {
            const row1 = new MessageActionRow()
                .addComponents(
                    new MessageButton()
                        .setCustomID("1")
                        .setLabel("One")
                        .setStyle("PRIMARY")
                );
            const m = await message.channel.send("Test", { components: [row1] });
        } catch (error) {
            xlg.error(error);
            await client.specials?.sendError(message.channel);
            return false;
        }
    }
}
