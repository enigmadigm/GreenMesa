const { args } = require("./inrole");

/**
 * Generates the magic 8ball response
 */
function doMagic8BallVoodoo() {
    var rand = ['Yes', 'No', 'idk, maybe', 'occasionally', 'in your dreams', "when you're dead that will be true", "never", "that could happen if you sacrifice something you love"];
    return rand[Math.floor(Math.random() * rand.length)];
}

module.exports = {
    name: '8ball',
    description: 'play some *magic* 8ball (not pool)',
    category: 'fun',
    args: true,
    execute(client, message) {
        if (args.join(" ").toLowerCase() === "what is the meaning of the universe" || args.join(" ").toLowerCase() === "what is the meaning of the universe?") {
            message.channel.send("42").catch(console.error);
        }
        message.channel.send(doMagic8BallVoodoo()).catch(console.error);
    }
}