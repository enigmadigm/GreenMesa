import xlg from "../../xlogger";
//import { getGuildSetting, editGuildSetting, getGlobalSetting } from "../dbmanager";
import { permLevels } from '../../permissions';
import { Command } from "src/gm";

export const command: Command = {
    name: 'disable',
    aliases: ['disablecmd'],
    description: {
        short: 'disable a command',
        long: 'Use to disable a command in the current server.'
    },
    usage: "[command name]",
    args: true,
    guildOnly: true,
    permLevel: permLevels.admin,
    async execute(client, message, args) {
        try {
            if (!message.guild) return;

            const searchName = args[0].toLowerCase();
            const catMatch = client.categories?.get(searchName);
            const found = client.commands?.get(searchName) || client.commands?.find(cmd => !!(cmd.aliases && cmd.aliases.includes(searchName))) || catMatch;

            if (!found) {
                await message.channel.send(`No command or group with name or alias \`${searchName}\``);
                return;
            }

            if (found.name === "enable" || found.name === "disable") {
                await message.channel.send({
                    embed: {
                        color: await client.database?.getColor("fail_embed_color"),
                        description: `Debossing \` enable \` or \` disable \` is prohibited`,
                        footer: {
                            text: `module debosser`
                        }
                    }
                });
                return;
            }

            const result = await client.database?.getGuildSetting(message.guild, `${found.name}_toggle`);
            if (!result || (result.value && result.value === "enable")) {
                const result = await client.database?.editGuildSetting(message.guild, `${found.name}_toggle`, "disable");
                if (!result || result.affectedRows < 1) {
                    await message.channel.send({
                        embed: {
                            color: await client.database?.getColor("fail_embed_color"),
                            description: `Failed to disable ${catMatch ? "group" : "command"}`,
                            footer: {
                                text: `module debosser`
                            }
                        }
                    });
                    return;
                }
                await message.channel.send({
                    embed: {
                        color: await client.database?.getColor("success_embed_color"),
                        description: `${catMatch ? "Category" : "Command"} \` ${found.name} \` toggled to **disabled**`,
                        footer: {
                            text: `module debosser`
                        }
                    }
                });
                return;
            }
            if (result.value && result.value == "disable") {
                await message.channel.send({
                    embed: {
                        color: await client.database?.getColor("warn_embed_color"),
                        description: `${catMatch ? "Category" : "Command"} \` ${found.name} \` already disabled`,
                        footer: {
                            text: `module debosser`
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

