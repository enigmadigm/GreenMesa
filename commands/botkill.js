module.exports = {
    name: 'botkill',
    description: 'oopsie doopsie dropped the bot',
    cooldown: 60,
    ownerOnly: true,
    async execute(client, message, args) {
        await message.channel.send('Shutting down...');
        let shutDown = await message.channel.send("Shut down").then(client.destroy()).catch(e => console.log(e.stack));
        console.log("bot shut down");
    }
}