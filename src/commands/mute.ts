import { Command } from "src/gm";
//import { getGuildSetting } from "../dbmanager";
import { permLevels } from '../permissions';
import { stringToMember, durationToString } from '../utils/parsers';
import { stringToDuration } from '../utils/time';
import xlg from "../xlogger";

const command: Command = {
    name: 'mute',
    description: {
        short: 'fully mute a member',
        long: 'Prevents a non-admin user from chatting or speaking in voice.'
    },
    usage: "<user @ | user id> [time (9d9h9m9s)]",
    args: true,
    guildOnly: true,
    permLevel: permLevels.mod,
    category: 'moderation',
    async execute(client, message, args) {
        try {
            if (!message.guild || !message.member) return;

            const moderationEnabled = await client.database?.getGuildSetting(message.guild, 'all_moderation');
            if (!moderationEnabled || moderationEnabled.value === 'disabled') {
                return client.specials?.sendModerationDisabled(message.channel);
            }

            const toMute = await stringToMember(message.guild, args[0], false, false, false);
            // Check perms, self, rank, etc
            if (!message.guild.me?.hasPermission("MANAGE_ROLES")) {// check if the bot has the permissions to mute  members
                message.channel.send("I do not have the permissions to do that");
                return;
            }
            if (!toMute) {
                message.channel.send('You did not specify a user mention or ID!');
                return;
            }
            if (toMute.id === message.author.id) {
                message.channel.send('You cannot mute yourself!');
                return;
            }
            if (toMute.id === client.user?.id) {
                message.channel.send("Please don't mute me");
                return;
            }
            if (toMute.roles.highest.position >= message.member.roles.highest.position) {
                message.channel.send('You cannot mute a member that is equal to or higher than yourself');
                return;
            }
            if (!toMute.manageable) {
                message.channel.send(`I don't have a high enough role to manage ${toMute || 'that user'}`);
                return;
            }

            // Check if the user has the mutedRole
            let mutedRole = message.guild.roles.cache.find(r => r.name.toLowerCase() === 'muted' || r.name.toLowerCase() === 'mute');
            // If the mentioned user does not have the muted role execute the following

            if (!mutedRole) {
                // Create a role called "Muted"
                mutedRole = await message.guild.roles.create({
                    data: {
                        name: 'Muted',
                        color: '#708090',
                        permissions: 0,
                        position: 1
                    }
                });

                // Prevent the user from sending messages or reacting to messages
                message.guild.channels.cache.each(async (channel) => {
                    if (mutedRole) {
                        await channel.updateOverwrite(mutedRole, {
                            SEND_MESSAGES: false,
                            ADD_REACTIONS: false
                        });
                    }
                });
            }
            if (mutedRole.position < toMute.roles.highest.position) {
                mutedRole.setPosition(toMute.roles.highest.position);
            }

            // If the mentioned user already has the "mutedRole" then that can not be muted again
            if (toMute.roles.cache.has(mutedRole.id)) {
                message.channel.send(`\`${toMute.user.tag}\` is already muted`);
                return;
            }

            await toMute.roles.add(mutedRole, `muted by ${message.author.tag}`).catch(e => console.log(e.stack));
            if (toMute.voice.connection && !toMute.voice.mute) {
                await toMute.voice.setMute(true);
            }

            let mendm = ""
            let time = 0;
            let dur = "";
            if (args[1]) {
                time = stringToDuration(args[1])
            }
            if (time) {
                dur = durationToString(time);
                mendm = ` for ${dur}`
            }

            message.channel.send(`<a:spinning_light00:680291499904073739>\\✅ Muted \`${toMute.user.tag}\`${mendm}`);

            if (time) {
                setTimeout(async () => {
                    if (mutedRole) {
                        if (!toMute.roles.cache.has(mutedRole.id)) return;
                        // Remove the mentioned users role "mutedRole", "muted.json", and notify command sender
                        await toMute.roles.remove(mutedRole, `unmuting automatically after ${dur}`);
                        if (toMute.voice.connection && toMute.voice.mute) {
                            toMute.voice.setMute(false);
                        }
                    }
                }, time)
            }
        } catch (e) {
            xlg.error(e);
            await client.specials?.sendError(message.channel, `\\🆘 Error while muting`);
            return false;
        }

        /*let logChannel = client.channels.get(.id) || toMute.guild.channels.find(ch => ch.name === "");
        logChannel.send({
            embed: {
                "title": `User Muted`,
                "description": `${toMute} was muted by ${message.author}`,
                "color": 0xff033e,
                "timestamp": new Date(),
                "footer": {
                    "text": `Muted ID: ${toMute.id}`
                }
            }
        });*/

        /*
        setTimeout(function () {
            tomute.removeRole(muterole.id);
            message.channel.send(`<@${tomute.id}> has been unmuted!`);
        }, ms(mutetime));
        */
    }
}

export default command;