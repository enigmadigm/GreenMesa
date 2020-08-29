const { permLevels } = require('../permissions');

module.exports = {
    name: 'unmute',
    description: 'Unmute a user.',
    usage: "<mention or id of user>",
    args: true,
    guildOnly: true,
    permLevel: permLevels.mod,
    async execute(client, message, args) {
        const toMute = message.mentions.members.first() || message.guild.members.get(args[0]);
        if (!toMute) return message.channel.send('You did not specify a user mention or ID!');
        if (toMute.highestRole.position >= message.member.highestRole.position) return message.channel.send('You can not unmute a member that is equal to or higher than yourself!');

        // Check if the user has the mutedRole ???? check if muted role exists
        let mutedRole = message.guild.roles.find(mR => mR.name === 'Muted');

        // If the mentioned user or ID does not have the "mutedRole" return a message
        if (!mutedRole || !toMute.roles.has(mutedRole.id)) return message.channel.send('This user is not muted!');

        // Remove the mentioned users role "mutedRole", "muted.json", and notify command sender
        await toMute.removeRole(mutedRole);

        message.channel.send(`I have unmuted ${toMute.user.tag}!`);
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
    }
}