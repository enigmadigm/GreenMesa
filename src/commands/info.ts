
import apppkg from '../../package.json';
import { Command } from "src/gm";
//import { getGlobalSetting } from "../dbmanager";

export const command: Command = {
    name: 'info',
    description: {
        short: "get information about the bot",
        long: "Get various information about the bot and what it has to offer."
    },
    async execute(client, message) {
        try {
            message.channel.send({
                embed: {
                    color: await client.database.getColor("info"),
                    title: "GreenMesa Info",
                    url: "https://enigmadigm.com/apps/greenmesa/help",
                    description: "[Use the dashboard](https://stratum.hauge.rocks/dash) to intuitively control the bot.\n\nthis is a bot, it does stuff, stuff listed in `help`\nthis bot will be punished if it lets down its masters",
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
                            "name": "Shard",
                            "value": `Current: ${message.guild?.shardID || client.shard?.ids[0]}\nTotal: ${client.shard?.count}`,
                            "inline": true
                        },
                        {
                            "name": "Resources",
                            "value": `\`\`\`prolog\n${client.specials?.memoryUsage()}\n\`\`\``
                        }
                    ],
                    footer: {
                        icon_url: client.user?.avatarURL() || undefined,
                        text: `Information / Información / معلومات | 👀 ${message.gprefix}uptime`
                    }
                }
            });

        } catch (error) {
            xlg.error(error);
            await client.specials?.sendError(message.channel);
            return false;
        }
    }
}

