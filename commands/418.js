module.exports = {
    name: '418',
    aliases: ['http418', 'e418', 'error418'],
    description: 'oh no! error 418!',
    category: 'fun',
    execute(client, message) {
        message.channel.send("I'm a teapot <:teapot_sm:755357581102415903>");
    }
}