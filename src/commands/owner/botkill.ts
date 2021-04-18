import { Command } from 'src/gm';
import { permLevels } from '../../permissions';
import xlg from '../../xlogger';

export const command: Command = {
    name: 'botkill',
    description: 'oopsie doopsie dropped the bot',
    cooldown: 60,
    permLevel: permLevels.botMaster,
    async execute(client, message, args) {
        try {
            await message.channel.send('Shutting down...');
            if (args.length && args[0].toLowerCase() === 'pm2') {
                const pm2 = await require('pm2');
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                pm2.connect(async (err: any) => {
                    if (err) {
                        xlg.error(err);
                        process.exit(2);
                    }

                    await message.channel.send('...goodbye');
                    client.destroy();
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    pm2.stop('stratum', (O_o: any) => O_o);
                });
            } else {
                await message.channel.send('...goodbye');
                client.destroy();
                process.exit(0);
                /*await message.channel.send("Shut down").then(client.destroy()).catch(e => console.log(e.stack));
                console.log("bot shut down");*/
            }
        } catch (error) {
            xlg.error(error);
            await client.specials?.sendError(message.channel);
            return false;
        }
    }
}

