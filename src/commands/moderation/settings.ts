
import { permLevels } from '../../permissions';
import { stringToChannel, stringToRole } from '../../utils/parsers';
import { Channel, Role } from "discord.js";
import { Command } from "src/gm";
import { getDashboardLink } from "../../utils/specials";

export const command: Command = {
    name: "settings",
    description: {
        short: "manage the server settings for the bot",
        long: 'Use to manage many of the server config settings. You can send this command without arguments to see the various options available. Send most options without arguments to see them in even more detail.'
    },
    aliases: ['set'],
    usage: "[send nothing for detailed help]",
    args: false,
    permLevel: permLevels.admin,
    guildOnly: true,
    async execute(client, message, args) {
        try {
            if (!message.guild) return;
            // const fail_embed_color = await client.database.getColor("fail");
            const info_embed_color = await client.database.getColor("info");
            const success_embed_color = await client.database.getColor("success");
            if (!args.length) {
                message.channel.send({
                    embed: {
                        author: {
                            name: message.guild.name,
                            iconURL: message.guild.iconURL() || ""
                        },
                        title: "Server Management",
                        description: `This command acts as the portal to configure the bot's moderation and management features to your needs. *Some settings are not located here and have separate commands.* **Please visit the [dashboard](${getDashboardLink()}) for further configuration.**

**Send one of the following sub-commands for further details:**
- \`levelroles\` set the roles rewarded for levels
- \`serverlog\` configure how the bot logs server activity for you
- \`moderation\` enable or disable (default) all moderation features
- \`modrole\` set the role that gives mod powers
- \`accessmsg\` enable or disable (default) the 'lacking perms' message
- \`modlog\` log moderation events in an organized system

\\🔒 = in dev`,
                        color: info_embed_color,
                        footer: {
                            text: `${message.author.tag}`
                        }
                    }
                });
                return;
            }
            let argIndex = 0;
            switch (args[argIndex]) {
                case 'moderation': {
                    argIndex++;
                    const moderationEnabled = await client.database.getGuildSetting(message.guild, 'all_moderation');
                    switch (args[argIndex]) {
                        case 'enable': {
                            if (moderationEnabled && moderationEnabled.value === 'enabled') {
                                message.channel.send('Moderation is already **enabled**.');
                                return;
                            }
                            const editResult = await client.database.editGuildSetting(message.guild, 'all_moderation', 'enabled');
                            if (editResult && editResult.affectedRows == 1) {
                                message.channel.send('Moderation **enabled**!');
                            } else {
                                message.channel.send('Failed to enable moderation.');
                            }
                            break;
                        }
                        case 'disable': {
                            if (!moderationEnabled || moderationEnabled.value === 'disabled') {
                                message.channel.send('Moderation is already **disabled**.');
                                return;
                            }
                            const editResult = await client.database.editGuildSetting(message.guild, 'all_moderation', 'disabled', true);
                            if (editResult && editResult.affectedRows == 1) {
                                message.channel.send('Moderation **disabled**!');
                            } else {
                                message.channel.send('Failed to disable moderation.');
                            }
                            break;
                        }
                        default: {
                            let moderationStatus = 'disabled';
                            if (moderationEnabled && moderationEnabled.value === 'enabled') {
                                moderationStatus = 'enabled';
                            }
                            message.channel.send({
                                embed: {
                                    color: info_embed_color,
                                    description: `Server moderation in ${message.guild.name} is currently **${moderationStatus}**.\nAdjust this setting with \`enable\` or \`disable\``
                                }
                            })
                            break;
                        }
                    }
                    break;
                }
                case 'adminrole': {
                    message.channel.send({
                        embed: {
                            description: 'This subcommand is currently in development.'
                        }
                    });
                    break;
                }
                case 'rolerewards':
                case 'levelroles':
                case 'levelling':
                case 'levels': {
                    argIndex++;
                    const levellingEnabled = await client.database.getGuildSetting(message.guild, 'xp_levels');
                    if (!args[argIndex]) {
                        message.channel.send({
                            embed: {
                                description: 'Level roles are a fun thing to add to your server. No matter the setting, when members send messages they gain xp; the more xp they have, the higher their level. If this setting is `enable`d, when they reach certain levels they will be awarded with roles. When you first enable `levels`, a preset list of roles will be created for you (view with `settings levels list`). After enabling, you may edit the roles however you wish, or add new ones.',
                                fields: [
                                    {
                                        name: 'Setting',
                                        value: `XP levelling is currently ${(levellingEnabled && levellingEnabled.value === 'enabled') ? 'enabled' : 'disabled'}.${(!levellingEnabled || levellingEnabled.value === 'disabled') ? ' Enable by appending `enable` to the command.' : ' Disable by appending `disable` to the command.'}`
                                    },
                                    {
                                        name: 'Subcommands',
                                        value: '🔹`(enable) / (disable [--forget (existing roles)])`\n🔹`list (available roles)`\n🔹`set <role> <new lvl>`\n🔹`remove <role id>`'
                                    }
                                ]
                            }
                        });
                        return false;
                    }
                    switch (args[argIndex]) {
                        case 'enable': {
                            if (levellingEnabled && levellingEnabled.value === 'enabled') {
                                message.channel.send('Levels are already **enabled**.');
                                return;
                            }
                            const rolesResult = await client.database.checkForLevelRoles(message.guild);
                            const editResult = await client.database.editGuildSetting(message.guild, 'xp_levels', 'enabled');
                            if (editResult && editResult.affectedRows == 1 && rolesResult && rolesResult.length > 0) {
                                message.channel.send('Levelling **enabled**!');
                            } else {
                                message.channel.send('Failed to enable levelling.');
                            }
                            break;
                        }
                        case 'disable': {
                            argIndex++;
                            if (!levellingEnabled || levellingEnabled.value === 'disabled') {
                                message.channel.send('Levels are already **disabled**.');
                                return;
                            }
                            const editResult = await client.database.editGuildSetting(message.guild, 'xp_levels', 'disabled');
                            let massDeletionResult = true;
                            if (args[argIndex] == '--forget') {
                                const massdeletion = await client.database.deleteAllLevelRoles(message.guild)
                                if (!massdeletion || massdeletion.affectedRows == 0) {
                                    massDeletionResult = false;
                                }
                            }
                            if (editResult && editResult.affectedRows == 1 && massDeletionResult) {
                                message.channel.send('Levelling **disabled**!');
                            } else {
                                message.channel.send('Failed to disable levelling.');
                                //client.specials?.sendError(message.channel, "")
                            }
                            break;
                        }
                        case 'ls':
                        case 'list': {
                            if (!levellingEnabled || levellingEnabled.value === 'disabled') {
                                message.channel.send(`Levelling is disabled. Enable with \`mod levels enable\`.`);
                                return;
                            }
                            const levelRows = await client.database.checkForLevelRoles(message.guild);
                            if (!levelRows) {
                                throw new Error();
                            }
                            const joinedLevels = levelRows.map(lvl => `🔹**${lvl.level}**: ${message.guild?.roles.cache.find(ro => ro.id == lvl.roleid) || 'sorry no role'}`);
                            message.channel.send({
                                embed: {
                                    color: info_embed_color,
                                    title: 'Level Roles',
                                    description: `Each level and its role:\n${joinedLevels.join("\n")}`
                                }
                            });
                            break;
                        }
                        case 'edit':
                        case 'set': {
                            argIndex++;
                            if (!args[argIndex]) {
                                message.channel.send('Please provide: `<the role @ or id>, <the new level>`');
                                return;
                            }
                            const role = stringToRole(message.guild, args[argIndex]);
                            if (!role || typeof role === "string") {
                                message.channel.send('Please send a valid role.');
                                return;
                            }
                            argIndex++;
                            const newlevel = (args[argIndex] && args[argIndex].length < 6) ? parseInt(args[argIndex]) : undefined;
                            if (!newlevel || isNaN(newlevel) || newlevel > 1000) {
                                message.channel.send('Please send a valid level < 1001.');
                                return;
                            }
                            const result = await client.database.setLevelRole(newlevel, message.guild, role);
                            if (!result || result !== 1) {
                                xlg.log('UNABLE to REGISTER role');
                                message.channel.send('The role could not be registered.');
                                return;
                            }
                            message.channel.send({
                                embed: {
                                    color: success_embed_color,
                                    description: `Done. ${role} will now be rewarded at level ${newlevel}.`
                                }
                            });
                            break;
                        }
                        case 'rem':
                        case 'rm':
                        case 'remove': {
                            argIndex++;
                            if (!args[argIndex]) {
                                message.channel.send('Please provide a valid role to deactivate. Users that have it will keep it.');
                                return;
                            }
                            const role = stringToRole(message.guild, args[argIndex]);
                            if (!role || typeof role === "string") {
                                message.channel.send('Please send a valid role.');
                                return;
                            }
                            const roleEntry = await client.database.setLevelRole(null, message.guild, role);
                            if (!roleEntry) {
                                client.specials?.sendError(message.channel, `${role} is not a reward role. Please send a role that is being rewarded.`)
                                return;
                            }
                            const result = await client.database.setLevelRole(null, message.guild, role, true);
                            if (!result || result !== 1) {
                                //xlg.log('UNABLE to DELETE role');
                                message.channel.send('The role could not be removed.');
                                return;
                            }
                            message.channel.send({
                                embed: {
                                    color: success_embed_color,
                                    description: `Done. Members will no longer be rewarded ${role}.`
                                }
                            });
                            break;
                        }
                        default:
                            break;
                    }
                    break;
                }
                case 'megalog':
                case 'serverlog': {
                    await message.channel.send({
                        embed: {
                            color: await client.database.getColor("info"),
                            description: `Go to the [dashboard](${getDashboardLink(message.guild.id, "serverlog")}) to configure the serverlog.\nThe process was simplified by moving it to the dashboard.`,
                        }
                    });
                    /*argIndex++;
                    const slogValue = await client.database.getGuildSetting(message.guild, 'server_log');
                    const slogChannel = slogValue && slogValue.value ? stringToChannel(message.guild, slogValue.value) : null;
                    if (!args[argIndex]) {
                        message.channel.send({
                            embed: {
                                description: `The server-log is a useful moderation feature that is always being added to. When enabled, many events that occur within the server will be logged in the specified channel.\nSome supported events include: member joins/leaves, message deletion (+ purging), channels, roles, and more.\n**note:** \`purge\` command logs an option to view the deleted messages when server-log enabled`,
                                fields: [
                                    {
                                        name: 'Setting',
                                        value: `The server log is currently ${(slogChannel) ? `**enabled** in ${slogChannel}` : '**disabled**'}.${(!slogChannel) ? ' Enable by appending the desired channel\'s ID to the command.' : ' Disable by appending `disable` to the command.'}`
                                    },
                                    {
                                        name: 'Subcommands',
                                        value: '🔹`<log channel id (to enable or change)>`\n🔹`<disable>`'
                                    }
                                ]
                            }
                        });
                        return false;
                    }
                    switch (args[argIndex]) {
                        case 'disable': {
                            if (!slogValue) {
                                message.channel.send('The server log is already disabled.');
                                return;
                            }
                            const result = await client.database.editGuildSetting(message.guild, 'server_log', undefined, true);
                            if (result && result.affectedRows === 1) {
                                message.channel.send('Server log has been disabled.');
                            }
                            break;
                        }
                        default: {
                            const newSlogChannel = stringToChannel(message.guild, args[argIndex]);
                            if (!newSlogChannel) {
                                message.channel.send('Coudn\'t find specified channel');
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
                            const result = await client.database.editGuildSetting(message.guild, 'server_log', newSlogChannel.id)
                            if (result && result.affectedRows === 1) {
                                message.channel.send(`The megalog has been **enabled** in ${newSlogChannel}. Soon you will be able to set custom functions.`);
                            } else {
                                message.channel.send(`There has been an error.`);
                            }
                            break;
                        }
                    }*/
                    break;
                }
                case 'modrole': {
                    //await client.specials.sendError(message.channel, 'This subcommand is currently in development.');
                    argIndex++;
                    if (!args[argIndex]) {
                        const result = await client.database.getGuildSetting(message.guild, "mod_role");
                        let mrid = "";
                        if (result && result.value) {
                            mrid = result.value;
                        }
                        const mr = message.guild.roles.cache.get(mrid);
                        message.channel.send({
                            embed: {
                                color: info_embed_color,
                                description: `${mr ? `Current Modrole:\n${mr} (${mr.id})\n\n` : ""}To set/unset the modrole please provide:\n\`<role @ or id | 'reset'>\``
                            }
                        });
                        return;
                    }
                    if (args[argIndex] === "reset" && !args[argIndex + 1]) {
                        await client.database.editGuildSetting(message.guild, "mod_role", ``, true);
                        message.channel.send({
                            embed: {
                                color: success_embed_color,
                                description: `Done. The moderator role has now been reset to none.`
                            }
                        });
                        return;
                    }
                    const role = stringToRole(message.guild, args[argIndex], true, false, false);
                    if (!role || !(role instanceof Role)) {
                        client.specials?.sendError(message.channel, 'Please send a valid role.');
                        return;
                    }
                    const result = await client.database.editGuildSetting(message.guild, "mod_role", `${role.id}`)
                    if (!result) {
                        client.specials?.sendError(message.channel, 'The role could not be registered.');
                        return;
                    }
                    message.channel.send({
                        embed: {
                            color: success_embed_color,
                            description: `The modrole has been set to ${role}. Only users with ${role} will now be considered moderators.`
                        }
                    });
                    break;
                }
                case 'modlog': {
                    // await client.specials?.sendError(message.channel, 'This subcommand is currently in development.');
                    argIndex++;
                    if (!args[argIndex]) {
                        const result = await client.database.getGuildSetting(message.guild, "modlog");
                        let mrid = "";
                        if (result && result.value) {
                            mrid = result.value;
                        }
                        const mr = message.guild.channels.cache.get(mrid);
                        message.channel.send({
                            embed: {
                                color: info_embed_color,
                                description: `${mr ? `Current File Cabinet:\n${mr} (${mr.id})\n\n` : ""}To set/clear the channel please provide:\n\`<#channel | 'reset'>\``
                            }
                        });
                        return;
                    }
                    if (args[argIndex] === "reset" && !args[argIndex + 1]) {
                        await client.database.editGuildSetting(message.guild, "modlog", ``, true);
                        message.channel.send({
                            embed: {
                                color: success_embed_color,
                                description: `Done. The mod cases channel has been cleared.`
                            }
                        });
                        return;
                    }
                    const channel = stringToChannel(message.guild, args[argIndex], true, true);
                    if (!channel || !(channel instanceof Channel)) {
                        client.specials?.sendError(message.channel, 'Please send a valid channel.');
                        return;
                    }
                    const result = await client.database.editGuildSetting(message.guild, "modlog", `${channel.id}`);
                    if (!result) {
                        client.specials?.sendError(message.channel, 'The channel could not be registered.');
                        return;
                    }
                    message.channel.send({
                        embed: {
                            color: success_embed_color,
                            description: `The mod cases channel has been set to ${channel}. Mod actions will be logged there.`,
                        }
                    });
                    break;
                }
                case 'pm':
                case 'accessmsg': {
                    argIndex++;
                    const accessMessage = await client.database.getGuildSetting(message.guild, 'access_message');
                    switch (args[argIndex]) {
                        case 'enable': {
                            if (accessMessage && accessMessage.value === 'enabled') {
                                message.channel.send('Perms message is already **enabled**.');
                                return;
                            }
                            const editResult = await client.database.editGuildSetting(message.guild, 'access_message', 'enabled');
                            if (editResult && editResult.affectedRows == 1) {
                                message.channel.send('Perms message **enabled**!');
                            } else {
                                message.channel.send('Failed to enable perms message.');
                            }
                            break;
                        }
                        case 'disable': {
                            if (!accessMessage || accessMessage.value === 'disabled') {
                                message.channel.send('Perms message is already **disabled**.');
                                return;
                            }
                            const editResult = await client.database.editGuildSetting(message.guild, 'access_message', 'disabled', true);
                            if (editResult && editResult.affectedRows == 1) {
                                message.channel.send('Perms message **disabled**!');
                            } else {
                                message.channel.send('Failed to disable perms message.');
                            }
                            break;
                        }
                        default: {
                            let messageStatus = 'disabled';
                            if (accessMessage && accessMessage.value === 'enabled') {
                                messageStatus = 'enabled';
                            }
                            message.channel.send({
                                embed: {
                                    color: info_embed_color,
                                    description: `The perms access message in ${message.guild.name} is currently **${messageStatus}**.\nAdjust this setting with \`enable\` or \`disable\``
                                }
                            });
                            break;
                        }
                    }
                    break;
                }
                default: {
                    await client.specials?.sendError(message.channel, `You must send a valid option.\n\`${this.usage}\``);
                    break;
                }
            }
        } catch (error) {
            xlg.error(error);
            await client.specials?.sendError(message.channel);
            return false;
        }
    }
}
