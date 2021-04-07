import xlg from '../xlogger';
// import { getGlobalSetting } from '../dbmanager';
import { Command } from 'src/gm';

export const command: Command = {
    name: 'support',
    description: 'get invite to (new) support server',
    async execute(client, message) {
        try {
            const info_embed_color = await client.database.getColor("info");
            message.channel.send({
                embed: {
                    color: info_embed_color,
                    description: `Invite to the support server: [invite link](https://discord.gg/AvXvvSg)`
                }
            });
        } catch (error) {
            xlg.error(error);
            await client.specials?.sendError(message.channel);
            return false;
        }
    }
}

