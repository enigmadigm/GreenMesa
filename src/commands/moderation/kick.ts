//import { getGuildSetting } from "../dbmanager";
import { permLevels } from '../../permissions';
import { stringToMember } from '../../utils/parsers';
import Discord from 'discord.js';
import xlg from "../../xlogger";
import { Command } from 'src/gm';

export const command: Command = {
    name: 'kick',
    description: {
        short: 'kick a user',
        long: 'Remove any non-elevated member from the server. This will not ban them, they may rejoin.'
    },
    usage: '<user mention>',
    args: true,
    guildOnly: true,
    permLevel: permLevels.mod,
    async execute(client, message, args) {
        try {
            if (!message.guild) return;
            const moderationEnabled = await client.database?.getGuildSetting(message.guild, 'all_moderation');
            if (!moderationEnabled || moderationEnabled.value === 'disabled') {
                return client.specials?.sendModerationDisabled(message.channel);
            }
            
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
                target.kick(reason).then(() => {
                    // We let the message author know we were able to kick the person
                    message.channel.send(`<a:spinning_light00:680291499904073739>✅ Kicked ${target.user.tag}`);
                    //let logChannel = client.channels.get(config.logChannel.id) || member.guild.channels.find(ch => ch.name === config.logChannel.name);
                    /*logChannel.send({
                        embed: {
                            "title": `User Kicked`,
                            "description": `${member} was kicked from the server by ${message.author}`,
                            "timestamp": new Date(),
                            "footer": {
                                "text": `Kicked ID: ${member.id}`
                            }
                        }
                    });*/
                }).catch(err => {
                    // An error happened
                    // This is generally due to the bot not being able to kick the member,
                    // either due to missing permissions or role hierarchy
                    message.channel.send(`<a:spinning_light00:680291499904073739>🆘 Could not kick ${target.user.tag}`);
                    // Log the error
                    xlg.error(err);
                });
                // Otherwise, if no user was mentioned
            } else {
                message.channel.send(`🟥 Invalid member to kick`);
            }
        } catch (error) {
            xlg.error(error);
            await client.specials?.sendError(message.channel);
            return false;
        }
    }
}

