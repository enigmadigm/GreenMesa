module.exports = {
    name: 'uptime',
    description: 'Up time and other bot information.',
    async execute(client, message) {
        let allSeconds = (client.uptime / 1000);
        let days = Math.floor(allSeconds / 86400);
        let hours = Math.floor(allSeconds / 3600);
        allSeconds %= 3600;
        let minutes = Math.floor(allSeconds / 60);
        let seconds = Math.floor(allSeconds % 60);
        let milliseconds = Math.floor(((allSeconds % 60) * 1000) - (seconds * 1000));
        if (days < 10) {
            days = "00" + days;
        } else if (days < 100) {
            days = "0" + days;
        }
        if (hours < 10) {
            hours = "0" + hours;
        }
        if (minutes < 10) {
            minutes = "0" + minutes;
        }
        if (seconds < 10) {
            seconds = "0" + seconds;
        }
        await message.channel.send("***COMMAND BEING DEVELOPED***").catch(console.error);
        message.channel.send({
            embed: {
                "title": "Bot Lifetime",
                "description": 'How long the bot has been alive (doesn\'t mean healthy)',
                "fields": [{
                        "name": "Expanded",
                        "value": `${client.user} has been online for ${days} days, ${hours} hours, ${minutes} minutes, ${seconds} seconds, and ${milliseconds} ms.`
                    },
                    {
                        "name": "Time",
                        "value": `${days}**:**${hours}**:**${minutes}**;**${seconds}**;**${milliseconds}`
                    },
                    {
                        "name": "ms total",
                        "value": client.uptime
                    }
                ]
            }
        }).catch(console.error);
    }
}