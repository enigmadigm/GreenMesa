// NOTE: This whole xp system is in long-term development and needs work. The updates will probably come with a web console if there ever is one.
import { Command } from "src/gm";
import xlg from "../../xlogger";

export const command: Command = {
    name: 'xp',
    description: {
        short: "get someone's xp stats",
        long: 'Get the amount of xp someone has. Earn xp by sending any message in a guild with this bot. Points can only be generated once per minute for spam protection.'
    },
    aliases: ['exp', 'orbs', 'level', 'points'],
    usage: "[other user]",
    guildOnly: true,
    async execute(client, message, args) {
        try {
            const target = message.mentions.members?.first() || ((message.guild && message.guild.available) ? message.guild.members.cache.get(args[0]) : false) || message.member || false;
            if (!target) {
                message.channel.send('Invalid target.');
                return;
            }

            const rows = await client.database.getXP(target);
            const warn_embed_color = await client.database.getColor("warn_embed_color");
            const info_embed_color = await client.database.getColor("info");
            const xpTypeGlobal = await client.database.getGlobalSetting('xp_type');

            if (!rows) {
                message.channel.send({
                    embed: {
                        "title": "This user has no XP on record.",
                        "description": "To gain XP send messages in chat.",
                        "color": warn_embed_color || 16750899,
                        "footer": {
                            "text": this.name
                        }
                    }
                });
                return;
            }

            message.channel.send({
                embed: {
                    description: `${target} currently has ${rows.xp} ${(xpTypeGlobal) ? xpTypeGlobal.value : 'xp'} **⁛** level ${rows.level}`,
                    color: info_embed_color || 0
                }
            });
        } catch (error) {
            xlg.error(error);
            await client.specials?.sendError(message.channel);
            return false;
        }
    }
}

