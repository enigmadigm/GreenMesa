import xlg from "../../xlogger";
import { permLevels } from '../../permissions';
import { Command } from "src/gm";
import { stringToMember } from "../../utils/parsers";

export const command: Command = {
    name: "warn",
    description: {
        short: "warn a member",
        long: "Warns a user and adds a warning to their record."
    },
    usage: "<member> [reason]",
    args: true,
    cooldown: 2,
    permLevel: permLevels.mod,
    moderation: true,
    guildOnly: true,
    async execute(client, message, args) {
        try {
            if (!message.guild) return;
            const target = await stringToMember(message.guild, args[0], false, false, false);
            if (!target) {
                await client.specials?.sendError(message.channel, "Invalid target", true);
                return;
            }
            const gud = await client.database?.getGuildUserData(message.guild.id, target.id);
            if (!gud || !gud.id) {
                await client.specials?.sendError(message.channel, "Unable to retrieve user information.", true);
                return;
            }
            if (!gud.warnings) {
                gud.warnings = 0;
            } else {
                gud.warnings++;
            }
            await client.database?.updateGuildUserData(gud);
            await message.channel.send(`${target} has been warned`);
        } catch (error) {
            xlg.error(error);
            await client.specials?.sendError(message.channel);
            return false;
        }
    }
}
