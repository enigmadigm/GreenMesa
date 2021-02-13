import { Bot } from "../bot";
import { MessageService } from "../gm";
import xlg from "../xlogger";

export const service: MessageService = {
    async execute(client, message) {
        try {
            if (!message.guild) return;
            const modResult = await Bot.client.database?.getAutoModuleEnabled(message.guild.id, "antiembed", message.channel.id);
            if (!modResult) return;

            if (message.embeds.length) {
                message.suppressEmbeds();
            }
        } catch (error) {
            xlg.error(error);
        }
    }
}