const { permLevels } = require('../permissions');
const { getGlobalSetting, editGlobalSettings } = require('../dbmanager');

module.exports = {
    name: 'presence',
    aliases: ['status'],
    permLevel: permLevels.botMaster,
    args: true,
    async execute(client, message, args) {
        let fec_gs = await getGlobalSetting("fail_embed_color");
        let fail_embed_color = parseInt(fec_gs[0].value);
        let success_embed_color = await getGlobalSetting("success_embed_color");
        success_embed_color = parseInt(success_embed_color[0].value);
        if (['online', 'idle', 'dnd'].includes(args.join(" "))) {
            let result = await getGlobalSetting('game_status');
            if (result[0] && result[0].value === args.join(" ")) {
                return message.channel.send({
                    embed: {
                        color: fail_embed_color || 0,
                        description: `client status is already **${args.join(" ")}**`
                    }
                }).catch(e => console.log(e.stack));
            }
            let editRes = await editGlobalSettings('name', 'game_status', message.author, args.join(" "));
            if (editRes.affectedRows === 1) {
                message.channel.send({
                    embed: {
                        color: success_embed_color,
                        description: `**client status changed to:**\n${args.join(" ")}`
                    }
                })
            }
        } else if (['PLAYING', 'STREAMING', 'WATCHING', 'LISTENING'].includes(args.join(" "))) {
            let result = await getGlobalSetting('game_prefix')
            if (result[0] && result[0].value === args.join(" ")) {
                return message.channel.send({
                    embed: {
                        color: fail_embed_color || 0,
                        description: `**type is already:**\n${result[0].value}`
                    }
                }).catch(e => console.log(e.stack));
            }
            let editRes = await editGlobalSettings('name', 'game_prefix', message.author, args.join(" "));
            if (editRes.affectedRows === 1) {
                message.channel.send({
                    embed: {
                        color: success_embed_color,
                        description: `**type changed to:**\n${args.join(" ")}`
                    }
                })
            }
        } else {
            let result = await getGlobalSetting('game_name');
            if (result[0] && result[0].value === args.join(" ")) {
                return message.channel.send({
                    embed: {
                        color: fail_embed_color || 0,
                        description: `**presence text is already:**\n${args.join(" ")}`
                    }
                }).catch(e => console.log(e.stack));
            }
            let editRes = await editGlobalSettings('name', 'game_name', message.author, args.join(" "));
            if (editRes.affectedRows === 1) {
                message.channel.send({
                    embed: {
                        color: success_embed_color,
                        description: `**text changed to:**\n${args.join(" ")}`
                    }
                })
            }
        }
    }
}