const { permLevels } = require('../permissions');

module.exports = {
    name: 'kick',
    description: 'kick a user',
    args: true,
    guildOnly: true,
    permLevel: permLevels.mod,
    execute(client, message) {
        const user = message.mentions.users.first();
        // If we have a user mentioned
        if (user) {
            // Now we get the member from the user
            const member = message.guild.member(user);
            // If the member is in the guild
            if (member) {
                // let reason = args.join(" ").slice(user.length).trim();
                /**
                 * Kick the member
                 * Make sure you run this on a member, not a user!
                 * There are big differences between a user and a member
                 */
                member.kick('Optional reason that will display in the audit logs').then(() => {
                    // We let the message author know we were able to kick the person
                    message.reply(`kicked ${user.tag}`);
                    //let logChannel = client.channels.get(config.logChannel.id) || member.guild.channels.find(ch => ch.name === config.logChannel.name);
                    /*logChannel.send({
                        embed: {
                            "title": `User Kicked`,
                            "description": `${member} was kicked from the server by ${message.author}`,
                            "timestamp": new Date(),
                            "footer": {
                                "text": `Kicked ID: ${member.id}`
                            }
                        }
                    });*/
                }).catch(err => {
                    // An error happened
                    // This is generally due to the bot not being able to kick the member,
                    // either due to missing permissions or role hierarchy
                    message.reply('the member could not be kicked.');
                    // Log the error
                    console.error(err);
                });
            } else {
                // The mentioned user isn't in this guild
                message.reply('That user isn\'t in this guild!');
            }
            // Otherwise, if no user was mentioned
        } else {
            message.reply('You didn\'t mention the user to kick!');
        }
    }
}