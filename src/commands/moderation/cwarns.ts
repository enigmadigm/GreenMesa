import { permLevels } from '../../permissions';
import { Command, GuildMessageProps } from "src/gm";
import { stringToMember } from "../../utils/parsers";

export const command: Command<GuildMessageProps> = {
    name: "cwarns",
    aliases: ["cwarn"],
    description: {
        short: "clear moderator warnings",
        long: "Use to clear the warnings assigned to a user when warned by either the automod or a server moderator."
    },
    usage: "<member>",
    args: true,
    cooldown: 2,
    permLevel: permLevels.mod,
    moderation: true,
    guildOnly: true,
    async execute(client, message, args) {
        try {
            const a = args.join(" ");
            const target = await stringToMember(message.guild, a, false, false, false);
            if (!target) {
                await client.specials.sendError(message.channel, "Invalid target", true);
                return;
            }
            const warns = await client.database.getModActionsByUserAndType(target.guild.id, target.id, "warn");
            // if (!warns) {
            //     await client.specials.sendError(message.channel, "Unable to retrieve user information.", true);
            //     return;
            // }
            if (!warns) {
                await client.specials.sendError(message.channel, `${target} (${target.id}) does not have any recorded warnings.`);
                return;
            }
            client.database.setModAction
            // const delResult = await client.database.delModActions({
            //     guildid: target.guild.id,
            //     userid: target.id,
            //     type: "warn",
            // });
            const editResult = await client.database.massUpdateModActions({ guildid: target.guild.id, userid: target.id, type: "warn" }, { type: "d-warn" });
            if (editResult && editResult.affectedRows) {
                await message.channel.send(`Warnings (${editResult.affectedRows}) cleared for ${target}`);
            } else {
                await client.specials.sendError(message.channel, `Could not clear warnings`, true);
            }
        } catch (error) {
            xlg.error(error);
            await client.specials.sendError(message.channel);
            return false;
        }
    }
}
