const { getGlobalSetting, getGuildSetting, getXP, checkForLevelRoles } = require("../dbmanager");
const xlg = require("../xlogger");
//const moment = require("moment");
const { permLevels } = require('../permissions');

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
    async execute(client, message) {
        let levellingEnabled = await getGuildSetting(message.guild, 'xp_levels');
        let warn_embed_color = parseInt((await getGlobalSetting("warn_embed_color"))[0].value, 10);
        if (!levellingEnabled || levellingEnabled[0].value === 'disabled') {
            return message.channel.send({
                embed: {
                    color: warn_embed_color,
                    description: `Levelling is disabled. Enable with \`mod levels enable\`.`
                }
            });
        }
        let levelRows = await checkForLevelRoles(message.guild);
        let targetRow = await getXP(message.guild.members.cache.get('748759691319836702'));
        let targetLevel = targetRow[0] ? targetRow[0].level : 0;
        let alreadyAbove = false;
        let joinedLevels = levelRows.map((lvl) => {
            let yes = false;
            if (!alreadyAbove && targetLevel > lvl.level) {
                yes = true;
                alreadyAbove = true;
            }
            return `${yes ? '🔸' : '🔹'}**${lvl.level}**: ${message.guild.roles.cache.find(ro => ro.id = lvl.roleid) || 'no role found'}${yes ? ' < you' : ''}`
        });
        
        let info_embed_color = parseInt((await getGlobalSetting("info_embed_color"))[0].value, 10);
        message.channel.send({
            embed: {
                color: info_embed_color,
                title: 'Level Roles',
                description: `Each level and its role:\n${joinedLevels.join("\n")}`
            }
        }).catch(xlg.error);
    }
}