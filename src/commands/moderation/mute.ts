import { Command } from "src/gm";
import { permLevels } from '../../permissions';
import { stringToMember } from '../../utils/parsers';
import { stringToDuration } from '../../utils/time';

import { mute } from "../../utils/modactions";

export const command: Command = {
    name: 'mute',
    description: {
        short: 'fully mute a member',
        long: 'Prevents a non-admin user from chatting or speaking in voice. It will search for a role called mute to assign. Soon the role will be configurable.'
    },
    usage: "<user @ | user id> [time (9d9h9m9s)]",
    args: true,
    guildOnly: true,
    permLevel: permLevels.mod,
    moderation: true,
    permissions: ["MANAGE_ROLES", "MUTE_MEMBERS"],
    async execute(client, message, args) {
        try {
            if (!message.guild || !message.member) return;

            const toMute = await stringToMember(message.guild, args[0], false, false, false);
            // Check perms, self, rank, etc
            if (!toMute) {
                message.channel.send('You did not specify a user mention or ID!');
                return;
            }
            args.shift();
            if (toMute.id === message.author.id) {
                message.channel.send('You cannot mute yourself!');
                return;
            }
            if (toMute.id === client.user?.id) {
                message.channel.send("Please don't mute me");
                return;
            }
            const dbmr = await client.database.getGuildSetting(message.guild, "mutedrole");
            const mutedRoleID = dbmr ? dbmr.value : "";
            if ((toMute.roles.cache.filter(r => r.id !== mutedRoleID).sort((a, b) => a.position - b.position).first()?.position || 0) >= message.member.roles.highest.position && message.guild.ownerID !== message.member.id) {
                message.channel.send('You cannot mute a member that is equal to or higher than yourself');
                return;
            }
            if (!toMute.manageable) {
                message.channel.send(`I don't have a high enough role to manage ${toMute}`);
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
                message.channel.send(muteResult);//${time ? `Edit with ID: ${"*private*"}` : ""}
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

