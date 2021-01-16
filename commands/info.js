const xlg = require("../xlogger");
const apppkg = require('../package.json');
const { getGlobalSetting } = require("../dbmanager");

module.exports = {
    name: 'info',
    description: 'Get info on the bot.',
    async execute(client, message) {
        try {
            message.channel.send({
                embed: {
                    color: parseInt((await getGlobalSetting("info_embed_color") || ['7322774'])[0].value, 10) || 3447003,
                    title: "GreenMesa Info",
                    url: "https://enigmadigm.com/apps/greenmesa/help",
                    description: "this is a bot, it does stuff, stuff listed in `help`\nthis bot will be punished if it lets down its masters",
                    fields: [
                        {
                            "name": "Architect",
                            "value": "ComradeRooskie#6969",
                            "inline": true
                        },
                        {
                            "name": "Vote!",
                            "value": "[d.b.l](https://top.gg/bot/560223567967551519)",
                            "inline": true
                        },
                        {
                            "name": "Invite",
                            "value": `\`${message.gprefix}invite\``,
                            "inline": true
                        },
                        {
                            "name": "Library",
                            "value": "discord.js",
                            "inline": true
                        },
                        {
                            "name": "Version",
                            "value": apppkg.version,
                            "inline": true
                        },
                        {
                            "name": "Served by",
                            "value": "🚫",
                            "inline": true
                        },
                        {
                            "name": "Website",
                            "value": "[stratum.hauge.rocks](https://stratum.hauge.rocks)",
                            "inline": true
                        },
                        {
                            "name": "Repo",
                            "value": "🚫",
                            "inline": true
                        },
                        {
                            "name": "Resources",
                            "value": `\`\`\`prolog\n${client.specials.memoryUsage()}\n\`\`\``
                        }
                    ],
                    footer: {
                        icon_url: client.user.avatarURL,
                        text: `Information / Información / معلومات | 👀 ${message.gprefix}uptime`
                    }
                }
            });

        } catch (error) {
            xlg.error(error);
            await client.specials.sendError(message.channel);
            return false;
        }
    }
}
