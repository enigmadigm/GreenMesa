import xlg from "../../xlogger";
import { permLevels } from '../../permissions';
//import { getGuildSetting } from "../dbmanager";
import { Command } from "src/gm";

export const command: Command = {
    name: "unban",
    aliases: ["ub"],
    description: {
        short: "unban users",
        long: "Use to unban a banned member or all banned members. This will remove their ban."
    },
    usage: "<user id | all>",
    args: true,
    specialArgs: 1,
    permLevel: permLevels.mod,
    guildOnly: true,
    async execute(client, message, args) {
        try {
            if (!message.guild) return;

            const moderationEnabled = await client.database?.getGuildSetting(message.guild, 'all_moderation');
            if (!moderationEnabled || moderationEnabled.value === 'disabled') {
                return client.specials?.sendModerationDisabled(message.channel);
            }

            if (args.join(" ") === "all") {
                const b = await message.guild.fetchBans();
                const bc = b.size;
                if (!bc) {
                    await client.specials?.sendError(message.channel, `No bans found`);
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

            if (!/^[0-9]{18}$/.test(args[0])) {
                await client.specials?.sendError(message.channel, "A valid user ID (Snowflake) is required");
                return;
            }
            let ub;
            try {
                ub = await message.guild.fetchBan(args[0]);
            } catch (e) {
                if (e.message === "Unknown Ban") {
                    await client.specials?.sendError(message.channel, "There is no banned user matching that ID");
                    return;
                } else {
                    throw new Error("Error fetching ban");
                }
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
            await client.specials?.sendError(message.channel);
            return false;
        }
    }
}

