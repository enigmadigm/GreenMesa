import { Bot } from "../bot.js";
import { GuildMessageProps, MessageService, XMessage } from "../gm";

export const service: MessageService = {
    events: ["message", "messageUpdate"],
    async getInformation() {
        return "Stop those annoying popups from links people send. The default mode for this module will censore all messages that contain any form of an embed. Embeds are the styled boxes that you can't send.";
    },
    async execute(client, event, message: XMessage & GuildMessageProps) {
        try {
            const modResult = await Bot.client.database.getAutoModuleEnabled(message.guild.id, "antiembed", message.channel.id, undefined, message.member);
            if (!modResult) return;
            let flag = false;

            if (message.embeds.length) {
                if (modResult.ignoreBots && (message.webhookId || message.author.bot)) {
                    return;
                }
                flag = true;
                await message.suppressEmbeds();
            }

            if (flag) {
                await client.services?.punish<XMessage>(modResult, message.member, message);
            }
        } catch (error) {
            xlg.error(error);
        }
    }
}