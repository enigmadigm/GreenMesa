import xlg from "../xlogger";
import { MessageService, XMessage } from "../gm";
import { Bot } from "../bot";
//import expletives from '../../expletives.json';
import expletives from 'corpora/data/words/expletives.json';
const expletiveList: string[] = expletives.expletives;

export const service: MessageService = {
    text: true,
    async getInformation() {
        return "Christian mode for your server. Enabling this module will censore all popular obscene language and many variations of that totally vulgar content.";
    },
    async execute(client, message: XMessage) {
        try {
            if (!message.guild || !message.member) return;
            const modResult = await Bot.client.database?.getAutoModuleEnabled(message.guild.id, "profanity", message.channel.id, undefined, message.member);
            if (!modResult) return;

            if (!message.content) return;
            const a = message.content.toLowerCase();
            let hasBadWord = false;
            if (!hasBadWord && !modResult.option1) {
                for (const word of expletiveList) {
                    if (modResult.strict && a.indexOf(word) !== -1) {
                        hasBadWord = true;
                        break;
                    } else if (a.indexOf(` ${word} `) !== -1 || a === word || a.startsWith(`${word} `) || a.endsWith(` ${word}`)) {
                        hasBadWord = true;
                        break;
                    }
                }
            }
            if (!hasBadWord && modResult.customList?.length) {
                for (const phrase of modResult.customList) {
                    if (modResult.strict && a.indexOf(phrase) !== -1) {
                        hasBadWord = true;
                        break;
                    } else if (a.indexOf(` ${phrase} `) !== -1 || a === phrase || a.startsWith(`${phrase} `) || a.endsWith(` ${phrase}`)) {
                        hasBadWord = true;
                        break;
                    }
                }
            }

            if (hasBadWord) {
                await message.delete();
            }
        } catch (error) {
            xlg.error(error);
        }
    }
}