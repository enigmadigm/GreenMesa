import { Command } from "src/gm";
import Leeter from '../../utils/leeter';
const leeter = new Leeter(1, false);

export const command: Command = {
    name: 'leeter',
    args: true,
    aliases: ['leetspeaker', 'leetify', 'leetspeakify', 'leet'],
    guildOnly: true,
    async execute(client, message, args) {
        try {
            message.channel.send({
                embed: {
                    description: `\`${leeter.tol33t(args.join(" ")).replace(/\\/g, "\\\\")}\``
                }
            });
        } catch (error) {
            xlg.error(error);
            await client.specials?.sendError(message.channel);
            return false;
        }
    }
}
