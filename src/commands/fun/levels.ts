//import { getGlobalSetting, getGuildSetting, getXP, checkForLevelRoles } from "../dbmanager";
import xlg from "../../xlogger";
//const moment = require("moment");
import { permLevels } from '../../permissions';
import { Command } from "src/gm";

export const command: Command = {
    name: "levels",
    description: {
        short: "see level roles for the current server",
        long: 'See all of the level roles (that are awarded for chatting) that are available on this server. These roles are editable by mods using the settings command.'
    },
    aliases: ['lvls', 'levelslist'],
    args: false,
    permLevel: permLevels.member,
    guildOnly: true,
    cooldown: 5,
    async execute(client, message) {
        try {
            if (!message.guild || !message.member) return;
            const warn_embed_color = await client.database.getColor("warn_embed_color");
            const levellingEnabled = await client.database.getGuildSetting(message.guild, 'xp_levels');
            if (!levellingEnabled || levellingEnabled.value === 'disabled') {
                message.channel.send({
                    embed: {
                        color: warn_embed_color,
                        description: `Levelling is disabled. Enable by sending \`settings levels enable\`.`
                    }
                });
                return;
            }
            const levelRows = await client.database.checkForLevelRoles(message.guild);
            const targetRow = await client.database.getXP(message.member);
            if (!levelRows || !targetRow) {
                client.specials?.sendError(message.channel);
                return;
            }
            const targetLevel = targetRow.level;
            let alreadyAbove = false;
            const joinedLevels = levelRows.map((lvl) => {
                let curr = false;
                if (!alreadyAbove && targetLevel >= lvl.level) {
                    curr = true;
                    alreadyAbove = true;
                }
                return `${curr ? '🔸' : '🔹'}**${lvl.level}**: ${message.guild?.roles.cache.find(ro => ro.id === lvl.roleid) || 'no role found'}${curr ? ' < you' : ''}`
            });

            const info_embed_color = await client.database.getColor("info");
            message.channel.send({
                embed: {
                    color: info_embed_color,
                    title: 'Level Roles',
                    description: `Each level and its role:\n${joinedLevels.join("\n")}`
                }
            });
        } catch (error) {
            xlg.error(error);
            await client.specials?.sendError(message.channel);
            return false;
        }
    }
}

