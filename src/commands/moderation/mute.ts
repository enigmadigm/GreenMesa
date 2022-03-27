import { Command, GuildMessageProps } from "src/gm";
import { permLevels } from '../../permissions.js';
import { stringToMember } from '../../utils/parsers.js';
import { stringToDuration } from '../../utils/time.js';
import { mute } from "../../utils/modactions.js";

export const command: Command<GuildMessageProps> = {
    name: "mute",
    description: {
        short: "fully mute a member",
        long: "Prevents a non-admin user from chatting or speaking in voice. It will search for a role called mute to assign. Use the timo command to timeout a member.",
    },
    usage: "<user @ | user id> [time (9d9h9m9s)]",
    args: true,
    guildOnly: true,
    permLevel: permLevels.mod,
    moderation: true,
    permissions: ["MANAGE_ROLES", "MUTE_MEMBERS"],
    async execute(client, message, args) {
        try {
            const toMute = await stringToMember(message.guild, args[0], false, false, false);
            // Check perms, self, rank, etc
            if (!toMute) {
                await client.specials.sendError(message.channel, `You did not specify a user mention or ID!`);
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
            const dbmr = await client.database.getGuildSetting(message.guild, "mutedrole");
            const mutedRoleID = dbmr ? dbmr.value : "";
            if ((toMute.roles.cache.filter(r => r.id !== mutedRoleID).sort((a, b) => a.position - b.position).first()?.position || 0) >= message.member.roles.highest.position && message.guild.ownerId !== message.member.id) {
                await client.specials.sendError(message.channel, `You cannot mute a member that is equal to or higher than yourself in rank`);
                return;
            }
            if (!toMute.manageable) {
                await client.specials.sendError(message.channel, `I don't have a high enough role to manage ${toMute}`);
                return;
            }

            let time = 0;
            if (args[0]) {
                time = stringToDuration(args[0])
            }
            if (time) {
                args.shift();
            }
            const reason = args.join(" ");

            const muteResult = await mute(client, toMute, time, message.member, reason);
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
