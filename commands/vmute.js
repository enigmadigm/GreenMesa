const { permLevels } = require('../permissions');

module.exports = {
    name: 'vmute',
    description: 'Mute or unmute a user on voice. If the user is muted, they will be unmuted, and vice versa.',
    aliases: ["unvmute", "voicemute"],
    usage: "",
    args: true,
    guildOnly: true,
    ownerOnly: true,
    permLevel: permLevels.mod,
    async execute(client, message) {
        const user = message.mentions.users.first();
        // If user mentioned
        if (user) {
            // get member from user
            const member = message.guild.member(user);
            // If the member is in the guild
            if (member) {
                let shouldMute;
                //let muteReason; // add this feature
                if (member.serverMute) {
                    shouldMute = false;
                } else {
                    shouldMute = true;
                }
                member.setMute(shouldMute).then(() => {
                    message.delete();
                    message.channel.send(`${member} was muted.`);
                    /*let logChannel = client.channels.get(config.logChannel.id) || member.guild.channels.find(ch => ch.name === config.logChannel.name);
                    logChannel.send({
                        embed: {
                            "title": `User ${((shouldMute) ? 'Muted' : 'Unmuted')}`,
                            "description": `${member} was ${((shouldMute) ? 'muted' : 'unmuted')} by ${message.author}`,
                            "timestamp": new Date(),
                            "footer": {
                                "text": `Muted ID: ${member.id}`
                            }
                        }
                    });*/
                }).catch(err => {
                    // An error happened
                    // This is generally due to the bot not being able to kick the member,
                    // either due to missing permissions or role hierarchy
                    message.reply('the member could not be affected.');
                    // Log the error
                    console.error(err);
                });
            } else {
                // The mentioned user isn't in this guild
                message.reply('the user does not exist in the guild.');
            }
            // Otherwise, if no user was mentioned
        } else {
            message.reply('no user mentioned.');
        }
    }
}