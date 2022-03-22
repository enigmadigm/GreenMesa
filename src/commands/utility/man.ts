import { permLevels } from '../../permissions.js';
import { Command } from "src/gm";
import fetch from 'node-fetch';

export const command: Command = {
    name: "man",
    description: {
        short: "manpages help",
        long: "Manpages detailed help."
    },
    examples: [
        "ls",
        "ls -ls",
    ],
    usage: "<query>",
    args: true,
    cooldown: 1,
    permLevel: permLevels.botMaster,
    // permLevel: permLevels.member,
    permissions: [],
    async execute(client, message, args) {
        const a = args.join(" ");
        const r = await fetch(`https://www.mankier.com/api/v2/explain/?cols=70&q=${a}`);
        if (!`${r.status}`.startsWith("2")) {
            await client.specials.sendError(message.channel, `Invalid response.`);
        }
        const retext = await r.text();
        xlg.log(retext);
    }
}
