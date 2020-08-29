const { getGlobalSetting, getGuildSetting, editGuildSetting } = require("../dbmanager");
const xlg = require("../xlogger");
//const moment = require("moment");
const { permLevels } = require('../permissions');
const { stringToChannel } = require('../utils/parsers');

module.exports = {
    name: "moderation",
    description: {
        short: "manage mod features",
        long: 'Manage moderation features and server staff. This command is at the beginning of the development cycle.'
    },
    aliases: ['mod'],
    usage: "<enable/disable/admins/moderators/case-logging>",
    args: false,
    permLevel: permLevels.admin,
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
        if (!args.length) {
            return message.channel.send({
                embed: {
                    title: "Server Moderation Management",
                    description: "This command acts as the portal to configure the bot's moderation and management features to your needs. It also allows you to set up the server staff.",
                    color: info_embed_color || 0,
                    footer: {
                        text: "Server Management"
                    }
                }
            }).catch(xlg.error);
        }
        var argIndex = 0;
        switch (args[argIndex]) {
            case 'enable': {
                argIndex++;
                let moderationEnabled = await getGuildSetting(message.guild, 'all_moderation');

                if (moderationEnabled[0].value === 'enabled') {
                    return message.channel.send('Moderation is already **enabled**.');
                }
                let editResult = await editGuildSetting(message.guild, 'all_moderation', 'enabled');
                if (editResult.affectedRows == 1) {
                    message.channel.send('Moderation **enabled**!');
                } else {
                    message.channel.send('Failed to enable moderation.')
                }
                break;
            }
            case 'disable': {
                argIndex++;
                let moderationEnabled = await getGuildSetting(message.guild, 'all_moderation');

                if (moderationEnabled[0].value === 'disabled') {
                    return message.channel.send('Moderation is already **disabled**.')
                }
                let editResult = await editGuildSetting(message.guild, 'all_moderation', 'disabled');
                if (editResult.affectedRows == 1) {
                    message.channel.send('Moderation **disabled**!');
                } else {
                    message.channel.send('Failed to disable moderation.')
                }
                break;
            }
            case 'admins': {
                break;
            }
            case 'moderators': {
                break;
            }
            case 'case-logging': {
                break;
            }
            case 'xp-levelling':
            case 'levels':
            case 'xp-levels': {
                argIndex++;
                let levellingEnabled = await getGuildSetting(message.guild, 'xp_levels');
                if (!args[argIndex]) {
                    message.channel.send(`XP levelling is currently ${(levellingEnabled[0].value === 'enabled') ? 'enabled' : 'disabled'}.${(levellingEnabled[0].value === 'disabled') ? ' Enable by appending `enable` to the command.' : ' Disable by appending `disable` to the command.'}`).catch(xlg.error);
                    return false;
                }
                switch (args[argIndex]) {
                    case 'enable': {
                        if (levellingEnabled[0].value === 'enabled') {
                            return message.channel.send('Levels are already **enabled**.');
                        }
                        let editResult = await editGuildSetting(message.guild, 'xp_levels', 'enabled');
                        if (editResult.affectedRows == 1) {
                            message.channel.send('Levelling **enabled**!').catch(console.error);
                        } else {
                            message.channel.send('Failed to enable levelling.').catch(console.error);
                        }
                        break;
                    }
                    case 'disable': {
                        if (levellingEnabled[0].value === 'disabled') {
                            return message.channel.send('Levels are already **disabled**.').catch(console.error);
                        }
                        let editResult = await editGuildSetting(message.guild, 'xp_levels', 'disabled');
                        if (editResult.affectedRows == 1) {
                            message.channel.send('Levelling **disabled**!').catch(console.error);
                        } else {
                            message.channel.send('Failed to disable levelling.').catch(console.error);
                        }
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
                    message.channel.send(`The server log is currently ${(slogChannel) ? `**enabled** in ${slogChannel}` : '**disabled**'}.${(!slogChannel) ? ' Enable by appending the desired channel\'s ID to the command.' : ' Disable by appending `disable` to the command.'}`).catch(xlg.error);
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