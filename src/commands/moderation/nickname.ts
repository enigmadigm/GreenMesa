import xlg from "../../xlogger";
//import { getGuildSetting } from "../dbmanager";
import { permLevels, getPermLevel } from "../../permissions";
import { stringToMember } from "../../utils/parsers";
import { Command } from "src/gm";

export const command: Command = {
    name: 'nickname',
    aliases: ['nick'],
    usage: '[target member],<new nick>',
    guildOnly: true,
    description: 'set a member nickname',
    args: true,
    async execute(client, message, args) {
        try {
            if (!message.guild || !message.member) return;
            /*let moderationEnabled = await getGuildSetting(message.guild, 'all_moderation');
            if (!moderationEnabled[0] || moderationEnabled[0].value === 'disabled') {
                return client.specials.sendModerationDisabled(message.channel);
            }*/
            
            let target = await stringToMember(message.guild, args[0], true, false, false);
            if (!target || !target.id) {
                target = message.member;
            } else {
                args.shift();
                // I moved this up here to save some execution time
                if (target.id !== message.member.id) {// if the found target is not the author
                    // now checking for moderation here because this means that someone elses name from the sender is being changed
                    const moderationEnabled = await client.database.getGuildSetting(message.guild, 'all_moderation');
                    if (!moderationEnabled || moderationEnabled.value === 'disabled') {
                        return client.specials?.sendModerationDisabled(message.channel);
                    }
                    // confirming that the author has the moderation privileges to use the command
                    const permLevel = await getPermLevel(message.member);
                    if (permLevel < permLevels.mod) {
                        message.channel.send("Insufficient permissions.").catch(xlg.error);
                        return;
                    }
                }
            }

            // This is probably an unecessary check but I probably had a reason so I'll keep it
            if (args[0] === message.member.id) args.shift();

            // Why would I want it to be changed manually
            //if (target.id == client.id) return message.channel.send('My nickname should be changed manually');

            // I would rather let this error
            //if (!target.manageable) return message.channel.send('I don't have the permissions to manage that target, I am outranked! 🚀 inbound');

            // Necessary check to prevent a needless error
            if (args.join(" ").length > 32) {
                message.channel.send('Nicknames cannot be longer than 32 characters');
                return;
            }

            if (args.join(" ") == target?.nickname) {
                message.channel.send(`\`${args.join(" ")}\` is already the target's nickname`);
                return;
            }

            if (args.join(" ").length < 1) {
                message.channel.send("The new nickname had no length")
                return;
            }

            try {
                await target?.setNickname(args.join(" "), 'adjustment thru nick command');
                await message.channel.send(`\\✅ Changed the nickname of \`${target.user.tag}\` to \`${target.nickname}\``)
            } catch (e) {
                xlg.log(e.message);
                await client.specials?.sendError(message.channel, `◍ Command Error:\n${e.message}`)
            }
        } catch (error) {
            xlg.error(error);
            await client.specials?.sendError(message.channel);
            return false;
        }
    }
}

