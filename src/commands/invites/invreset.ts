import { permLevels } from '../../permissions';
import { Command, GuildMessageProps } from "src/gm";
import { stringToMember } from '../../utils/parsers';

export const command: Command<GuildMessageProps> = {
    name: "invreset",
    description: {
        short: "reset all invites data",
        long: "Reset all stored invites."
    },
    usage: "[@member]",
    cooldown: 15,
    permLevel: permLevels.member,
    guildOnly: true,
    permissions: ["MANAGE_GUILD"],
    async execute(client, message, args) {
        try {
            if (args.length) {
                const a = args.join(" ");
                const target = await stringToMember(message.guild, a, true, true, true);
                if (target) {
                    const confirm = await client.specials.getUserConfirmation(message.channel, [message.author.id], `Please confirm deletion of invites data for ${target}`);
                    if (confirm) {
                        await client.invites.resetInvites(message.guild.id, target.id);
                    }
                } else {
                    await client.specials.sendError(message.channel, `That is an invalid target`);
                }
            } else {
                const confirm = await client.specials.getUserConfirmation(message.channel, [message.author.id], `Please confirm deletion of all invites data`);
                if (confirm) {
                    await client.invites.resetInvites(message.guild.id);
                }
            }
        } catch (error) {
            xlg.error(error);
            await client.specials.sendError(message.channel);
            return false;
        }
    }
}
