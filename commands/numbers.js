const fetch = require('node-fetch');

module.exports = {
    name: 'numbers',
    description: 'Get some neato number facts',
    aliases:['nm'],
    execute(client, message, args) {
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
            }).catch(console.error);
    }
}