import xlg from "../../xlogger";
//import { getGlobalSetting, getGuildSetting } from "../dbmanager";
import { permLevels } from '../../permissions';
import { Command } from "src/gm";

interface MkRoleData {
    name: string;
    color?: number;
}

export const command: Command = {
    name: "mkrole",
    description: {
        short: "create a role",
        long: "Creates a role with the given data. This does not take permissions, and by default will give no permissions to the role. NOTE that this command takes arguments separated by commas, do not include them in the name."
    },
    usage: "<role name>,[role color]",
    args: true,
    permLevel: permLevels.admin,
    guildOnly: true,
    async execute(client, message, args) {
        try {
            if (!message.guild) return;
            const moderationEnabled = await client.database?.getGuildSetting(message.guild, 'all_moderation');
            if (!moderationEnabled || moderationEnabled.value === 'disabled') {
                return client.specials?.sendModerationDisabled(message.channel);
            }

            const param = args.join(" ").split(",");
            if (param[0] && param[0].length > 100) {// if the provided name is longer than the 100 character limit
                await client.specials?.sendError(message.channel, "Role name cannot exceed 100 characters");
                return;
            }
            const roleData: MkRoleData = { name: param[0] };
            if (args[1] && parseInt(param[1], 16)) {
                roleData.color = parseInt(param[1], 16);
            }
            const nrole = await message.guild.roles.create({ data: roleData, reason: "with mkrole command" });

            message.channel.send({
                embed: {
                    color: await client.database?.getColor("success_embed_color"),
                    description: `Role ${nrole} created successfully`
                }
            });
        } catch (error) {
            xlg.error(error);
            await client.specials?.sendError(message.channel, "Failure while creating role");
            return false;
        }
    }
}

