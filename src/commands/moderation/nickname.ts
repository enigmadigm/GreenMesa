import { permLevels, getPermLevel } from "../../permissions";
import { stringToMember } from "../../utils/parsers";
import { Command, GuildMessageProps } from "src/gm";

export const command: Command<GuildMessageProps> = {
    name: 'nickname',
    aliases: ['nick'],
    usage: '[target member] <new nick>',
    guildOnly: true,
    description: {
        short: "set a member nickname",
        long: "Set the nickname of yourself or another member (if you have the necessary permissions)",
    },
    args: true,
    permissions: ["MANAGE_NICKNAMES"],
    async execute(client, message, args) {
        try {
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
                        await client.specials.sendModerationDisabled(message.channel);
                        return;
                    }
                    // confirming that the author has the moderation privileges to use the command
                    const permLevel = await getPermLevel(message.member);
                    if (permLevel < permLevels.mod) {
                        await message.channel.send("Insufficient permissions.").catch(xlg.error);
                        return;
                    }
                }
            }

            // This is probably an unecessary check but I probably had a reason so I'll keep it
            // if (args[0] === message.member.id) args.shift();// looking at this later, this should never be true since the target is already parsed earlier
            // ^ i am keeping this commented here so i will always be able to wonder why the hell i didn't delete this line when rewriting the commana
            const a = args.join(" ")

            // Why would I want it to be changed manually
            //if (target.id == client.id) return message.channel.send('My nickname should be changed manually');

            if (target.id === target.guild.ownerId) {
                await client.specials.sendError(message.channel, `Because you are the server owner, I will never be able to change your nickname`);
                return;
            }
            // I would rather let this error
            //if (!target.manageable) return message.channel.send('I don't have the permissions to manage that target, I am outranked! 🚀 inbound');

            // Necessary check to prevent a needless error
            if (args.join(" ").length > 32) {
                await message.channel.send('Nicknames cannot be longer than 32 characters');
                return;
            }

            if (args.join(" ") == target.nickname) {
                await message.channel.send(`\`${a}\` is already the target's nickname`);
                return;
            }

            if (args.join(" ").length < 1) {
                await message.channel.send("The new nickname had no length")
                return;
            }

            try {
                await target.setNickname(args.join(" "), 'adjustment thru nick command');
                await message.channel.send(`\\✅ Changed the nickname of \`${target.user.tag}\` to \`${target.displayName}\``)
            } catch (e) {
                if (client.specials.isNodeError(e)) {
                    xlg.error("Nickname change error:", e.message);
                    await client.specials.sendError(message.channel, `◍ Command Error:\n${e.message}`)
                } else {
                    xlg.error(e);
                }
            }
        } catch (error) {
            xlg.error(error);
            await client.specials.sendError(message.channel);
            return false;
        }
    }
}
