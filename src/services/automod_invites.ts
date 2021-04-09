import { Bot } from "../bot";
import { MessageService, XMessage } from "../gm";
import xlg from "../xlogger";

/* function escapeRegex(string: string) {
    return string.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
} */

const rNested = new RegExp(/(https?:\/\/)?(www\.)?(discord\.(gg|io|me|li)|dsc\.gg|discord\.com\/invite|discordapp\.com\/invite)\/[^\s/]+?(?=\b)/g);

function containsInvite(str: string, nested?: boolean): boolean {
    if (new RegExp("^" + rNested.source + "$").test(str) || new RegExp(" " + rNested.source + " ").test(str) || new RegExp(" " + rNested.source + "$").test(str) || new RegExp("^" + rNested.source + " ").test(str)) {
        return true;
    }
    if (nested) {
        if (rNested.test(str)) {
            return true;
        }
    }
    // if (strict) {
    //     if (r.test(str.replace(/\s/g, ""))) {
    //         return true;
    //     }
    // }
    return false;
}

export const service: MessageService = {
    text: true,
    async getInformation() {
        return "Detects any messages containing properly formed invites for Discord servers. This module ignores links in embeds by default.";
    },
    async execute(client, message: XMessage) {
        try {
            if (!message.guild || !message.member) return;
            const modResult = await Bot.client.database.getAutoModuleEnabled(message.guild.id, "invites", message.channel.id, undefined, message.member);
            if (!modResult) return;
            let flag = false;

            if (message.content) {
                if (containsInvite(message.content, modResult.option1)) {
                    flag = true;
                    //message.delete();
                }
            }

            if (flag) {
                await client.services.punish<XMessage>(modResult, message.member, message);
            }
        } catch (error) {
            xlg.error(error);
        }
    }
}