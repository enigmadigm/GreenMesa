module.exports = {
    name: 'uptime',
    description: 'Up time and other bot information.',
    execute(client, message) {
        let allSeconds = (client.uptime / 1000);
        let days = Math.floor(allSeconds / 86400);
        let hours = Math.floor(allSeconds / 3600);
        allSeconds %= 3600;
        let minutes = Math.floor(allSeconds / 60);
        let seconds = Math.floor(allSeconds % 60);
        let milliseconds = (allSeconds % 60) / 10;
        message.channel.send({
            embed: {
                "title": "Bot Lifetime",
                "description": `${client.user} has been online for ${days} days, ${hours} hours, ${minutes} minutes, ${seconds} seconds, and ${milliseconds} ms.`,
                "fields": [
                    {
                        "name": "Time",
                        "value": `**${days}:${hours}:${minutes};${seconds};${milliseconds}**`
                    }
                ]
            }
        });
    }
}