const xlg = require("../xlogger");
const { getGlobalSetting } = require("../dbmanager");
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

module.exports = {
    name: "emojify",
    description: "convert text to emojies",
    usage: "<text>",
    args: true,
    async execute(client, message, args) {
        try {
            let textArray = args.join(" ").split("");
            let mappedText = [];
            for (let i = 0; i < textArray.length; i++) {
                const letter = textArray[i].toUpperCase();
                if (emojiConversion[letter]) {
                    mappedText.push(`${emojiConversion[letter]}\u200b`);
                } else {
                    mappedText.push(letter);
                }
            }
            if (mappedText.length < 1) {
                message.channel.send({
                    embed: {
                        color: parseInt((await getGlobalSetting('fail_embed_color'))[0].value, 10),
                        description: "no emojified content"
                    }
                });
                return false;
            }
            message.channel.send(mappedText.join(""));
            return true;
        } catch (error) {
            xlg.error(error);
            await client.specials.sendError(message.channel);
            return false;
        }
    }
}