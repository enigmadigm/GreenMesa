
import { permLevels } from '../../permissions.js';
import { Command } from "src/gm";

export const command: Command = {
    name: "roleme",
    aliases: ["rme"],
    description: {
        short: "get self-assignable roles",
        long: "Use to assign yourself roles that have been set by admins."
    },
    usage: "[role] or [set|list|remove] role]",
    examples: [
        "@new role",
        "sm rme set @new role",
        "sm rme set 0 @new role"
    ],
    args: true,
    cooldown: 1,
    permLevel: permLevels.admin,
    moderation: true,
    guildOnly: true,
    async execute(client, message) {
        try {
            await message.channel.send(`This command has not been completed yet.`);
        } catch (error) {
            xlg.error(error);
            await client.specials?.sendError(message.channel);
            return false;
        }
    }
}
