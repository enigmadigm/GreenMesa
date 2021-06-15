import { GuildMember, Permissions } from "discord.js";
import { MessageService } from "../gm";
import { isSnowflake } from "../utils/specials";

export const service: MessageService = {
    events: ["guildMemberAdd", "guildMemberRemove"],
    async getInformation() {
        return "logs member movement in the set channel";
    },
    async execute(client, event, member: GuildMember) {
        try {
            if (!member.guild.available || !client.user) return;
            const mvm = await client.database.getMovementData(member.guild.id);
            if (event === "guildMemberAdd") {
                if (mvm.add_channel && isSnowflake(mvm.add_channel)) {
                    const c = member.guild.channels.cache.get(mvm.add_channel);
                    if (c && c.isText() && c.permissionsFor(client.user)?.has([Permissions.FLAGS.SEND_MESSAGES, Permissions.FLAGS.EMBED_LINKS])) {
                        const e = client.specials.assembleDashboardMessage(mvm.add_message);
                        if (e.content || e.embed) {
                            try {
                                await c.send(e);
                            } catch (error) {
                                //
                                xlg.error(error)
                            }
                        }
                    }
                }
                try {// send message to member for dm welcome message
                    const e = client.specials.assembleDashboardMessage(mvm.dm_message);
                    if (e.content || e.embed) {
                        await member.send(e);
                    }
                } catch (error) {
                    // xlg.error(error);
                }
            } else if (event === "guildMemberRemove" && mvm.depart_channel) {
                if (isSnowflake(mvm.depart_channel)) {
                    const c = member.guild.channels.cache.get(mvm.depart_channel);
                    if (c && c.isText() && c.permissionsFor(client.user)?.has([Permissions.FLAGS.SEND_MESSAGES, Permissions.FLAGS.EMBED_LINKS])) {
                        const e = client.specials.assembleDashboardMessage(mvm.depart_message);
                        if (e.content || e.embed) {
                            try {
                                await c.send(e);
                            } catch (error) {
                                //
                                xlg.error(error)
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
