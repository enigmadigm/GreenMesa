const { getGlobalSetting } = require('../dbmanager')
const xlg = require('../xlogger');

module.exports = {
    name: 'support',
    description: 'get invite to (new) support server',
    async execute(client, message) {
        let info_embed_color = await getGlobalSetting('info_embed_color').then(r => parseInt(r[0].value));
        message.channel.send({
            embed: {
                color: info_embed_color,
                description: `Invite to the (new) support server: [invite link](https://discord.gg/AvXvvSg)`
            }
        }).catch(xlg.error);
    }
}