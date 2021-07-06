import { Command } from "src/gm";

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

export const command: Command = {
    name: "emojify",
    description: {
        short: "convert text to emojis",
        long: "Convert normal text to emoji characters",
    },
    flags: [
        {
            f: "s",
            d: "use normal spaces to delimit instead of no-width spaces",
        }
    ],
    usage: "<text>",
    examples: [
        "I am your father",
        "-s I am pregnant",
    ],
    args: true,
    async execute(client, message, args, flags) {
        try {
            const textArray = args.join(" ").split("");
            const mappedText = [];
            for (let i = 0; i < textArray.length; i++) {
                const letter = <keyof typeof emojiConversion>textArray[i].toUpperCase();
                if (emojiConversion[letter]) {
                    mappedText.push(`${emojiConversion[letter]}${flags.find(x => x.name === "s") ? ` ` : `\u200b`}`);
                } else {
                    mappedText.push(letter);
                }
            }
            if (mappedText.length < 1) {
                await message.channel.send({
                    embeds: [{
                        color: await client.database.getColor("fail"),
                        description: "no emojifiable content",
                    }],
                });
                return;
            }

            await message.channel.send(mappedText.join(""));
        } catch (error) {
            xlg.error(error);
            await client.specials.sendError(message.channel);
            return false;
        }
    }
}
