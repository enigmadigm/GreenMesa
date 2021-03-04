import xlg from "../../xlogger";
import { permLevels } from '../../permissions';
import { Command } from "src/gm";
import { stringToMember } from "../../utils/parsers";

export const command: Command = {
    name: "clearoffenses",
    description: {
        short: "clear automod offenses",
        long: "Use to clear the infraction points assigned to users who violate automod policies. These are given to people no matter the automod setting. Use this to clear the offenses in your server."
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
            const gud = await client.database?.getGuildUserData(message.guild.id, target.id);
            if (!gud || !gud.id) {
                await client.specials?.sendError(message.channel, "Unable to retrieve user information.", true);
                return;
            }
            if (!gud.offenses) {
                await client.specials?.sendError(message.channel, `${target} (${target.id}) does not have any recorded automod offenses.`);
                return;
            }
            gud.offenses = 0;
            await client.database?.updateGuildUserData(gud);
            await message.channel.send(`Offenses cleared for ${target}`);
        } catch (error) {
            xlg.error(error);
            await client.specials?.sendError(message.channel);
            return false;
        }
    }
}
