import { MessageAttachment } from "discord.js";
import { Bot } from "../bot";
import { MessageService, XMessage } from "../gm";
import xlg from "../xlogger";

export const service: MessageService = {
    text: true,
    async execute(client, message: XMessage) {
        try {
            if (!message.guild || !message.member) return;
            const modResult = await Bot.client.database?.getAutoModuleEnabled(message.guild.id, "antigif", message.channel.id, undefined, message.member);
            if (!modResult) return;
            //const modResult = await Bot.client.database?.getGuildSetting(message.guild, "automod_antigif");
            //if (!modResult || modResult.value !== "enabled") return;
            let hasGif = false;

            if (message.attachments.size) {
                message.attachments.forEach((a: MessageAttachment) => {
                    if (a.name?.endsWith(".gif")) {
                        hasGif = true;
                    }
                });
            } else if (message.embeds.length) {
                if (message.embeds[0].type === "gifv") {
                    hasGif = true;
                }
            }

            if (hasGif) {
                message.delete();
            }
        } catch (error) {
            xlg.error(error);
        }
    }
}