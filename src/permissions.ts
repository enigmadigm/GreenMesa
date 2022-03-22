import { GuildMember, Permissions, User } from "discord.js";
import { Bot } from "./bot.js";
import { isSnowflake } from "./utils/specials.js";

export const permLevels = {
    member: 0,
    trustedMember: 1,
    immune: 2,//TODO: this does nothing anywhere ATM
    mod: 3,
    admin: 4,
    botMaster: 5,
}

/**
 * Get the bot usage permission level for a specific user or member
 * @param member 
 * @param relative means that the permissions returned are only relevant to the server, meaning that if a botMaster is present, only their place in the server will be taken into account, not that they are actually a owner
 * @returns 
 */
export async function getPermLevel(member: GuildMember | User, relative = false): Promise<number> {// The relative option determines if the perm level returned will be actual or relative
    if (member == null || !(member instanceof GuildMember)) {
        if (member instanceof User && !relative) {
            const botmasters = await Bot.client.database.getGlobalSetting("botmasters");
            if (botmasters) {
                const bms = botmasters.value.split(',');
                if (bms.includes(member.id)) {
                    return permLevels.botMaster;
                }
            }
        }
        return permLevels.member;
    }
    if (!relative) {
        const botmasters = await Bot.client.database.getGlobalSetting("botmasters");
        if (botmasters) {
            const bms = botmasters.value.split(',');
            if (bms.includes(member.user.id)) {
                return permLevels.botMaster;
            }
        }
    }
    if (!member.guild) {
        return permLevels.member;
    }
    if (member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) { // if a user has admin rights he's automatically a admin
        return permLevels.admin;
    }
    const modrole = await Bot.client.database.getGuildSetting(member.guild, "mod_role");
    if (modrole && isSnowflake(modrole.value)) {
        if (member.roles.cache.has(modrole.value)) {
            return permLevels.mod;
        }
    }
    const memberXP = await Bot.client.database.getXP(member)
    if (memberXP && memberXP.level > 0) {
        return permLevels.trustedMember;
    }
    return permLevels.member;
}
