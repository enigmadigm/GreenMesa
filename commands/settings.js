const { getGlobalSetting, getGuildSetting, editGuildSetting, checkForLevelRoles, setLevelRole, deleteAllLevelRoles } = require("../dbmanager");
const xlg = require("../xlogger");
//const moment = require("moment");
const { permLevels } = require('../permissions');
const { stringToChannel, stringToRole } = require('../utils/parsers');

module.exports = {
    name: "settings",
    description: {
        short: "manage the server settings for the bot",
        long: 'Use to manage many of the server config settings. You can send this command without arguments to see the various options available. Send most options without arguments to see them in even more detail. **In development**.'
    },
    aliases: ['set', 'server', 'mod', 'moderation'],
    usage: "[send nothing for detailed help]",
    args: false,
    permLevel: permLevels.admin,
    category: 'moderation',
    guildOnly: true,
    /**
     * 
     * @param {discord.Client} client
     * @param {object}         message
     * @param {array}          args
     * @param {object}         conn
     */
    async execute(client, message, args) {
        let fec_gs = await getGlobalSetting("fail_embed_color");
        let fail_embed_color = parseInt(fec_gs[0].value);
        let iec_gs = await getGlobalSetting("info_embed_color");
        let info_embed_color = parseInt(iec_gs[0].value);
        let sec_gs = await getGlobalSetting("success_embed_color");
        let success_embed_color = parseInt(sec_gs[0].value);
        if (!args.length) {
            return message.channel.send({
                embed: {
                    author: {
                        name: message.guild.name,
                        icon_url: message.guild.iconURL()
                    },
                    title: "Server Management",
                    description: `This command acts as the portal to configure the bot's moderation and management features to your needs.\n\n**Send one of the following commands for specific information about them.**\n\`levelroles\` set the roles rewarded for levels\n\`serverlog\` set the channel used to log server activity\n\`moderation\` (enable/disable all)\n:lock: \`case-logging\`\n:lock: \`adminrole\` set the role that gives admin powers\n:lock: \`modrole\` set the role that gives mod powers\n\n:lock: = in dev`,
                    color: info_embed_color || 0,
                    footer: {
                        text: "Server Management"
                    }
                }
            }).catch(xlg.error);
        }
        var argIndex = 0;
        switch (args[argIndex]) {
            case 'moderation': {
                argIndex++;
                let moderationEnabled = await getGuildSetting(message.guild, 'all_moderation');
                switch (args[argIndex]) {
                    case 'enable': {
                        if (moderationEnabled[0] && moderationEnabled[0].value === 'enabled') {
                            return message.channel.send('Moderation is already **enabled**.');
                        }
                        let editResult = await editGuildSetting(message.guild, 'all_moderation', 'enabled');
                        if (editResult.affectedRows == 1) {
                            message.channel.send('Moderation **enabled**!');
                        } else {
                            message.channel.send('Failed to enable moderation.');
                        }
                        break;
                    }
                    case 'disable': {
                        if (!moderationEnabled[0] || moderationEnabled[0].value === 'disabled') {
                            return message.channel.send('Moderation is already **disabled**.');
                        }
                        let editResult = await editGuildSetting(message.guild, 'all_moderation', 'disabled', true);
                        if (editResult.affectedRows == 1) {
                            message.channel.send('Moderation **disabled**!');
                        } else {
                            message.channel.send('Failed to disable moderation.');
                        }
                        break;
                    }
                    default: {
                        let moderationStatus = 'disabled';
                        if (moderationEnabled[0] && moderationEnabled[0].value === 'enabled') {
                            moderationStatus = 'enabled';
                        }
                        message.channel.send({
                            embed: {
                                color: info_embed_color,
                                description: `Server moderation in ${message.guild.name} is currently **${moderationStatus}**. Adjust this setting with \`enable\` or \`disable\``
                            }
                        })
                        break;
                    }
                }
                break;
            }
            case 'admins':
            case 'adminrole':
            case 'admininistrators': {
                message.channel.send({
                    embed: {
                        description: 'This subcommand is currently in development.'
                    }
                }).catch(xlg.error);
                break;
            }
            case 'mods':
            case 'modrole':
            case 'moderators': {
                message.channel.send({
                    embed: {
                        description: 'This subcommand is currently in development.'
                    }
                }).catch(xlg.error);
                break;
            }
            case 'case-logging': {
                message.channel.send({
                    embed: {
                        description: 'This subcommand is currently in development.'
                    }
                }).catch(xlg.error);
                break;
            }
            case 'role-rewards':
            case 'level-roles':
            case 'xp-levelling':
            case 'levels':
            case 'xp-levels': {
                argIndex++;
                let levellingEnabled = await getGuildSetting(message.guild, 'xp_levels');
                if (!args[argIndex]) {
                    message.channel.send({
                        embed: {
                            description: 'Level roles are a fun thing to add to your server. No matter the setting, when members send messages they gain xp; the more xp they have, the higher their level. If this setting is `enable`d, when they reach certain levels they will be awarded with roles. When you first enable `levels`, a preset list of roles will be created for you (view with `settings levels list`). After enabling, you may edit the roles however you wish, or add new ones.',
                            fields: [
                                {
                                    name: 'Setting',
                                    value: `XP levelling is currently ${(levellingEnabled[0] && levellingEnabled[0].value === 'enabled') ? 'enabled' : 'disabled'}.${(!levellingEnabled || levellingEnabled[0].value === 'disabled') ? ' Enable by appending `enable` to the command.' : ' Disable by appending `disable` to the command.'}`
                                },
                                {
                                    name: 'Subcommands',
                                    value: '🔹`(enable) / (disable [--forget (existing roles)])`\n🔹`list (available roles)`\n🔹`set <role> <new lvl>`\n🔹`remove <role id>`'
                                }
                            ]
                        }
                    }).catch(xlg.error);
                    return false;
                }
                switch (args[argIndex]) {
                    case 'enable': {
                        if (levellingEnabled[0] && levellingEnabled[0].value === 'enabled') {
                            return message.channel.send('Levels are already **enabled**.');
                        }
                        let rolesResult = await checkForLevelRoles(message.guild);
                        let editResult = await editGuildSetting(message.guild, 'xp_levels', 'enabled');
                        if (editResult.affectedRows == 1 && rolesResult.length > 0) {
                            message.channel.send('Levelling **enabled**!').catch(console.error);
                        } else {
                            message.channel.send('Failed to enable levelling.').catch(console.error);
                        }
                        break;
                    }
                    case 'disable': {
                        argIndex++;
                        if (!levellingEnabled || levellingEnabled[0].value === 'disabled') {
                            return message.channel.send('Levels are already **disabled**.').catch(console.error);
                        }
                        let editResult = await editGuildSetting(message.guild, 'xp_levels', 'disabled');
                        let massDeletionResult = true;
                        if (args[argIndex] == '--forget') {
                            massDeletionResult = await deleteAllLevelRoles(message.guild);
                            if (!massDeletionResult || massDeletionResult.affectedRows == 0) {
                                massDeletionResult = false;
                            }
                        }
                        if (editResult.affectedRows == 1 && massDeletionResult) {
                            message.channel.send('Levelling **disabled**!').catch(console.error);
                        } else {
                            message.channel.send('Failed to disable levelling.').catch(console.error);
                        }
                        break;
                    }
                    case 'ls':
                    case 'list': {
                        if (!levellingEnabled || levellingEnabled[0].value === 'disabled') {
                            return message.channel.send(`Levelling is disabled. Enable with \`mod levels enable\`.`);
                        }
                        let levelRows = await checkForLevelRoles(message.guild);
                        let joinedLevels = levelRows.map(lvl => `🔹**${lvl.level}**: ${message.guild.roles.cache.find(ro => ro.id = lvl.roleid) || 'sorry no role'}`);
                        message.channel.send({
                            embed: {
                                color: info_embed_color,
                                title: 'Level Roles',
                                description: `Each level and its role:\n${joinedLevels.join("\n")}`
                            }
                        }).catch(xlg.error);
                        break;
                    }
                    case 'edit':
                    case 'set': {
                        argIndex++;
                        if (!args[argIndex]) return message.channel.send('Please provide: `<the role @ or id>, <the new level>`');
                        let role = stringToRole(message.guild, args[argIndex]);
                        if (!role) return message.channel.send('Please send a valid role.');
                        argIndex++;
                        let newlevel = (args[argIndex] && args[argIndex].length < 6) ? parseInt(args[argIndex]) : undefined;
                        if (!newlevel || isNaN(newlevel) || newlevel > 1000) return message.channel.send('Please send a valid level < 1001.');
                        let result = await setLevelRole(newlevel, message.guild, role);
                        if (!result || result !== 1) {
                            xlg.log('UNABLE to REGISTER role');
                            return message.channel.send('The role could not be registered.');
                        }
                        message.channel.send({
                            embed: {
                                color: success_embed_color,
                                description: `Done. ${role} will now be rewarded at level ${newlevel}.`
                            }
                        }).catch(xlg.error);
                        break;
                    }
                    case 'rem':
                    case 'rm':
                    case 'remove': {
                        argIndex++;
                        if (!args[argIndex]) return message.channel.send('Please provide a valid role to deactivate. Users that have it will keep it.');
                        let role = stringToRole(message.guild, args[argIndex]);
                        if (!role) return message.channel.send('Please send a valid role.');
                        let roleEntry = await setLevelRole(null, message.guild, role);
                        if (!roleEntry) {
                            return message.channel.send({
                                embed: {
                                    color: fail_embed_color,
                                    description: `${role} is not a reward role. Please send a role that is being rewarded.`
                                }
                            }).catch(xlg.error);
                        }
                        let result = await setLevelRole(null, message.guild, role, true);
                        if (!result || result !== 1) {
                            xlg.log('UNABLE to DELETE role');
                            return message.channel.send('The role could not be removed.');
                        }
                        message.channel.send({
                            embed: {
                                color: success_embed_color,
                                description: `Done. Members will no longer be rewarded ${role}.`
                            }
                        }).catch(xlg.error);
                        break;
                    }
                    default:
                        break;
                }
                break;
            }
            case 'megalog':
            case 'serverlog':
            case 'mega-log':
            case 'server-log': {
                argIndex++;
                let slogValue = await getGuildSetting(message.guild, 'server_log');
                let slogChannel = slogValue[0] && slogValue[0].value ? stringToChannel(message.guild, slogValue[0].value) : null;
                if (!args[argIndex]) {
                    message.channel.send({
                        embed: {
                            description: `The server-log is a useful moderation feature that is still being developed. When enabled, most events that occur throughout the server will be logged in the specified channel.\nSome supported events include: member joins/leaves, message deletion (+ purging), channels, roles, and more.\n**note:** \`purge\` command logs an option to view the deleted messages when server-log enabled`,
                            fields: [{
                                    name: 'Setting',
                                    value: `The server log is currently ${(slogChannel) ? `**enabled** in ${slogChannel}` : '**disabled**'}.${(!slogChannel) ? ' Enable by appending the desired channel\'s ID to the command.' : ' Disable by appending `disable` to the command.'}`
                                },
                                {
                                    name: 'Subcommands',
                                    value: '🔹`<log channel id (to enable or change)>`\n🔹`<disable>`'
                                }
                            ]
                        }
                    }).catch(xlg.error);
                    return false;
                }
                switch (args[argIndex]) {
                    case 'disable': {
                        if (!slogValue) return message.channel.send('The server log is already disabled.').catch(console.error);
                        let result = await editGuildSetting(message.guild, 'server_log', null, true);
                        if (result.affectedRows === 1) {
                            message.channel.send('Server log has been disabled.').catch(xlg.error);
                        }
                        break;
                    }
                    default: {
                        let newSlogChannel = stringToChannel(message.guild, args[argIndex]);
                        if (!newSlogChannel) {
                            message.channel.send('Coudn\'t find specified channel').catch(console.error);
                            return false;
                        }
                        if (newSlogChannel.type !== 'text') {
                            message.channel.send('Specified channel isn\'t a text channel');
                            return false;
                        }
                        if (slogChannel && newSlogChannel.id === slogChannel.id) {
                            message.channel.send('Server log **already set** to specified channel.')
                            return false;
                        }
                        let result = await editGuildSetting(message.guild, 'server_log', newSlogChannel.id)
                        if (result.affectedRows === 1) {
                            message.channel.send(`The megalog has been **enabled** in ${newSlogChannel}. Soon you will be able to set custom functions.`);
                        } else {
                            message.channel.send(`There has been an error.`);
                        }
                        break;
                    }
                }
                break;
            }
            default: {
                message.channel.send({
                    embed: {
                        description: `You must send a valid option.\n\`${this.usage}\``,
                        color: fail_embed_color
                    }
                }).catch(O_o => { O_o });
                break;
            }
        }
    }
}