import xlg from "../../xlogger";
import { permLevels } from '../../permissions';
import { Command } from "src/gm";
import { stringToRole } from "../../utils/parsers";

export const command: Command = {
    name: "roleinfo",
    aliases: ["ri"],
    description: {
        short: "get information on a role",
        long: "Get information on a role."
    },
    usage: "<role>",
    args: true,
    cooldown: 1,
    permLevel: permLevels.trustedMember,
    guildOnly: true,
    async execute(client, message, args) {
        try {
            if (!message.guild) return;

            const role = stringToRole(message.guild, args.join(" "), true, true, false);
            if (!role || role === "@everyone" || role === "@here") {
                client.specials?.sendError(message.channel, "A valid role could not be found");
                return;
            }
            await message.channel.send({
                embed: {
                    color: role.color > 150 ? role.color : await client.database.getColor("info_embed_color"), 
                    description:
`Role info for ${role}

**ID:** ${role.id}
**Members (est.):** ${role.members.size}
**Mentionable:** ${role.mentionable}
**Permissions Int:** ${role.permissions.bitfield}
**Color Hex:** ${role.hexColor}
`
                }
            })
        } catch (error) {
            xlg.error(error);
            await client.specials?.sendError(message.channel);
            return false;
        }
    }
}
