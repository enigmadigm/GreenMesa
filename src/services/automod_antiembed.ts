import { Bot } from "../bot";
import { MessageService } from "../gm";
import xlg from "../xlogger";

export const service: MessageService = {
    async execute(client, message) {
        try {
            if (!message.guild) return;
            const modResult = await Bot.client.database?.getGuildSetting(message.guild, "automod_antiembed");
            if (!modResult || modResult.value !== "enabled") return;

            if (message.embeds.length) {
                message.suppressEmbeds();
            }
        } catch (error) {
            xlg.error(error);
        }
    }
}