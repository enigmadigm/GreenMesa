import { AutoroleData, MessageService } from "../gm";
import { Bot } from "../bot";
import { GuildMember } from "discord.js";
import moment from "moment";
import { mute } from "../utils/modactions";
import { isSnowflake } from "../utils/specials";

export const service: MessageService = {
    events: ["guildMemberAdd"],
    async execute(client, event, member: GuildMember) {
        try {
            if (!member.guild.available) return;
            // restoring mute role for mute evasion protection
            const mutes = await client.database.getTimedActions({
                actiontype: "unmute",
            });
            if (mutes && mutes.length) {
                const muteDat = mutes.find(x => x.data.userid === member.id && moment(x.time).isAfter(moment()));
                if (muteDat) {
                    await mute(client, member, undefined, member.guild.me || client.user?.id || "", undefined, true);
                }
            }
            // normal autorole starts here
            const ar = await Bot.client.database.getGuildSetting(member.guild, "autorole");
            if (!ar) return;
            const autorole: AutoroleData = JSON.parse(ar.value);
            if (member.user.bot) {
                if (autorole.botRoles && autorole.botRoles.length) {
                    for (const id of autorole.botRoles) {
                        if (isSnowflake(id)) {
                            const r = member.guild.roles.cache.get(id);
                            if (r) {
                                member.roles.add(r);
                            }
                        }
                    }
                }
            } else {
                if (autorole.roles && autorole.roles.length) {
                    for (const id of autorole.roles) {
                        if (isSnowflake(id)) {
                            const r = member.guild.roles.cache.get(id);
                            if (r) {
                                await member.roles.add(r);
                            }
                        }
                    }
                }
                if (autorole.retain) {
                    const guserDat = await Bot.client.database.getGuildUserData(member.guild.id, member.id);
                    if (guserDat.roles) {
                        const storedRoles: string[] = JSON.parse(guserDat.roles);
                        if (storedRoles.length) {
                            const roles = await member.guild.roles.fetch();
                            const rolesToGive = roles.filter((x) => storedRoles.includes(x.id) && !member.roles.cache.get(x.id));
                            for (const r of rolesToGive) {
                                await member.roles.add(r);
                                await new Promise((resolve) => setTimeout(resolve, 200));
                            }
                        }
                    }
                }
            }
        } catch (error) {
            xlg.error(error);
        }
    }
}
