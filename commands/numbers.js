const fetch = require('node-fetch');
const xlg = require('../xlogger');

module.exports = {
    name: 'numbers',
    description: 'provides some neato number facts',
    category: 'fun',
    async execute(client, message) {
        try {
            fetch('http://numbersapi.com/random?json=')
                .then(res => res.json())
                .then(async j => {
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
                    }).catch(console.error);
                }).catch((err) => {
                    console.error("Numbers API Error: ", err);
                    message.channel.send("There is an error with the api or request.").catch(console.error);
                });
        } catch (error) {
            xlg.error(error);
            await client.specials.sendError(message.channel);
            return false;
        }
    }
}