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
    description: 'provides a decently random number between 0 and 10 or the maximum',
    usage: "[maximum >= 0]",
    aliases: ['random', 'randomnumber', 'rn', 'rng'],
    category: 'utility',
    execute(client, message, args) {
        let provNum = args[0] || 10;
        message.channel.send(getRandom(provNum)).catch(console.error);
    }
}