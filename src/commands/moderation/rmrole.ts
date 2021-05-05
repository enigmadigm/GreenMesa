import xlg from "../../xlogger";
//import { getGlobalSetting, getGuildSetting } from "../dbmanager";
import { stringToRole } from '../../utils/parsers';
import { permLevels } from '../../permissions';
import { Command } from "src/gm";

export const command: Command = {
    name: "rmrole",
    description: "remove a role",
    usage: "<@role>",
    args: true,
    permLevel: permLevels.admin,
    guildOnly: true,
    moderation: true,
    async execute(client, message, args) {
        try {
            if (!message.guild) return;

            const target = stringToRole(message.guild, args.join(" "), true, true, false);
            if (!target) {
                client.specials?.sendError(message.channel, "That role could not be found.")
                return;
            }
            if (target === "@everyone" || target === "@here") {
                client.specials?.sendError(message.channel, "No @everyone or @here!")
                return;
            }
            await target.delete();
            message.channel.send({
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

