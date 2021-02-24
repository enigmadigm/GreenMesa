import { Command } from 'src/gm';
import { permLevels } from '../../permissions';
//import { getGlobalSetting, editGlobalSettings } from '../dbmanager';

export const command: Command = {
    name: 'presence',
    aliases: ['status'],
    permLevel: permLevels.botMaster,
    args: true,
    async execute(client, message, args) {
        const fail_embed_color = await client.database?.getColor("fail_embed_color");
        const success_embed_color = await client.database?.getColor("success_embed_color");
        if (['online', 'idle', 'dnd', 'invisible'].includes(args.join(" "))) {
            const result = await client.database?.getGlobalSetting('game_status');
            if (result && result.value === args.join(" ")) {
                message.channel.send({
                    embed: {
                        color: fail_embed_color || 0,
                        description: `client status is already **${args.join(" ")}**`
                    }
                });
                return;
            }
            const editRes = await client.database?.editGlobalSettings('name', 'game_status', message.author, args.join(" "));
            if (editRes && editRes.affectedRows === 1) {
                message.channel.send({
                    embed: {
                        color: success_embed_color,
                        description: `**client status changed to:**\n${args.join(" ")}`
                    }
                });
            }
        } else if (['PLAYING', 'STREAMING', 'WATCHING', 'LISTENING', 'COMPETING'].includes(args.join(" "))) {
            const result = await client.database?.getGlobalSetting('game_prefix')
            if (result && result.value === args.join(" ")) {
                message.channel.send({
                    embed: {
                        color: fail_embed_color || 0,
                        description: `**type is already:**\n${result.value}`
                    }
                });
                return;
            }
            const editRes = await client.database?.editGlobalSettings('name', 'game_prefix', message.author, args.join(" "));
            if (editRes && editRes.affectedRows === 1) {
                message.channel.send({
                    embed: {
                        color: success_embed_color,
                        description: `**type changed to:**\n${args.join(" ")}`
                    }
                });
            }
        } else {
            const result = await client.database?.getGlobalSetting('game_name');
            if (result && result.value === args.join(" ")) {
                message.channel.send({
                    embed: {
                        color: fail_embed_color || 0,
                        description: `**presence text is already:**\n${args.join(" ")}`
                    }
                });
                return;
            }
            const editRes = await client.database?.editGlobalSettings('name', 'game_name', message.author, args.join(" "));
            if (editRes && editRes.affectedRows === 1) {
                message.channel.send({
                    embed: {
                        color: success_embed_color,
                        description: `**text changed to:**\n${args.join(" ")}`
                    }
                });
            }
        }
    }
}

