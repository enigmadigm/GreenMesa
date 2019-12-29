module.exports = {
    name: 'poker',
    description: 'in development',
    aliases:[],
    usage:"",
    args:false,
    guildOnly:false,
    cooldown: 3,
    ownerOnly: true,
    async execute(client, message, args, conn, snekfetch) {
        // message.channel.send("Awaiting...").then(r => r.delete(10000));
        // const msgs = await message.channel.awaitMessages(msg => {
        //     return msg.content.includes("a");
        // }, {time:5000});

        // message.channel.send(`Await completed! ${msgs.map(msg => msg.content).join(", ")}`);
        message.channel.send("This service is in development, and will be forever. I do not know how to make this, if anybody can help: email me at polyversialmind@gmail.com");
    }
}