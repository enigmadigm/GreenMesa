var xlg = require('../xlogger');

module.exports = {
    name: 'botkill',
    description: 'oopsie doopsie dropped the bot',
    cooldown: 60,
    ownerOnly: true,
    async execute(client, message, args) {
        await message.channel.send('Shutting down...');
        if (args.length && args[0].toLowerCase() === 'pm2') {
            let pm2 = require('pm2');
            pm2.connect(async function (err) {
                if (err) {
                    xlg.error(err);
                    process.exit(2);
                }

                await message.channel.send('...goodbye');
                client.destroy();
                pm2.stop('bot', () => {});
            });
        } else {
            await message.channel.send('...goodbye');
            client.destroy();
            return process.exit(0);
            /*await message.channel.send("Shut down").then(client.destroy()).catch(e => console.log(e.stack));
            console.log("bot shut down");*/
        }
    }
}