import { Message } from "discord.js";
import { Bot } from "../bot";
import { MessageService } from "../gm";
import xlg from "../xlogger";

export const service: MessageService = {
    text: true,
    async execute(client, message) {
        try {
            if (!message.guild || !(message instanceof Message)) return;
            const modResult = await Bot.client.database?.getAutoModuleEnabled(message.guild.id, "antiembed", message.channel.id);
            if (!modResult) return;
            
            if (message.embeds.length) {
                if (modResult.ignoreBots && (message.webhookID || message.author.bot)) {
                    return;
                }
                message.suppressEmbeds();
            }
        } catch (error) {
            xlg.error(error);
        }
    }
}