import xlg from "../../xlogger";
import { permLevels } from '../../permissions';
import { Command } from "src/gm";
import { stringToMember } from "../../utils/parsers";

export const command: Command = {
    name: "clearwarnings",
    description: {
        short: "clear moderator warnings",
        long: "Use to clear the warnings assigned to a user when warned by either the automod or a server moderator."
    },
    usage: "<member>",
    args: true,
    cooldown: 2,
    permLevel: permLevels.admin,
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
            const gud = await client.database.getGuildUserData(message.guild.id, target.id);
            if (!gud || !gud.id) {
                await client.specials?.sendError(message.channel, "Unable to retrieve user information.", true);
                return;
            }
            if (!gud.warnings) {
                await client.specials?.sendError(message.channel, `${target} (${target.id}) does not have any recorded warnings.`);
                return;
            }
            gud.warnings = 0;
            await client.database.updateGuildUserData(gud);
            await message.channel.send(`Warnings cleared for ${target}`);
        } catch (error) {
            xlg.error(error);
            await client.specials?.sendError(message.channel);
            return false;
        }
    }
}
