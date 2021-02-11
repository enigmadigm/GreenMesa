import { Bot } from "../bot";
import { MessageService } from "../gm";
import xlg from "../xlogger";

export const service: MessageService = {
    async execute(client, message) {
        try {
            if (!message.guild) return;
            const modResult = await Bot.client.database?.getGuildSetting(message.guild, "automod_antigif");
            if (!modResult || modResult.value !== "enabled") return;

            if (message.attachments.size) {
                let hasGif = false;
                message.attachments.forEach(a => {
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