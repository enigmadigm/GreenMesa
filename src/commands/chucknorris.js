const fetch = require('node-fetch');
module.exports = {
    name: 'chucknorris',
    description: 'Hand curated *(not by me)* Chuck Norris facts',
    aliases:['chuck', 'cn'],
    args:false,
    cooldown: 1,
    category: 'fun',
    execute(client, message, args) {
        if (Math.random() < 0.08) {
            message.channel.send('I recommend joke `KC54acTTT6iPf9FD0m7VWw`');
        }
        if (args.length & args.length == 1 & args.toString().length == 22) {
            return fetch(`https://api.chucknorris.io/jokes/${args.join("%20")}`)
                .then(res => res.json())
                .then(j => {
                    message.channel.send({
                        embed: {
                            "title": ":bust_in_silhouette: Chuck Norris :punch:",
                            "description": j.value,
                            "color": Math.floor(Math.random() * 16777215),
                            "timestamp": j.created_at,
                            "footer": {
                                "icon_url": j.icon_url,
                                "text": j.id
                            }
                        }
                    }).catch(console.error);
                }).catch(console.error);
        }
        try {
            fetch('https://api.chucknorris.io/jokes/random')
                .then(res => res.json())
                .then(j => {
                    message.channel.send({
                        embed: {
                            "title": ":bust_in_silhouette: Chuck Norris :punch:",
                            "description": j.value,
                            "color": Math.floor(Math.random() * 16777215),
                            "timestamp": j.created_at,
                            "footer": {
                                "icon_url": j.icon_url,
                                "text": j.id
                            }
                        }
                    }).catch(console.error);
                }).catch(console.error);
        } catch (error) {
            console.error;
            message.channel.send("There was an oopsie, Chuck will brb.");
        }
    }
}