import { GuildMember } from "discord.js";
import xlg from "../xlogger";
//const { getGlobalSetting } = require("../dbmanager");

// if (!message.channel.permissionsFor(message.guild.me).has(["SEND_MESSAGES"]) || !message.channel.manageable)

export default async function potatoRoler(member: GuildMember): Promise<void> {
    try {
        if (member.guild.id !== "725784760366006353") return;
        if (member.user.bot) {
            await member.roles.add("747934781756670045");
            return;
        }
        await member.roles.add("754071177156100136");
    } catch (error) {
        xlg.error(error);
    }
}
