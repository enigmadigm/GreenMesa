import { GuildMember } from "discord.js";
import { MessageService } from "../gm";
import { ban } from "../utils/modactions.js";

export const service: MessageService = {
    events: ["guildMemberAdd"],
    async getInformation() {
        return "bans members on join if they are on the autoban list";
    },
    async execute(client, event, member: GuildMember) {
        try {
            if (!member.guild.available) return;
            const storedBans = await client.database.getGuildSetting(member.guild, "toban");
            if (storedBans) {
                try {
                    const bans: string[] = JSON.parse(storedBans.value);
                    if (bans.includes(member.id) && member.guild.me) {
                        try {
                            //await member.ban();
                            await ban(client, member, undefined, member.guild.me, `Autoban initiated on join. Triggered because ${member.user.tag} was on the autoban list.`);
                            bans.splice(bans.indexOf(member.id), 1);
                            await client.database.editGuildSetting(member.guild, "toban", JSON.stringify(bans).escapeSpecialChars());
                        } catch (error) {
                            await member.kick().catch((o_O) => o_O);
                        }
                        //await logAutoBan(member);
                        return;
                    }
                } catch (error) {
                    xlg.error(error);
                }
            }
        } catch (error) {
            xlg.error(error);
        }
    }
}
