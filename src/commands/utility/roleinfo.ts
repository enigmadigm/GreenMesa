import { permLevels } from '../../permissions.js';
import { Command } from "src/gm";
import { stringToRole } from "../../utils/parsers.js";

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
            const role = stringToRole(message.guild, args.join(" "), true, true);
            if (!role) {
                await client.specials.sendError(message.channel, "A valid role could not be found");
                return;
            }
            await message.channel.send({
                embeds: [{
                    color: role.color > 150 ? role.color : await client.database.getColor("info"), 
                    description:
`Role info for ${role}

**ID:** ${role.id}
**Members (est.):** ${role.members.size}
**Mentionable:** ${role.mentionable}
**Permissions Int:** ${role.permissions.bitfield}
**Color Hex:** ${role.hexColor}
`
                }]
            })
        } catch (error) {
            xlg.error(error);
            await client.specials.sendError(message.channel);
            return false;
        }
    }
}
