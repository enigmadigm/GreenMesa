import xlg from "../../xlogger";
// import { getGuildSetting } from "../dbmanager";
import { permLevels } from '../../permissions';
import { stringToMember } from '../../utils/parsers';
import { Command } from "src/gm";

export const command: Command = {
    name: 'unmute',
    description: {
        short: 'unmute a member',
        long: 'Allows a muted member to speak again.'
    },
    usage: "<user @ / user id>",
    args: true,
    guildOnly: true,
    permLevel: permLevels.mod,
    async execute(client, message, args) {
        try {
            if (!message.guild || !message.member) return;

            const moderationEnabled = await client.database?.getGuildSetting(message.guild, 'all_moderation');
            if (!moderationEnabled || moderationEnabled.value === 'disabled') {
                return client.specials?.sendModerationDisabled(message.channel);
            }

            const toMute = await stringToMember(message.guild, args[0], false, false, false);
            // Check perms, self, rank, etc
            if (!message.guild.me?.hasPermission("MANAGE_ROLES")) { // check if the bot has the permissions to mute  members
                message.channel.send("🟥 I do not have the permissions to do that");
                return;
            }
            if (!toMute) {
                message.channel.send('🟥 You did not specify a user mention or ID!');
                return;
            }
            if (toMute.id === message.author.id) {
                message.channel.send('🟥 You cannot unmute yourself!');
                return;
            }
            if (toMute.roles.highest.position >= message.member.roles.highest.position) {
                message.channel.send('🟥 You cannot unmute a member that is equal to or higher than yourself!');
                return;
            }
            if (!toMute.manageable) {
                message.channel.send(`🟥 I don't have a high enough role to manage ${toMute || 'that user'}.`);
                return;
            }

            // Check if the user has the mutedRole ???? check if muted role exists
            const mutedRole = message.guild.roles.cache.find(r => r.name.toLowerCase() === 'muted' || r.name.toLowerCase() === 'mute');

            // If the mentioned user or ID does not have the "mutedRole" return a message
            if (!mutedRole || !toMute.roles.cache.has(mutedRole.id)) {
                message.channel.send('\\🟥 User not muted');
                return;
            }

            // Remove the mentioned users role "mutedRole", "muted.json", and notify command sender
            await toMute.roles.remove(mutedRole, `unmuted by ${message.author.tag}`);
            if (toMute.voice.connection && toMute.voice.mute) toMute.voice.setMute(false).catch(console.error);

            message.channel.send(`\\✅ Unmuted ${toMute.user.tag}`).catch(console.error);
        } catch (error) {
            xlg.error(error);
            await client.specials?.sendError(message.channel, "Failure while removing mute");
            return false;
        }
    }
}

