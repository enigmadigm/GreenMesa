import { permLevels } from '../../permissions';
import { Command, GuildMessageProps } from "src/gm";
import { stringToMember } from "../../utils/parsers";
import { warn } from "../../utils/modactions";

export const command: Command<GuildMessageProps> = {
    name: "warn",
    description: {
        short: "warn a member",
        long: "Warns a user and adds a warning to their record."
    },
    usage: "<member> [reason]",
    args: true,
    cooldown: 2,
    permLevel: permLevels.mod,
    moderation: true,
    guildOnly: true,
    async execute(client, message, args) {
        try {
            const target = await stringToMember(message.guild, args[0], false, false, false);
            if (!target) {
                await client.specials.sendError(message.channel, "Invalid target", true);
                return;
            }
            args.shift();
            const reason = args.join(" ");
            const warnResult = await warn(client, target, message.member, reason);
            if (warnResult) {
                await message.channel.send(`\\✅ \`${target.user.tag.escapeDiscord()}\` has been warned${target.id === message.author.id ? `\nBe happy that you got to yourself before someone else did` : ""}`);
                return;
            }
            await message.channel.send(`It seems that something may have gone wrong`);
        } catch (error) {
            xlg.error(error);
            await client.specials.sendError(message.channel);
            return false;
        }
    }
}
