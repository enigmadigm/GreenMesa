import { getGlobalSetting, getGuildSetting, getXP, checkForLevelRoles } from "../dbmanager";
import xlg from "../xlogger";
//const moment = require("moment");
import { permLevels } from '../permissions';

module.exports = {
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
    category: 'fun',
    async execute(client, message) {
        const levellingEnabled = await getGuildSetting(message.guild, 'xp_levels');
        const warn_embed_color = parseInt((await getGlobalSetting("warn_embed_color") || ['7322774'])[0].value, 10);
        if (!levellingEnabled || levellingEnabled[0].value === 'disabled') {
            return message.channel.send({
                embed: {
                    color: warn_embed_color,
                    description: `Levelling is disabled. Enable by sending \`settings levels enable\`.`
                }
            });
        }
        const levelRows = await checkForLevelRoles(message.guild);
        const targetRow = await getXP(message.member);
        const targetLevel = targetRow[0] ? targetRow[0].level : 0;
        let alreadyAbove = false;
        const joinedLevels = levelRows.map((lvl) => {
            let curr = false;
            if (!alreadyAbove && targetLevel >= lvl.level) {
                curr = true;
                alreadyAbove = true;
            }
            return `${curr ? '🔸' : '🔹'}**${lvl.level}**: ${message.guild.roles.cache.find(ro => ro.id = lvl.roleid) || 'no role found'}${curr ? ' < you' : ''}`
        });
        
        const info_embed_color = parseInt((await getGlobalSetting("info_embed_color") || ['7322774'])[0].value, 10);
        message.channel.send({
            embed: {
                color: info_embed_color,
                title: 'Level Roles',
                description: `Each level and its role:\n${joinedLevels.join("\n")}`
            }
        }).catch(xlg.error);
    }
}