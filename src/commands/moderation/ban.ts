import xlg from "../../xlogger";
import { permLevels } from '../../permissions';
//import { getGuildSetting } from "../dbmanager";
import { stringToMember } from "../../utils/parsers";
import Discord from 'discord.js';
import { Command } from "src/gm";

export const command: Command = {
    name: "ban",
    aliases: ["b"],
    description: {
        short: "ban a member",
        long: "Use to permanently ban a member. This will kick and prevent them from rejoining the server."
    },
    usage: "<member>",
    args: true,
    specialArgs: undefined,
    permLevel: permLevels.mod,
    guildOnly: true,
    async execute(client, message, args) {
        try {
            if (!message.guild) return;
            
            const moderationEnabled = await client.database?.getGuildSetting(message.guild, 'all_moderation');
            if (!moderationEnabled || moderationEnabled.value === 'disabled') {
                return client.specials?.sendModerationDisabled(message.channel);
            }

            const target = await stringToMember(message.guild, args[0], false, false, false);
            if (!target || !(target instanceof Discord.GuildMember)) {
                await client.specials?.sendError(message.channel, "Not a member");
                return;
            }
            if (!target.bannable) {
                await client.specials?.sendError(message.channel, `${target} is not bannable`);
                return;
            }

            args.shift();
            const reason = args.join(" ");
            try {
                target.ban({ reason: reason });
                message.channel.send(`<a:spinning_light00:680291499904073739>✅ Banned ${target.user.tag}`);
            } catch (e) {
                message.channel.send(`<a:spinning_light00:680291499904073739>🆘 Could not ban ${target.user.tag}`);
            }
        } catch (error) {
            xlg.error(error);
            await client.specials?.sendError(message.channel);
            return false;
        }
    }
}

