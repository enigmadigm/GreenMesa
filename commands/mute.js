const { getGuildSetting } = require("../dbmanager");
const { sendModerationDisabled } = require('../utils/specialmsgs');
const { permLevels } = require('../permissions');

module.exports = {
    name: 'mute',
    description: 'Mute a user.',
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
        
        const toMute = ((message.guild && message.guild.available) ? message.guild.members.cache.get(args[0]) : false) || message.mentions.members.first();
        // Check perms, self, rank, etc
        if (!toMute) return message.channel.send('You did not specify a user mention or ID!');
        if (toMute.id === message.author.id) return message.channel.send('You cannot mute yourself!');
        if (toMute.roles.highest.position >= message.member.roles.highest.position) return message.channel.send('You cannot mute a member that is equal to or higher than yourself!');
        if (!toMute.manageable) return message.channel.send(`I don't have a high enough role to manage ${toMute || 'that user'}.`);

        // Check if the user has the mutedRole
        let mutedRole = message.guild.roles.cache.find(r => r.name === 'Muted' || r.name === 'mute');
        // If the mentioned user does not have the muted role execute the following
        if (!mutedRole) {
            try {
                // Create a role called "Muted"
                mutedRole = await message.guild.roles.create({
                    data: {
                        name: 'Muted',
                        color: '#000000',
                        permissions: 0,
                        position: toMute.roles.highest.position + 1
                    }
                });

                // Prevent the user from sending messages or reacting to messages
                message.guild.channels.cache.each(async (channel) => {
                    await channel.updateOverwrite(mutedRole, {
                        SEND_MESSAGES: false,
                        ADD_REACTIONS: false,
                        //SPEAK: false,
                        SEND_TTS_MESSAGES: false
                    });
                });
            } catch (e) {
                console.log(e.stack);
            }
        }
        if (mutedRole.position < toMute.roles.highest.position) {
            mutedRole.setPosition(toMute.roles.highest.position);
        }

        // If the mentioned user already has the "mutedRole" then that can not be muted again
        if (toMute.roles.cache.has(mutedRole.id)) return message.channel.send('This user is already muted!');
        
        await toMute.roles.add(mutedRole, "muting").catch(e => console.log(e.stack));
        toMute.voice.setMute(true);

        message.channel.send(`I have muted ${toMute.user.tag}!`);
        /*let logChannel = client.channels.get(.id) || toMute.guild.channels.find(ch => ch.name === "");
        logChannel.send({
            embed: {
                "title": `User Muted`,
                "description": `${toMute} was muted by ${message.author}`,
                "color": 0xff033e,
                "timestamp": new Date(),
                "footer": {
                    "text": `Muted ID: ${toMute.id}`
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