import { MessageAttachment } from "discord.js";
import { Bot } from "../bot";
import { GuildMessageProps, MessageService, XMessage } from "../gm";

export const service: MessageService = {
    events: ["message", "messageUpdate"],
    async getInformation() {
        return "Get rid of those moving pictures. It's time to go back to the good days when all we had were those still pictures. By enabling this module, you won't have to deal with those annoying kids who send epilepsy inducing images.";
    },
    async execute(client, events, message: XMessage & GuildMessageProps) {
        try {
            const modResult = await Bot.client.database.getAutoModuleEnabled(message.guild.id, "antigif", message.channel.id, undefined, message.member);
            if (!modResult) return;
            //const modResult = await Bot.client.database.getGuildSetting(message.guild, "automod_antigif");
            //if (!modResult || modResult.value !== "enabled") return;
            let hasGif = false;

            if (message.attachments.size) {
                message.attachments.forEach((a: MessageAttachment) => {
                    if (a.name?.endsWith(".gif")) {
                        hasGif = true;
                    }
                });
            } else if (message.embeds.length) {
                for (const embed of message.embeds) {
                    if (embed.type === "gifv") {
                        hasGif = true;
                        break;
                    }
                }
            }

            if (hasGif) {
                await client.services?.punish<XMessage>(modResult, message.member, message);
            }
        } catch (error) {
            xlg.error(error);
        }
    }
}
