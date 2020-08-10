const apppkg = require('../package.json');
const config = require('../auth.json');

module.exports = {
    name: 'info',
    description: 'Get info on the bot.',
    execute(client, message) {
        message.channel.send({
            embed: {
                color: 3447003,
                title: "GreenMesa Info",
                url: "https://enigmadigm.com/apps/greenmesa/help",
                fields: [
                    {
                        "name": "Architect",
                        "value": "ComradeRooskie#6969",
                        "inline": true
                    },
                    {
                        "name": "Servers",
                        "value": client.guilds.cache.size,
                        "inline": true
                    },
                    {
                        "name": "Vote!",
                        "value": "[d.b.l](https://top.gg/bot/560223567967551519)",
                        "inline": true
                    },
                    {
                        "name": "Invite",
                        "value": `\`${config.prefix}invite\``,
                        "inline": true
                    },
                    {
                        "name": "Library",
                        "value": "discord.js v12",
                        "inline": true
                    },
                    {
                        "name": "Version",
                        "value": apppkg.version,
                        "inline": true
                    },
                    {
                        "name": "Served",
                        "value": "[AA](https://atlasatmos.net)",
                        "inline": true
                    },
                    {
                        "name": "Repo",
                        "value": "[github](https://github.com/enigmadigm/greenmesa) <:octocat_logo:663869429976662057>",
                        "inline": true
                    },
                ],
                footer: {
                    icon_url: client.user.avatarURL,
                    text: `Information / Información / معلومات | see ${config.prefix}uptime`
                }
            }
        });

    }
}
