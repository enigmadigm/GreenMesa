import { Command, GuildMessageProps } from "src/gm";
import Leeter from '../../utils/leeter.js';

export const command: Command<GuildMessageProps> = {
    name: 'leeter',
    args: true,
    aliases: ['leet', 'leetify'],
    guildOnly: true,
    async execute(client, message, args) {
        try {
            const leeter = new Leeter(1, false);
            await message.channel.send({
                content: `\`${leeter.tol33t(args.join(" ")).replace(/\\/g, "\\\\")}\``,
            });
        } catch (error) {
            xlg.error(error);
            await client.specials?.sendError(message.channel);
            return false;
        }
    }
}
