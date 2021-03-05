import xlg from "../../xlogger";
//import { getGlobalSetting, getGuildSetting } from "../dbmanager";
import { permLevels } from '../../permissions';
import { Command } from "src/gm";
import { RoleData } from "discord.js";

export const command: Command = {
    name: "mkrole",
    description: {
        short: "create a role",
        long: "Creates a role with the given data. This does not take permissions, and by default will give no permissions to the role. NOTE that this command takes arguments separated by commas, do not include them in the name."
    },
    usage: "<role name>,[role color]",
    examples: [
        "sm mkrole red,0xFF0000"
    ],
    args: true,
    permLevel: permLevels.admin,
    guildOnly: true,
    moderation: true,
    permissions: ["MANAGE_ROLES"],
    async execute(client, message, args) {
        try {
            if (!message.guild) return;

            /*if (!message.guild.me?.hasPermission("MANAGE_ROLES")) {
                await message.channel.send("I do not have the MANAGE_ROLES permission. I need that to create roles.");
                return;
            }*/
            const param = args.join(" ").split(",");
            if (param[0] && param[0].length > 100) {// if the provided name is longer than the 100 character limit
                await client.specials?.sendError(message.channel, "Role name cannot exceed 100 characters");
                return;
            }
            const roleData: RoleData = { name: param[0] };
            const p1 = param[1];
            if (p1 && parseInt(p1.replace(/#/g, ""), 16)) {
                roleData.color = parseInt(p1.replace(/#/g, ""), 16);
            }
            try {
                const nrole = await message.guild.roles.create({ data: roleData, reason: "with mkrole command" });
                await message.channel.send({
                    embed: {
                        color: await client.database?.getColor("success_embed_color"),
                        description: `Role ${nrole} created successfully`
                    }
                });
            } catch (error) {
                client.specials?.sendError(message.channel, "I couldn't create the role, I probably don't have the permissions to")
            }
        } catch (error) {
            xlg.error(error);
            await client.specials?.sendError(message.channel, "Failure while creating role");
            return false;
        }
    }
}

