module.exports = {
    name: 'ennounce',
    description: 'Make the bot send a custom embed with optional color. Sender message is deleted, you must either have MENTION_EVERYONE permissions or have a role called Moderator or Admin. Colors can be sent in decimal, 0x hex format, or just type a common color with \\ before it as a shortcut.',
    args: true,
    usage: '[theme color decimal < 16777215] <content>',
    guildOnly: true,
    async execute(client, message, args) {
        // Getting ID of Admin role for next part
        let Admina = message.guild.roles.find(x => x.name === "Admin");
        // Added this for someone who has annnouncement perms but is not an admin
        let AdminPerma = message.guild.roles.find(x => x.name === "Moderator");
        // Using ID of Admin role to find out if author has it
        if (message.member.hasPermission("MENTION_EVERYONE", false, true, true) || (AdminPerma && message.member.roles.has(AdminPerma.id)) || (Admina && message.member.roles.has(Admina.id))) {
            var sclength = 0;
            var seacolor;
            if (isNaN(args[0]) == false && args[0] <= 16777215) {
                seacolor = parseInt(args[0]);
                sclength = 0;
                args.shift();
            } else if (args[0].startsWith("0x") && args[0].length == 8 && /[a-zA-Z0-9]/.test(args[0])) {
                seacolor = args[0].parseInt();
                args.shift();
            } else if (args[0] == "\\red") {
                seacolor = 0xff0000;
                args.shift();
            } else if (args[0] == "\\blue") {
                seacolor = 0x0000ff;
                args.shift();
            } else if (args[0] == "\\green") {
                seacolor = 0x00ff00;
                args.shift();
            } else if (args[0] == "\\yellow") {
                seacolor = 0xffff00;
                args.shift();
            } else if (args[0] == "\\orange") {
                seacolor = 0xffa500;
                args.shift();
            } else if (args[0] == "\\purple") {
                seacolor = 0x800080;
                args.shift();
            } else if (args[0] == "\\pink") {
                seacolor = 0xffc0cb;
                args.shift();
            } else if (args[0] == "\\indigo") {
                seacolor = 0x4b0082;
                args.shift();
            } else {
                seacolor = 0x3498db;
                sclength = 0;
            }
            message.delete().catch(O_o => {O_o});
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
            message.delete().catch(O_o => {O_o});
            const noPermMsg = await message.channel.send("Insufficient permissions for `ennounce`");
            setTimeout(() => {
                noPermMsg.delete().catch(O_o => {O_o});
            }, 3000);
        }

    }
}