/**
 * Generates the magic 8ball response
 */
function doMagic8BallVoodoo() {
    var rand = ['Yes', 'No', 'idk, maybe', 'occasionally', 'in your dreams', "when you're dead that will be true"];
    return rand[Math.floor(Math.random() * rand.length)];
}

module.exports = {
    name: '8ball',
    description: 'play some *magic* 8ball (not pool)',
    category: 'fun',
    execute(client, message) {
        message.channel.send(doMagic8BallVoodoo()).catch(console.error);
    }
}