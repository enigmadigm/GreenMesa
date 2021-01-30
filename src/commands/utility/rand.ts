import { Command } from "src/gm";

/**
 * Random number generator with opt. max number
 * @param {number} n maximum number
 */
function getRandom(n: number) {
    if (!isNaN(n)) {
        return Math.floor(Math.random() * Math.floor(n));
    } else {
        return "You must send a valid number to be used as a maximum";
    }
}

export const command: Command = {
    name: 'rand',
    description: 'provides a decently random number between 0 and 10 or the maximum',
    usage: "[maximum >= 0]",
    aliases: ['random', 'randomnumber', 'rn', 'rng'],
    async execute(client, message, args) {
        if (args.length && !(await client.specials?.argsNumRequire(message.channel, args, 3))) return false;
        const provNum = parseInt(args[0], 10) || 10;
        message.channel.send(getRandom(provNum)).catch(console.error);
    }
}

