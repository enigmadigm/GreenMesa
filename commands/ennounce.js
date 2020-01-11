module.exports = {
    name: 'ennounce',
    description: 'Deliver some message inside an embed with optional color choice, and tagged with Admin Message with the senders profile picture. Sender message is deleted, you must either have MENTION_EVERYONE permissions or have a role called Moderator or Admin',
    args: true,
    usage: '[theme color decimal < 16777215] <content>',
    guildOnly: true,
    async execute(client, message, args) {
        // The following actually works in finding out if author has the admin role, however when this executes console gives warning to `Pass function`?
        // Getting ID of Admin role for next part
        let Admina = message.guild.roles.find(x => x.name === "Admin");
        // Added this for someone who has annnouncement perms but is not an admin
        let AdminPerma = message.guild.roles.find(x => x.name === "Moderator");
        // Using ID of Admin role to find out if author has it
        if (message.member.hasPermission("MENTION_EVERYONE", false, true, true) || (AdminPerma && message.member.roles.has(AdminPerma.id)) || (Admina && message.member.roles.has(Admina.id))) {
            console.log('hey')
            // makes the bot say something and delete the message. As an example, it's open to anyone to use. EDIT:
            // if say is empty the bot makes up something.
            if (args.length > 0) {
                // To get the "message" itself we join the `args` back into a string with spaces:
                const sayMessage = args.join(" ");
                // Then we delete the command message (sneaky, right?). The catch just ignores the error with a cute smiley thing.
                message.delete().catch(O_o => {});
                //not sure where I got this from (forgetting my edit: message.edit.catch(O_o=>{});
                // And we get the bot to say the thing:
                if (isNaN(args[0]) == false && args[0] <= 16777215) {
                    var seacolor = parseInt(args[0]);
                    var sclength = args[0].length;
                } else {
                    var seacolor = 3447003;
                    var sclength = 0;
                }
                message.channel.send({
                    embed: {
                        color: seacolor,
                        description: args.join(" ").slice(sclength).trim(),
                        timestamp: new Date(),
                        footer: {
                            icon_url: message.author.avatarURL,
                            text: "Administrator message"
                        }
                    }
                });
            } else {
                // Else statement activated if user did not enter any parameters
                //=!=!= NOTE =!=!= cannot edit a message authored by another user =!=!= NOTE =!=!=
                // Deleting command message from requesting user to make it look "cooler"
                message.delete().catch(O_o => {});
                // Telling user that the bot can't say anything without something to say
                message.channel.send("**" + client.user.username + "  ERROR =>  MID" + message.id + "  ! EXEC COMM NO PARAMS ** *Command:* `$ennounce` *Description:* `$esay` command but for moderators/admins, doesn't come with mark, used for courtesy, notification, warnings, other messages. Use `$esay` for all other purposes. *Syntax:* `$ennounce [color code] <message w/ formatting>`");
            }
        } else {
            message.delete().catch(O_o => {});
            const noPermMsg = await message.channel.send("Insufficient permissions for `ennounce`");
            setTimeout(() => {
                noPermMsg.delete().catch(O_o => {});
            }, 3000);
        }

    }
}