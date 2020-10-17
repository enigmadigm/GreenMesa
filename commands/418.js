module.exports = {
    name: '418',
    aliases: ['http418', 'error418'],
    description: 'oh no!',
    category: 'fun',
    execute(client, message) {
        message.channel.send("RESPONSE 418: I'm a teapot <:teapot_sm_2:755357581102415903>");
    }
}