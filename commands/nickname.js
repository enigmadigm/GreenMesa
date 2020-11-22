const xlg = require("../xlogger");
const { getGuildSetting } = require("../dbmanager");
const { permLevels, getPermLevel } = require("../permissions");
const { stringToMember } = require("../utils/parsers");

module.exports = {
    name: 'nickname',
    aliases: ['nick'],
    usage: '[target member] <new nick>',
    guildOnly: true,
    description: 'set a member nickname',
    category: 'moderation',
    args: true,
    async execute(client, message, args) {
        let target = await stringToMember(message.guild, args[0], true, true, false) || ((message.guild && message.guild.available) ? message.guild.members.cache.get(args[0]) : false) || message.member || false;
        if (!target) return message.channel.send('🔴 Could not resolve target.');
        if (target.id !== message.member.id) {
            let moderationEnabled = await getGuildSetting(message.guild, 'all_moderation');
            if (!moderationEnabled[0] || moderationEnabled[0].value === 'disabled') {
                return client.specials.sendModerationDisabled(message.channel);
            }
            var permLevel = await getPermLevel(message.member);
            if (permLevel < permLevels.mod) return message.channel.send("Insufficient permissions.").catch(xlg.error);
            args.shift();
        }
        if (args[0] === message.member.id) args.shift();
        if (target.id == client.id) return message.channel.send(':frowning2: my nickname should be changed manually');
        if (!target.manageable) return message.channel.send(':frowning2: I am unable to manage the target, I am outranked! 🚀 inbound');
        if (args.join(" ").length > 32) return message.channel.send(':frowning2: nicknames cannot be longer than 32 characters');
        if (args.join(" ") == target.nickname) return message.channel.send(':frowning2: that is already the nickname');

        try {
            await target.setNickname(args.join(" "), 'adjustment thru nick command');
            await message.channel.send(`✅ Nickname of: \`${target.user.tag}\` changed to \`${args.join(" ")}\``)
        } catch (e) {
            xlg.log(e.message);
            message.channel.send(`◍ Command Error:\n\`${e.message}\``)
        }
    }
}