// Get a random number
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
    description: 'This simple random number command will provide a number between 0 and the the number in the first argument or ten',
    usage: "[maximum >= 0]",
    aliases: ['random', 'randomnumber', 'rn', 'rng'],
    execute(client, message, args) {
        let provNum = args[0] || 10;
        message.channel.send(getRandom(provNum)).catch(console.error);
        /*if (args.length <= 1) {
            let provNum = args[0] || 10;
            message.channel.send(getRandom(provNum)).catch(console.error);
        } else {
            message.channel.send("Please send one argument as a maximum, or no arguments and a number between \*zero\* and \*ten\* will be returned");
        }*/
    }
}