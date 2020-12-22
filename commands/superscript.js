const xlg = require("../xlogger");
const { permLevels } = require('../permissions');
//const { getGlobalSetting } = require("../dbmanager");
const superConversion = {
    "a": "ᵃ",
    "b": "ᵇ",
    "c": "ᶜ",
    "d": "ᵈ",
    "e": "ᵉ",
    "f": "ᶠ",
    "g": "ᵍ",
    "h": "ʰ",
    "i": "ᶦ",
    "j": "ʲ",
    "k": "ᵏ",
    "l": "ˡ",
    "m": "ᵐ",
    "n": "ⁿ",
    "o": "ᵒ",
    "p": "ᵖ",
    "q": "ᑫ",
    "r": "ʳ",
    "s": "ˢ",
    "t": "ᵗ",
    "u": "ᵘ",
    "v": "ᵛ",
    "w": "ʷ",
    "x": "ˣ",
    "y": "ʸ",
    "z": "ᶻ",
    "1": "¹",
    "2": "²",
    "3": "³",
    "4": "⁴",
    "5": "⁵",
    "6": "⁶",
    "7": "⁷",
    "8": "⁸",
    "9": "⁹",
    "0": "⁰",
    ",": "\u22C5",
    ".": "\u22C5",
}

module.exports = {
    name: "superscript",
    aliases: ["super"],
    description: {
        short: "convert text to superscript",
        long: "Send text and convert all compatible letters to superscript."
    },
    category: "utility",
    usage: "<text>",
    args: true,
    permLevel: permLevels.member,
    guildOnly: false,
    async execute(client, message, args) {
        try {
            const text = args.join(" ").split("");
            for (let i = 0; i < text.length; i++) {
                const l = text[i];
                if (superConversion[l]) {
                    text[i] = `${superConversion[l]}`;
                }
            }
            if (text.length < 1) {
                client.specials.sendError(message.channel, "the conversion resulted in no text to display");
                return;
            }
            message.channel.send(text.join(""));
        } catch (error) {
            xlg.error(error);
            await client.specials.sendError(message.channel);
            return false;
        }
    }
}