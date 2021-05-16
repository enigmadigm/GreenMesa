
import { permLevels } from '../../permissions';
//import { getGuildSetting } from "../dbmanager";
import { Command } from "src/gm";
import { Contraventions } from "../../utils/contraventions";

export const command: Command = {
    name: "unban",
    aliases: ["ub"],
    description: {
        short: "unban users",
        long: "Use to unban a banned member or all banned members. This will remove their ban."
    },
    usage: "<user id | all>",
    args: 1,
    permLevel: permLevels.mod,
    guildOnly: true,
    moderation: true,
    async execute(client, message, args) {
        try {
            if (!message.guild || !message.member) return;

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
                message.channel.send(`\\✅ ${bc} users unbanned`);
                return;
            }

            if (!/^[0-9]{18}$/.test(args[0])) {
                await client.specials?.sendError(message.channel, "A valid user ID (Snowflake) is required");
                return;
            }
            const t = args[0];
            let ub;
            try {
                ub = await message.guild.fetchBan(t);//TODO: add function to specials to search all shards for a user and return the userinfo, like the id, if they are found, this could be used to search using tags because with a tag a user in a mutual guild could be found
            } catch (e) {
                if (e.message === "Unknown Ban") {
                    const storedBans = await client.database.getGuildSetting(message.guild, "toban");
                    if (storedBans) {
                        try {
                            const bans: string[] = JSON.parse(storedBans.value);
                            if (bans.includes(t)) {
                                bans.splice(bans.indexOf(t), 1);
                                await client.database.editGuildSetting(message.guild, "toban", JSON.stringify(bans).escapeSpecialChars());
                                await message.channel.send(`That ID was found and removed from the autoban list.`);
                                return;
                            }
                        } catch (error) {
                            xlg.error(error);
                        }
                    }

                    await client.specials?.sendError(message.channel, "There is no banned user matching that ID");
                    return;
                } else {
                    throw new Error("Error fetching ban");
                }
            }

            args.shift();
            const reason = args.join(" ");
            try {
                await message.guild.members.unban(ub.user, reason);
                Contraventions.logUnban(message.guild.id, ub.user.id, message.member, reason, ub.user.tag);
                message.channel.send(`\\✅ Unbanned ${ub.user.tag}`);
            } catch (e) {
                message.channel.send(`\\🆘 Could not unban ${ub.user.tag}`);
            }
        } catch (error) {
            xlg.error(error);
            await client.specials?.sendError(message.channel);
            return false;
        }
    }
}
