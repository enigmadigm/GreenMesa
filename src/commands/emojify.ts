import { Command } from "src/gm";
import xlg from "../xlogger";
//import { getGlobalSetting } from "../dbmanager";
const emojiConversion = {
    "A": "🇦",
    "B": "🇧",
    "C": "🇨",
    "D": "🇩",
    "E": "🇪",
    "F": "🇫",
    "G": "🇬",
    "H": "🇭",
    "I": "🇮",
    "J": "🇯",
    "K": "🇰",
    "L": "🇱",
    "M": "🇲",
    "N": "🇳",
    "O": "🇴",
    "P": "🇵",
    "Q": "🇶",
    "R": "🇷",
    "S": "🇸",
    "T": "🇹",
    "U": "🇺",
    "V": "🇻",
    "W": "🇼",
    "X": "🇽",
    "Y": "🇾",
    "Z": "🇿",
    "1": "1️⃣",
    "2": "2️⃣",
    "3": "3️⃣",
    "4": "4️⃣",
    "5": "5️⃣",
    "6": "6️⃣",
    "7": "7️⃣",
    "8": "8️⃣",
    "9": "9️⃣",
    "0": "0️⃣",
}

const command: Command = {
    name: "emojify",
    description: "convert text to emojies",
    usage: "<text>",
    args: true,
    async execute(client, message, args) {
        try {
            const textArray = args.join(" ").split("");
            const mappedText = [];
            for (let i = 0; i < textArray.length; i++) {
                const letter = <keyof typeof emojiConversion>textArray[i].toUpperCase();
                if (emojiConversion[letter]) {
                    mappedText.push(`${emojiConversion[letter]}\u200b`);
                } else {
                    mappedText.push(letter);
                }
            }
            if (mappedText.length < 1) {
                message.channel.send({
                    embed: {
                        color: await client.database?.getColor("fail_embed_color"),
                        description: "no emojified content"
                    }
                });
                return false;
            }

            message.channel.send(mappedText.join(""));
            
            return true;
        } catch (error) {
            xlg.error(error);
            await client.specials?.sendError(message.channel);
            return false;
        }
    }
}

export default command;