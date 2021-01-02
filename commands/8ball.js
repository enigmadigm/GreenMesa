const xlg = require("../xlogger");

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
    async execute(client, message, args) {
        try {
            if (args.join(" ").toLowerCase() === "what is the meaning of the universe" || args.join(" ").toLowerCase() === "what is the meaning of the universe?") {
                await message.channel.send("42");
                return;
            }
            await message.channel.send(doMagic8BallVoodoo());
        } catch (error) {
            xlg.error(error);
            await client.specials.sendError(message.channel, "Failure removing role");
            return false;
        }
    }
}