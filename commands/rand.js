/**
 * Random number generator with opt. max number
 * @param {number} n maximum number
 */
function getRandom(n) {
    let newInt = parseFloat(n);
    if (!isNaN(newInt)) {
        return Math.floor(Math.random() * Math.floor(newInt));
    } else {
        return "You must send a valid number to be used as a maximum";
    }
}

module.exports = {
    name: 'rand',
    description: 'Get a random number between 0 and 10 or a number you provide.',
    usage: "[maximum >= 0]",
    aliases: ['random', 'randomnumber', 'rn', 'rng'],
    execute(client, message, args) {
        let provNum = args[0] || 10;
        message.channel.send(getRandom(provNum)).catch(console.error);
    }
}