import { MessageAttachment } from "discord.js";
import { Bot } from "../bot";
import { MessageService, XMessage } from "../gm";
import xlg from "../xlogger";

export const service: MessageService = {
    text: true,
    async execute(client, message: XMessage) {
        try {
            if (!message.guild) return;
            const modResult = await Bot.client.database?.getAutoModuleEnabled(message.guild.id, "antigif", message.channel.id);
            if (!modResult) return;
            //const modResult = await Bot.client.database?.getGuildSetting(message.guild, "automod_antigif");
            //if (!modResult || modResult.value !== "enabled") return;

            if (message.attachments.size) {
                let hasGif = false;
                message.attachments.forEach((a: MessageAttachment) => {
                    if (a.name?.endsWith(".gif")) {
                        hasGif = true;
                    }
                });
                if (hasGif) {
                    message.delete();
                }
            }
        } catch (error) {
            xlg.error(error);
        }
    }
}