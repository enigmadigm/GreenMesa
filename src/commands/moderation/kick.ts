//import { getGuildSetting } from "../dbmanager";
import { permLevels } from '../../permissions';
import { stringToMember } from '../../utils/parsers';
import Discord from 'discord.js';

import { Command } from 'src/gm';
import { kick } from '../../utils/modactions';

export const command: Command = {
    name: 'kick',
    description: {
        short: 'kick a user',
        long: 'Remove any non-elevated member from the server. This will not ban them, they may rejoin.'
    },
    usage: '<user mention> [reason]',
    args: true,
    guildOnly: true,
    permLevel: permLevels.mod,
    moderation: true,
    permissions: ["KICK_MEMBERS"],
    async execute(client, message, args) {
        try {
            if (!message.guild || !message.member) return;

            const target = await stringToMember(message.guild, args[0], false, false, false);
            // If we have a user mentioned
            if (target && target instanceof Discord.GuildMember) {
                args.shift();
                const reason = args.join(" ");
                /**
                 * Kick the member
                 * Make sure you run this on a member, not a user!
                 * There are big differences between a user and a member
                 */
                try {
                    // await target.kick(`by ${message.author.tag}${reason ? ` | ${reason}` : ""}`)
                    // Contraventions.logKick(message.guild.id, target.id, message.author.id, reason);
                    const kickResult = await kick(client, target, message.member, reason);
                    if (kickResult) {
                        message.channel.send(kickResult);
                        return;
                    }
                } catch (err) {
                    xlg.error(err);
                }
                message.channel.send(`\\🆘 Could not kick ${target.user.tag}`);
            } else {
                message.channel.send(`\\🟥 Invalid member to kick`);
            }
        } catch (error) {
            xlg.error(error);
            await client.specials?.sendError(message.channel);
            return false;
        }
    }
}

