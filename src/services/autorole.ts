import xlg from "../xlogger";
import { AutoroleData, MessageService } from "../gm";
import { Bot } from "../bot";
import { GuildMember } from "discord.js";

export const service: MessageService = {
    async execute(client, member: GuildMember) {
        try {
            if (!member.guild) return;
            const ar = await Bot.client.database.getGuildSetting(member.guild, "autorole");
            if (!ar) return;
            const autorole: AutoroleData = JSON.parse(ar.value);
            if (member.user.bot) {
                if (autorole.botRoles && autorole.botRoles.length) {
                    for (const id of autorole.botRoles) {
                        const r = member.guild.roles.cache.get(id);
                        if (r) {
                            member.roles.add(r);
                        }
                    }
                }
            } else {
                if (autorole.roles && autorole.roles.length) {
                    for (const id of autorole.roles) {
                        const r = member.guild.roles.cache.get(id);
                        if (r) {
                            member.roles.add(r);
                        }
                    }
                }
            }
        } catch (error) {
            xlg.error(error);
        }
    }
}
