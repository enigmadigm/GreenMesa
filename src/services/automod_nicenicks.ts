import xlg from "../xlogger";
import { MessageService } from "../gm";
import { Bot } from "../bot";
import { GuildMember } from "discord.js";

export const service: MessageService = {
    async getInformation() {
        return "This will check the nicknames of new members and members who change their nicknames for special characters in patterns that could make the nickname difficult to mention. Basically, if there is are any non-standard english characters (alphabetic characters not found on a QWERTY keyboard) in the nickname, it will be changed to a placeholder nickname.";
    },
    async execute(client, member: GuildMember) {
        try {
            if (!member.guild) return;
            const modResult = await Bot.client.database?.getAutoModuleEnabled(member.guild.id, "nicenicks", undefined, undefined, member);
            if (!modResult) return;
            
            const name = member.nickname || member.user.tag;
            const hits = /[^\x20-\x7E\n]/g.exec(name);
            if (hits && hits.index < 5) {
                await member.setNickname("change name (stratum automod)", `automod:nicenicks saw a nondesirable nickname`);

                if (modResult.sendDM) {
                    await member.user.send(`Hello ${member.user}!
**Regarding server:** ${member.guild.name}
My \`nicenicks\` automodule noticed that your nickname isn't very nice to type out. The admins of ${member.guild.name} have requested that I change all user's undesirable nicknames to a placeholder until they change it to something nicer; please do so!`);
                    // THIS DM MESSAGE SHOULD BE CONFIGURABLE, IT SHOULD AT LEAST BE SOMETHING THAT CAN BE TOGGLED BY ADMINS ON THE DASHBOARD
                }
            }
        } catch (error) {
            xlg.error(error);
        }
    }
}