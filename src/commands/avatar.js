const { getGlobalSetting } = require('../dbmanager')
const xlg = require('../xlogger');

module.exports = {
    name: 'avatar',
    description: 'see the avatar of you or someone else',
    aliases: ['av'],
    usage: '[member]',
    category: 'utility',
    async execute(client, message, args) {
        let target = message.mentions.users.first() || ((message.guild && message.guild.available && args.length && message.guild.members.cache.get(args[0])) ? message.guild.members.cache.get(args[0]).user || false : false) || message.author;
        let darkblue_embed_color = await getGlobalSetting('darkblue_embed_color').then(r => parseInt(r[0].value));
        message.channel.send({
            embed: {
                color: darkblue_embed_color,
                author: {
                    name: target.tag,
                    icon_url: target.displayAvatarURL(),
                },
                title: 'Avatar',
                url: target.displayAvatarURL({format: 'png', dynamic: true, size: 512}),
                image: {
                    url: target.displayAvatarURL({format: 'png', dynamic: true, size: 256})
                }
            }
        }).catch(xlg.error);
    }
}