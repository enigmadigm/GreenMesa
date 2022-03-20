import fetch from 'node-fetch';
import { Command, NorrisAPIResponse } from 'src/gm';

export const command: Command = {
    name: 'chucknorris',
    description: 'Hand curated *(not by me)* Chuck Norris facts',
    aliases:['chuck', 'cn'],
    cooldown: 1,
    async execute(client, message, args) {
        try {
            if (Math.random() < 0.08) {
                await message.channel.send(`I recommend joke \`KC54acTTT6iPf9FD0m7VWw\``);
            }
            if (args.length && args.length == 1 && args.toString().length == 22) {
                const r = await fetch(`https://api.chucknorris.io/jokes/${args.join("%20")}`)
                const j = await r.json() as NorrisAPIResponse;
                await message.channel.send({
                    embeds: [{
                        title: "👤 Chuck Norris 👊",
                        description: j.value,
                        color: Math.floor(Math.random() * 16777215),
                        timestamp: j.created_at,
                        footer: {
                            icon_url: j.icon_url,
                            text: j.id,
                        },
                    }],
                });
                return;
            }

            try {
                const r = await fetch('https://api.chucknorris.io/jokes/random')
                const j = await r.json() as NorrisAPIResponse;
                await message.channel.send({
                    embeds: [{
                        title: ":bust_in_silhouette: Chuck Norris :punch:",
                        description: j.value,
                        color: Math.floor(Math.random() * 16777215),
                        timestamp: j.created_at,
                        footer: {
                            icon_url: j.icon_url,
                            text: j.id,
                        },
                    }],
                });
            } catch (error) {
                xlg.error(error);
                await message.channel.send(`There was an oopsie, Chuck will brb.`);
            }
        } catch (error) {
            xlg.error(error);
            await client.specials.sendError(message.channel);
            return false;
        }
    }
}
