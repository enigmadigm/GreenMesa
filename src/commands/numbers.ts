import fetch from 'node-fetch';
import { Command } from 'src/gm';
import xlg from '../xlogger';

const command: Command = {
    name: 'numbers',
    description: {
        short: "provides some neato number facts",
        long: "provides some neato number facts"
    },
    category: 'fun',
    async execute(client, message) {
        try {
            const r = await fetch('http://numbersapi.com/random?json=')
            const j = await r.json();
            message.channel.send({
                embed: {
                    "title": `:regional_indicator_n::regional_indicator_u::regional_indicator_m::regional_indicator_b::regional_indicator_e::regional_indicator_r::regional_indicator_s:`,
                    "description": `${j.text}`,
                    "color": Math.floor(Math.random() * 16777215),
                    "timestamp": new Date(),
                    "footer": {
                        "text": `Numbers | No. ${j.number} | Response Type: ${j.type}`
                    }
                }
            });
        } catch (error) {
            xlg.error(error);
            await client.specials?.sendError(message.channel, "There is an error with the api or request.");
            return false;
        }
    }
}

export default command;