const xlg = require("../xlogger");
const { getGuildSetting, editGuildSetting, getGlobalSetting } = require("../dbmanager");
const { sendModerationDisabled } = require('../utils/specialmsgs');
const { permLevels } = require('../permissions');

module.exports = {
    name: 'disable',
    aliases: ['disablecmd'],
    description: {
        short: 'disable a command',
        long: 'Use to disable a command in the current server.'
    },
    usage: "[command name]",
    args: true,
    guildOnly: true,
    category: 'moderation',
    permLevel: permLevels.admin,
    async execute(client, message, args) {
        let moderationEnabled = await getGuildSetting(message.guild, 'all_moderation');
        if (!moderationEnabled[0] || moderationEnabled[0].value === 'disabled') {
            return sendModerationDisabled(message.channel);
        }

        const commandName = args[0].toLowerCase();
        const command = message.client.commands.get(commandName) || message.client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
        
        if (!command) return message.channel.send(`No command with name or alias \`${commandName}\``).catch(xlg.error);

        if (command.name === "enable" || command.name === "disable") {
            await message.channel.send({
                embed: {
                    color: parseInt((await getGlobalSetting("fail_embed_color"))[0].value, 10),
                    description: `Cannot toggle \` enable \` or \` disable \``,
                    footer: {
                        text: `command toggle`
                    }
                }
            }).catch(console.error);
            return;
        }
        
        let result = await getGuildSetting(message.guild, `${command.name}_toggle`);
        if (!result[0] || (result[0].value && result[0].value === "enable")) {
            let result = await editGuildSetting(message.guild, `${command.name}_toggle`, "disable");
            if (!result || result.affectedRows < 1) return await message.channel.send({
                embed: {
                    color: parseInt((await getGlobalSetting("fail_embed_color"))[0].value, 10),
                    description: `Failed to disable command`,
                    footer: {
                        text: `command toggle`
                    }
                }
            }).catch(console.error);
            await message.channel.send({
                embed: {
                    color: parseInt((await getGlobalSetting("success_embed_color"))[0].value, 10),
                    description: `Command \` ${command.name} \` toggled to **disabled**`,
                    footer: {
                        text: `command toggle`
                    }
                }
            }).catch(console.error);
            return;
        }
        if (result[0].value && result[0].value == "disable") {
            await message.channel.send({
                embed: {
                    color: parseInt((await getGlobalSetting("warn_embed_color"))[0].value, 10),
                    description: `Command \` ${command.name} \` already disabled`,
                    footer: {
                        text: `command toggle`
                    }
                }
            }).catch(console.error);
        }
    }
}