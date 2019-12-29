// 8ball response generator
function doMagic8BallVoodoo() {
    var rand = ['Yes', 'No', 'Why are you even trying?', 'What do you think? NO', 'Maybe', 'Never', 'Yep'];
    return rand[Math.floor(Math.random() * rand.length)];
}

module.exports = {
    name: '8ball',
    description: 'the game of 8ball: yes or no',
    execute(client, message, args, conn) {
        message.channel.send(doMagic8BallVoodoo()).catch(console.error);
    }
}