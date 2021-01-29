import { Command } from "src/gm";

import xlg from '../xlogger';
import Leeter from '../utils/leeter';
const leeter = new Leeter(1, false);

const command: Command = {
    name: 'leeter',
    args: true,
    aliases: ['leetspeaker', 'leetify', 'leetspeakify', 'leet'],
    guildOnly: true,
    category: 'utility',
    async execute(client, message, args) {
        try {
            message.channel.send({
                embed: {
                    description: `\`${leeter.tol33t(args.join(" "))}\``
                }
            });
        } catch (error) {
            xlg.error(error);
            await client.specials?.sendError(message.channel);
            return false;
        }
    }
}

export default command;