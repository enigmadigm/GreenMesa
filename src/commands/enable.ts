import xlg from "../xlogger";
//import { getGuildSetting, editGuildSetting, getGlobalSetting } from "../dbmanager";
import { permLevels } from '../permissions';
import { Command } from "src/gm";

const command: Command = {
    name: 'enable',
    aliases: ['enablecmd'],
    description: {
        short: 'enable a command',
        long: 'Use to enable a command in the current server.'
    },
    usage: "[command name]",
    args: true,
    guildOnly: true,
    category: 'moderation',
    permLevel: permLevels.admin,
    async execute(client, message, args) {
        try {
            if (!message.guild) return;
            /*let moderationEnabled = await getGuildSetting(message.guild, 'all_moderation');
            if (!moderationEnabled[0] || moderationEnabled[0].value === 'disabled') {
                return client.specials.sendModerationDisabled(message.channel);
            }*/

            const commandName = args[0].toLowerCase();
            const command =client.commands?.get(commandName) || client.commands?.find(cmd => !!(cmd.aliases && cmd.aliases.includes(commandName)));
            
            if (!command) {
                await message.channel.send(`No command with name or alias \`${commandName}\``);
                return;
            }

            if (command.name === "enable" || command.name === "disable") {
                await message.channel.send({
                    embed: {
                        color: parseInt((await getGlobalSetting("fail_embed_color"))[0].value, 10),
                        description: `Cannot toggle \` enable \` or \` disable \``,
                        footer: {
                            text: `command toggle`
                        }
                    }
                });
                return;
            }
            
            const result = await client.database?.getGuildSetting(message.guild, `${command.name}_toggle`);
            if (!result || (result.value && result.value === "disable")) {
                const result = await client.database?.editGuildSetting(message.guild, `${command.name}_toggle`, "enable");
                if (!result || result.affectedRows < 1) {
                    await message.channel.send({
                        embed: {
                            color: await client.database?.getColor("fail_embed_color"),
                            description: `Failed to enable command`,
                            footer: {
                                text: `command toggle`
                            }
                        }
                    });
                    return;
                }
                await message.channel.send({
                    embed: {
                        color: await client.database?.getColor("success_embed_color"),
                        description: `Command \` ${command.name} \` toggled to **enabled**`,
                        footer: {
                            text: `command toggle`
                        }
                    }
                });
                return;
            }
            if (result.value && result.value == "enable") {
                await message.channel.send({
                    embed: {
                        color: await client.database?.getColor("warn_embed_color"),
                        description: `Command \` ${command.name} \` already enabled`,
                        footer: {
                            text: `command toggle`
                        }
                    }
                });
            }
        } catch (error) {
            xlg.error(error);
            await client.specials?.sendError(message.channel);
            return false;
        }
    }
}

export default command;