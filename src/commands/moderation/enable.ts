import { permLevels } from '../../permissions.js';
import { Command, CommandConf } from "src/gm";
import { GuildChannel } from "discord.js";
import { stringToRole, stringToChannel } from "../../utils/parsers.js";
import { getDashboardLink } from "../../utils/specials.js";

export const command: Command = {
    name: 'enable',
    aliases: ['en'],
    description: {
        short: 'enable a command',
        long: 'Use to enable a command.'
    },
    usage: "<command name> [@role|#channel]",
    args: true,
    guildOnly: true,
    permLevel: permLevels.admin,
    async execute(client, message, args) {
        try {
            const searchName = args[0].toLowerCase();
            const conf = await client.database.getCommands(message.guild.id, true);
            if (!conf) {
                await client.specials.sendError(message.channel, "Something ate sh*t", true);
                return;
            }
            const commands = conf.commands;
            const catMatch = client.categories.get(searchName);
            const cmdMatch = client.commands.get(searchName) || client.commands.find(cmd => !!(cmd.aliases && cmd.aliases.includes(searchName)));
            let name = "";
            const applyTo: CommandConf[] = [];
            if (catMatch) {
                catMatch.commands.filter(x => x.name !== "enable" && x.name !== "disable").forEach(c => {
                    const c2 = commands.find(x => x.name === c.name);
                    if (c2) {
                        applyTo.push(c2);
                    }
                });
                name = catMatch.name;
            } else if (cmdMatch) {
                if (cmdMatch.name === "enable" || cmdMatch.name === "disable") {
                    await message.channel.send(`Sanctioning \` enable \` or \` disable \` is prohibited`);
                    return;
                }
                const c = commands.find(x => x.name === cmdMatch.name);
                if (c) applyTo.push(c);
                name = cmdMatch.name;
            } else {
                await message.channel.send(`No command or group with name or alias \`${searchName}\``);
                return;
            }
            if (!applyTo.length) {
                await message.channel.send("No commands selected for configuration");
                return;
            }

            args.shift();
            const a = args.join(" ");
            const spec = stringToChannel(message.guild, a, true, true) || stringToRole(message.guild, a, true, true);
            const unchanged: string[] = [];

            if (applyTo.some(x => !x.enabled || x.channel_mode || x.channels.length || x.role_mode || x.roles.length) || spec) {
                let already = 0;
                for (const c of applyTo) {
                    if (!spec || spec.id === message.guild.roles.cache.find(x => x.name === "@everyone")?.id) {
                        c.enabled = true;
                        c.channel_mode = false;
                        c.channels = [];
                        c.role_mode = false;
                        c.roles = [];
                        continue;
                    } else {
                        c.enabled = true;
                        if (spec instanceof GuildChannel) {
                            if ((c.channel_mode === true && c.channels.includes(spec.id))) {
                                already += 1;
                                continue;
                            }
                            if (c.channel_mode === false && !c.channels.includes(spec.id)) {
                                if (c.channels.length) {
                                    unchanged.push(c.name);
                                    continue;
                                }
                                c.channel_mode = true;
                            }
                            if (c.channel_mode === true) {
                                c.channels.push(spec.id);
                                continue;
                            }
                            c.channels.splice(c.channels.indexOf(spec.id), 1);
                        } else {
                            if ((c.role_mode === true && c.roles.includes(spec.id))) {
                                already += 1;
                                continue;
                            }
                            if (c.role_mode === false && !c.roles.includes(spec.id)) {
                                if (c.roles.length) {
                                    unchanged.push(c.name);
                                    continue;
                                }
                                c.role_mode = true;
                            }
                            if (c.role_mode === true) {
                                c.roles.push(spec.id);
                                continue;
                            }
                            c.roles.splice(c.roles.indexOf(spec.id), 1);
                        }
                        continue;
                    }
                }
                if (already === applyTo.length) {
                    await message.channel.send({
                        embeds: [{
                            color: await client.database.getColor("warn_embed_color"),
                            description: `${catMatch ? "Category" : "Command"} \` ${name} \` is already enabled ${spec instanceof GuildChannel ? "in" : "for"} ${spec}`,
                            footer: {
                                text: `module sanctioner`,
                            },
                        }],
                    });
                    return;
                }
            } else {
                await message.channel.send({
                    embeds: [{
                        color: await client.database.getColor("warn_embed_color"),
                        description: `${catMatch ? "Category" : "Command"} \` ${name} \` is already enabled`,
                        footer: {
                            text: `module sanctioner`,
                        },
                    }],
                });
                return;
            }

            const r = await client.database.editCommands(message.guild.id, applyTo);

            if (!r) {
                await message.channel.send({
                    embeds: [{
                        color: await client.database.getColor("fail"),
                        description: `Failed to enable ${catMatch ? "group" : "command"}`,
                        footer: {
                            text: `module sanctioner`,
                        },
                    }],
                });
                return;
            }
            await message.channel.send({
                embeds: [{
                    color: await client.database.getColor("success"),
                    description: `${catMatch ? "Category" : "Command"} \` ${name} \` **enabled**${spec ? ` ${spec instanceof GuildChannel ? "in" : "for"} ${spec}` : ""}${unchanged.length ? `\n\n[One or more commands](${getDashboardLink(message.guild.id, "commands")}?select=${unchanged.join(",")}) may not have changed how you wanted because of conflicting options. Go to the dashboard to confirm and fix.` : ""}`,
                    footer: {
                        text: `module sanctioner`,
                    },
                }]
            });
        } catch (error) {
            xlg.error(error);
            await client.specials.sendError(message.channel);
            return false;
        }
    }
}
