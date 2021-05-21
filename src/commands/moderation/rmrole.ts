import { stringToRole } from '../../utils/parsers';
import { permLevels } from '../../permissions';
import { Command, GuildMessageProps } from "src/gm";

export const command: Command<GuildMessageProps> = {
    name: "rmrole",
    description: "remove a role",
    usage: "<@role>",
    args: true,
    permLevel: permLevels.admin,
    guildOnly: true,
    moderation: true,
    async execute(client, message, args) {
        try {
            const target = stringToRole(message.guild, args.join(" "), true, true);
            if (!target) {
                await client.specials?.sendError(message.channel, "That role could not be found.")
                return;
            }
            if (target.name === "@everyone" && target.position === 0) {
                await client.specials?.sendError(message.channel, "@everyone is not a normal role and cannot be deleted");
                return;
            }
            await target.delete();
            await message.channel.send({
                embed: {
                    color: await client.database.getColor("success"),
                    description: `Role removed successfully`
                }
            });
        } catch (error) {
            xlg.error(error);
            await client.specials?.sendError(message.channel, "Failure removing role");
            return false;
        }
    }
}

