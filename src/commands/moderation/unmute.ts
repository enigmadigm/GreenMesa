import { permLevels } from '../../permissions.js';
import { stringToMember } from '../../utils/parsers.js';
import { Command } from "src/gm";
import { Permissions } from 'discord.js';
import { unmute } from '../../utils/modactions.js';

export const command: Command = {
    name: 'unmute',
    description: {
        short: 'unmute a member',
        long: 'Allows a muted member to speak again.'
    },
    usage: "<user @>",
    args: true,
    guildOnly: true,
    permLevel: permLevels.mod,
    moderation: true,
    async execute(client, message, args) {
        try {
            const toMute = await stringToMember(message.guild, args[0], false, false, false);
            // Check perms, self, rank, etc
            if (!message.guild.me?.permissions.has(Permissions.FLAGS.MANAGE_ROLES)) { // check if the bot has the permissions to mute  members
                await message.channel.send("I do not have the permissions to do that");
                return;
            }
            if (!toMute) {
                await message.channel.send('You did not specify a user mention or ID!');
                return;
            }
            if (toMute.id === message.author.id) {
                await message.channel.send('You cannot unmute yourself!');
                return;
            }
            const dbmr = await client.database.getGuildSetting(message.guild, "mutedrole");
            const mutedRoleID = dbmr ? dbmr.value : "";
            if (toMute.roles.cache.filter(r => r.id !== mutedRoleID).sort((a, b) => a.position - b.position).first()?.position || 0 >= message.member.roles.highest.position && message.guild.ownerId !== message.member.id) {
                await message.channel.send('You cannot unmute a member that is equal to or higher than yourself!');
                return;
            }

            const unmuteResult = await unmute(client, toMute, message.member);
            if (unmuteResult) {
                await message.channel.send(`${unmuteResult}`);
            } else {
                await message.channel.send(`\\✅ Unmuted ${toMute.user.tag}`).catch(console.error);
            }
        } catch (error) {
            xlg.error(error);
            await client.specials.sendError(message.channel, "Failure while removing mute");
            return false;
        }
    }
}
