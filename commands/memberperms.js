const xlg = require("../xlogger");
const { permLevels } = require('../permissions');
const { getGlobalSetting } = require("../dbmanager");

module.exports = {
    name: 'memberperms',
    aliases: ['mp', 'userperms'],
    description: 'get a list of perms a member has in a channel',
    usage: '[target member]',
    guildOnly: true,
    permLevel: permLevels.trustedMember,
    async execute(client, message, args) {
        let target = message.mentions.members.first() || ((message.guild && message.guild.available) ? message.guild.members.cache.get(args[0]) : false) || message.member || false;
        if (!target) return message.channel.send('Invalid target.');

        message.channel.send({
            embed: {
                color: parseInt((await getGlobalSetting("info_embed_color") || ['7322774'])[0].value, 10),
                author: {
                    name: `${target.user.tag}`,
                    icon_url: target.user.displayAvatarURL()
                },
                description: `perms for this channel:\n${target.permissionsIn(message.channel).toArray().map(pr => `\`${pr}\``).join("\n") || '*none*'}`,
                footer: {
                    text: `Perms: ${target.permissionsIn(message.channel).bitfield}`
                }
            }
        }).catch(xlg.error);
    }
}