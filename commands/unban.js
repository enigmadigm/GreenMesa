const xlg = require("../xlogger");
const { permLevels } = require('../permissions');
const { getGuildSetting } = require("../dbmanager");
const Discord = require('discord.js');

module.exports = {
    name: "unban",
    aliases: ["ub"],
    description: {
        short: "unban members",
        long: "Use to unban a banned member or all banned members. This will remove their ban."
    },
    category: "moderation",
    usage: "<user id | all>",
    args: true,
    specialArgs: 1,
    permLevel: permLevels.mod,
    guildOnly: true,
    async execute(client, message, args) {
        try {
            if (!(message instanceof Discord.Message)) return;

            let moderationEnabled = await getGuildSetting(message.guild, 'all_moderation');
            if (!moderationEnabled[0] || moderationEnabled[0].value === 'disabled') {
                return client.specials.sendModerationDisabled(message.channel);
            }

            if (args.join(" ") === "all") {
                const b = await message.guild.fetchBans();
                const bc = b.size;
                if (!bc) {
                    await client.specials.sendError(message.channel, `No bans found`);
                    return;
                }
                const ba = b.array();
                for (let i = 0; i < ba.length; i++) {
                    const c = ba[i];
                    message.guild.members.unban(c.user);
                }
                message.channel.send(`<a:spinning_light00:680291499904073739>✅ ${bc} users unbanned`);
                return;
            }
            
            const ub = await message.guild.fetchBan(args[0])
            
            if (!ub || !ub.user) {
                await client.specials.sendError(message.channel, "That user does not appear to be banned");
                return;
            }
            
            args.shift();
            const reason = args.join(" ");
            try {
                message.guild.members.unban(ub.user, reason);
                message.channel.send(`<a:spinning_light00:680291499904073739>✅ Unbanned ${ub.user.tag}`);
            } catch (e) {
                message.channel.send(`<a:spinning_light00:680291499904073739>🆘 Could not unban ${ub.user.tag}`);
            }
        } catch (error) {
            xlg.error(error);
            await client.specials.sendError(message.channel);
            return false;
        }
    }
}