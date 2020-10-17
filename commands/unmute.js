const { getGuildSetting } = require("../dbmanager");
const { sendModerationDisabled } = require('../utils/specialmsgs');
const { permLevels } = require('../permissions');
const { stringToMember } = require('../utils/parsers');

module.exports = {
    name: 'unmute',
    description: {
        short: 'unmute a member',
        long: 'Allows a muted member to speak again.'
    },
    usage: "<user @ / user id>",
    args: true,
    guildOnly: true,
    permLevel: permLevels.mod,
    category: 'moderation',
    async execute(client, message, args) {
        let moderationEnabled = await getGuildSetting(message.guild, 'all_moderation');
        if (!moderationEnabled[0] || moderationEnabled[0].value === 'disabled') {
            return sendModerationDisabled(message.channel);
        }
        
        const toMute = await stringToMember(message.guild, args[0], false, false, false);
        // Check perms, self, rank, etc
        if (!await message.guild.me.hasPermission("MANAGE_ROLES")) { // check if the bot has the permissions to mute  members
            message.channel.send("🟥 I do not have the permissions to do that");
            return;
        }
        if (!toMute) return message.channel.send('🟥 You did not specify a user mention or ID!');
        if (toMute.id === message.author.id) return message.channel.send('🟥 You cannot unmute yourself!');
        if (toMute.roles.highest.position >= message.member.roles.highest.position) return message.channel.send('🟥 You cannot unmute a member that is equal to or higher than yourself!');
        if (!toMute.manageable) return message.channel.send(`🟥 I don't have a high enough role to manage ${toMute || 'that user'}.`);

        // Check if the user has the mutedRole ???? check if muted role exists
        let mutedRole = message.guild.roles.cache.find(r => r.name.toLowerCase() === 'muted' || r.name.toLowerCase() === 'mute');

        // If the mentioned user or ID does not have the "mutedRole" return a message
        if (!mutedRole || !toMute.roles.cache.has(mutedRole.id)) return message.channel.send('🟥 User not muted');

        // Remove the mentioned users role "mutedRole", "muted.json", and notify command sender
        await toMute.roles.remove(mutedRole, 'unmuting');
        if (toMute.voice.connection && toMute.voice.mute) toMute.voice.setMute(false).catch(console.error);

        message.channel.send(`✅ Unmuted ${toMute.user.tag}`).catch(console.error);
        //let logChannel = client.channels.get(config.logChannel.id) || member.guild.channels.find(ch => ch.name === config.logChannel.name);
        /*logChannel.send({
            embed: {
                "title": `User Unmuted`,
                "description": `${toMute} was unmuted by ${message.author}`,
                "color": 0x90ee90,
                "timestamp": new Date(),
                "footer": {
                    "text": `Unmuted ID: ${toMute.id}`
                }
            }
        });*/

        /*
        setTimeout(function () {
            tomute.removeRole(muterole.id);
            message.channel.send(`<@${tomute.id}> has been unmuted!`);
        }, ms(mutetime));
        */
    }
}