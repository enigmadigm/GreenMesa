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
    usage: '<user mention> [reason]',
    args: true,
    guildOnly: true,
    permLevel: permLevels.mod,
    moderation: true,
    async execute(client, message, args) {
        try {
            if (!message.guild) return;
            
            const target = await stringToMember(message.guild, args[0], false, false, false);
            // If we have a user mentioned
            if (target && target instanceof Discord.GuildMember) {
                args.shift();
                const reason = args.join(" ");
                await target.send({
                    embed: {
                        color: await client.database?.getColor("warn_embed_color"),
                        title: `Kick Notice`,
                        description: `Kicked from ${message.guild.name}`,
                        fields: [
                            {
                                name: "Moderator",
                                value: `${message.author.tag}`,
                            },
                            {
                                name: "Reason",
                                value: `${reason || "*none*"}`,
                            }
                        ],
                    }
                });
                /**
                 * Kick the member
                 * Make sure you run this on a member, not a user!
                 * There are big differences between a user and a member
                 */
                try {
                    await target.kick(`by ${message.author.tag}${reason ? ` | ${reason}` : ""}`)
                    message.channel.send(`<a:spinning_light00:680291499904073739>✅ Kicked ${target.user.tag}`);
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
                } catch (err) {
                    // An error happened
                    // Log the error
                    xlg.error(err);
                    // This is generally due to the bot not being able to kick the member,
                    // either due to missing permissions or role hierarchy
                    message.channel.send(`<a:spinning_light00:680291499904073739>🆘 Could not kick ${target.user.tag}`);
                }
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

