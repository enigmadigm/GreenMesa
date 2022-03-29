import { Command, GuildMessageProps } from "src/gm";
import { permLevels } from '../../permissions.js';
import { stringToMember } from '../../utils/parsers.js';
import { stringToDuration } from '../../utils/time.js';
import { timeout } from "../../utils/modactions.js";
const DEFAULT_DURATION = 1000 * 60 * 60 * 24 * 28 - 1000;

export const command: Command<GuildMessageProps> = {
    name: "timo",
    description: {
        short: "timeout a member",
        long: "Prevents members from messaging or joining voice using Discord's native timeout feature. Use the timo command to timeout a member. Defaults to 28 days if time not specified.",
    },
    aliases: ["to"],
    usage: "<user @ | user id> [time: 9d9h9m9s] [reason]",
    args: true,
    guildOnly: true,
    permLevel: permLevels.mod,
    moderation: true,
    permissions: ["MODERATE_MEMBERS"],
    async execute(client, message, args) {
        try {
            const toMute = await stringToMember(message.guild, args[0], false, false, false);
            // Check perms, self, rank, etc
            if (!toMute) {
                await client.specials.sendError(message.channel, `Target not provided`);
                return;
            }
            args.shift();
            if (toMute.id === message.author.id) {
                await client.specials.sendError(message.channel, `You cannot mute yourself!`);
                return;
            }
            if (toMute.id === client.user?.id) {
                await client.specials.sendError(message.channel, `Please don't mute me ${["👉👈", "🥺"][Math.floor(Math.random() * 2)]}`);
                return;
            }
            if ((toMute.roles.cache.sort((a, b) => a.position - b.position).first()?.position || 0) >= message.member.roles.highest.position && message.guild.ownerId !== message.member.id) {
                await client.specials.sendError(message.channel, `You cannot mute a higher ranking member`);
                return;
            }
            if (!toMute.moderatable) {
                await client.specials.sendError(message.channel, `I can't moderate ${toMute}`);
                return;
            }

            let time = DEFAULT_DURATION;
            if (args[0]) {
                time = stringToDuration(args[0])
            }
            if (time) {
                args.shift();
            } else {
                time = DEFAULT_DURATION;
            }
            const reason = args.join(" ");

            const muteResult = await timeout(client, toMute, time, message.member, reason);
            if (muteResult) {
                await message.channel.send(muteResult);//${time ? `Edit with ID: ${"*private*"}` : ""}
            }
        } catch (e) {
            xlg.error(e);
            await client.specials.sendError(message.channel, `\\🆘 Error while muting`);
            return false;
        }
    }
}
