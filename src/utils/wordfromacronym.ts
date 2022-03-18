// https://github.com/Chew/AcronymGenerator/blob/master/assets/js/changemessage.js

import words from "../../words.json";

export function genPhrase(input: string): string {
    input = input.toLowerCase();
    const letters = input.split("");
    let phrase = "";
    for (let i = 0; i < letters.length; i++) {
        const gw = genWord(letters[i]);
        //console.log(`s:${gw}:e:${i}`);
        if (gw != "" && gw != " ") {
            phrase += gw;
            if (i < letters.length - 1) {
                phrase += " ";
            }
        }
    }
    return phrase;
}

function genWord(letter: string) {
    let array = "";
    if (letter.toString().toLowerCase().match(/[a-z]/))
        array = words[letter];
    if (array !== "")
        return array[Math.floor(Math.random() * array.length)];
    else
        return "";
}
