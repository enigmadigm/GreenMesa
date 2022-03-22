import { permLevels } from '../../permissions.js';
import { Command } from "src/gm";

/**
 *                       |  A 	B 	C 	D 	E 	F 	G 	H 	I 	J 	K 	L 	M 	N 	O 	P 	Q 	R 	S 	T 	U 	V 	W 	X 	Y 	Z
 * Superscript capital 	 |  ᴬ 	ᴮ 	* 	ᴰ 	ᴱ 	* 	ᴳ 	ᴴ 	ᴵ 	ᴶ 	ᴷ 	ᴸ 	ᴹ 	ᴺ 	ᴼ 	ᴾ 	* 	ᴿ 		ᵀ 	ᵁ 	ⱽ 	ᵂ
 * Superscript small cap |  	* 					* 	* 	ᶦ 			ᶫ 		ᶰ 				* 			ᶸ 				*
 * Superscript minuscule |  ᵃ 	ᵇ 	ᶜ 	ᵈ 	ᵉ 	ᶠ 	ᵍ 	ʰ 	ⁱ 	ʲ 	ᵏ 	ˡ 	ᵐ 	ⁿ 	ᵒ 	ᵖ 	* 	ʳ 	ˢ 	ᵗ 	ᵘ 	ᵛ 	ʷ 	ˣ 	ʸ 	ᶻ
 */

const superConversion = {
    "a": "ᵃ",
    "A": "ᴬ",
    "b": "ᵇ",
    "B": "ᴮ",
    "c": "ᶜ",
    "C": "ᶜ",
    "d": "ᴰ",
    "D": "ᵈ",
    "e": "ᵉ",
    "E": "ᴱ",
    "f": "ᶠ",
    "F": "ᶠ",
    "g": "ᵍ",
    "G": "ᴳ",
    "h": "ʰ",
    "H": "ᴴ",
    "i": "ⁱ",
    "I": "ᴵ",
    "j": "ʲ",
    "J": "ʲ",
    "k": "ᵏ",
    "K": "ᴷ",
    "l": "ˡ",
    "L": "ᴸ",
    "m": "ᵐ",
    "M": "ᴹ",
    "n": "ⁿ",
    "N": "ᴺ",
    "o": "ᵒ",
    "O": "ᴼ",
    "p": "ᵖ",
    "P": "ᴾ",
    "q": "ᑫ",
    "Q": "ᑫ",
    "r": "ʳ",
    "R": "ᴿ",
    "s": "ˢ",
    "S": "ˢ",
    "t": "ᵗ",
    "T": "ᵀ",
    "u": "ᵘ",
    "U": "ᵁ",
    "v": "ᵛ",
    "V": "ⱽ",
    "w": "ʷ",
    "W": "ᵂ",
    "y": "ʸ",
    "Y": "ʸ",
    "x": "ˣ",
    "X": "ˣ",
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
    "?": "ˀ",
    "!": "ᶥ",
}

export const command: Command = {
    name: "superscript",
    aliases: ["super"],
    description: {
        short: "text to superscript",
        long: "Send text and convert all compatible letters to superscript."
    },
    usage: "<text>",
    args: true,
    permLevel: permLevels.member,
    async execute(client, message, args) {
        try {
            const text = args.join(" ").split("");
            for (let i = 0; i < text.length; i++) {
                const l = <keyof typeof superConversion>text[i];
                if (superConversion[l]) {
                    text[i] = `${superConversion[l]}`;
                }
            }
            
            if (text.length < 1) {
                await client.specials.sendError(message.channel, "the conversion resulted in no text to display");
                return;
            }

            await message.channel.send(text.join(""));
        } catch (error) {
            xlg.error(error);
            await client.specials.sendError(message.channel);
            return false;
        }
    }
}
