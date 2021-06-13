import { GuildMessageProps, MessageService, XMessage } from "../gm";
import { Bot } from "../bot";
import expletives from 'corpora/data/words/expletives.json';
const expletiveList: string[] = expletives.expletives;

export const service: MessageService = {
    events: ["message", "messageUpdate"],
    async getInformation() {
        return "Christian mode for your server. Enabling this module will censore all popular obscene language and many variations of that totally vulgar content.";
    },
    async execute(client, event, message: XMessage & GuildMessageProps) {
        try {
            const modResult = await Bot.client.database.getAutoModuleEnabled(message.guild.id, "profanity", message.channel.id, undefined, message.member);
            if (!modResult) return;

            if (!message.content) return;
            const a = message.content.toLowerCase();
            let hasBadWord = false;
            if (!modResult.option1) {// the first check, always goes because hasBadWord is false
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
                for (let phrase of modResult.customList) {
                    phrase = phrase.toLowerCase();
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
                //await message.delete();
                await client.services?.punish<XMessage>(modResult, message.member, message);
            }
        } catch (error) {
            xlg.error(error);
        }
    }
}
