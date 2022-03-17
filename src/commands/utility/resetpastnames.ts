import { permLevels } from '../../permissions';
import { Command, GuildMessageProps } from "src/gm";

export const command: Command<GuildMessageProps> = {
    name: "resetpastnames",
    description: {
        short: "resets name history",
        long: "Resets the tracked list of past names for yourself."
    },
    args: 0,
    cooldown: 5,
    permLevel: permLevels.member,
    guildOnly: true,
    ownerOnly: false,
    permissions: [],
    async execute(client, message) {
        try {
            await client.database.updateGuildUserData({
                guildid: message.guild.id,
                userid: message.author.id,
                nicknames: ``,
            });
            await message.channel.send(`Your past names have been reset`);
        } catch (error) {
            xlg.error(error);
            await client.specials?.sendError(message.channel);
            return false;
        }
    }
}
