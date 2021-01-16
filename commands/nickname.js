const xlg = require("../xlogger");
const { getGuildSetting } = require("../dbmanager");
const { permLevels, getPermLevel } = require("../permissions");
const { stringToMember } = require("../utils/parsers");
const { Message } = require("discord.js");

module.exports = {
    name: 'nickname',
    aliases: ['nick'],
    usage: '[target member],<new nick>',
    guildOnly: true,
    description: 'set a member nickname',
    category: 'moderation',
    args: true,
    async execute(client, message, args) {
        try {
            if (!(message instanceof Message)) return;
            /*let moderationEnabled = await getGuildSetting(message.guild, 'all_moderation');
            if (!moderationEnabled[0] || moderationEnabled[0].value === 'disabled') {
                return client.specials.sendModerationDisabled(message.channel);
            }*/

            // Because usernames might contain spaces, arguments in this command should be separated by commas
            args = args.join(" ").split(/,(.+)/);
            
            let target = await stringToMember(message.guild, args[0], true, false, false);
            if (!target || !target.id) {
                target = message.member;
            } else {
                console.log(args)
                args.shift();
                console.log(args)
                // I moved this up here to save some execution time
                if (target.id !== message.member.id) {// if the found target is not the author
                    // now checking for moderation here because this means that someone elses name from the sender is being changed
                    const moderationEnabled = await getGuildSetting(message.guild, 'all_moderation');
                    if (!moderationEnabled[0] || moderationEnabled[0].value === 'disabled') {
                        return client.specials.sendModerationDisabled(message.channel);
                    }
                    // confirming that the author has the moderation privileges to use the command
                    const permLevel = await getPermLevel(message.member);
                    if (permLevel < permLevels.mod) return message.channel.send("Insufficient permissions.").catch(xlg.error);
                }
            }
            console.log(args)

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

            if (args.join(" ") == target.nickname) {
                message.channel.send(`\`${args.join(" ")}\` is already the target's nickname`);
                return;
            }

            if (args.join(" ").length < 1) {
                message.channel.send("The new nickname had no length; please remember that the target should be separated from the desired nickname by a **comma**")
                return;
            }

            try {
                await target.setNickname(args.join(" "), 'adjustment thru nick command');
                await message.channel.send(`\\✅ Changed the nickname of \`${target.user.tag}\` to \`${target.nickname}\``)
            } catch (e) {
                xlg.log(e.message);
                await client.specials.sendError(message.channel, `◍ Command Error:\n${e.message}`)
            }
        } catch (error) {
            xlg.error(error);
            await client.specials.sendError(message.channel);
            return false;
        }
    }
}