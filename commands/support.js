const xlg = require('../xlogger');
const { getGlobalSetting } = require('../dbmanager')

module.exports = {
    name: 'support',
    description: 'get invite to (new) support server',
    async execute(client, message) {
        let info_embed_color = parseInt((await getGlobalSetting("info_embed_color"))[0].value, 10);
        message.channel.send({
            embed: {
                color: info_embed_color,
                description: `Invite to the (new) support server: [invite link](https://discord.gg/AvXvvSg)`
            }
        }).catch(xlg.error);
    }
}