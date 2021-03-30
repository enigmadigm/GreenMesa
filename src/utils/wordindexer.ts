// This file was used briefly to format a file of 10000 words as JSON
// Before doing this, I considered using it to parse all messages that
// the bot sees and add any new words it finds to the JSON dictionary.
// I may still do that, but that is currently *not in progress.*

import fs from "fs";
import { XMessage } from "src/gm";
import words from "../words.json";

export function wi(msg: XMessage): false | undefined {
    if (!msg || !msg.content || typeof msg.content !== "string") return false;
    const mws = msg.content.replace(/[.,]/, "").replace("/", " ").split(/\s/).filter(x => {
        if (/^[A-Za-z]+$/.test(x)) {
            return x;
        }
    });
    const ws = mws.map(x => {
        x = x.toLowerCase();
        return { start: x[0], full: x }
    });
    for (let i = 0; i < ws.length; i++) {
        const w = ws[i];
        if (!words[w.start]) {
            words[w.start] = [];
        }
        const row = words[w.start];
        row.push(w.full);
    }
    console.log(words)
    fs.writeFile("./words.json", JSON.stringify(words, null, 2), function (err) {
        if (err) return console.log(err);
    });
}
/*console.log(words)
const m = {
    content: fs.readFileSync("./words", 'utf8')
}
wi(m);*/
