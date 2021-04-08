import xlg from "../../xlogger";
import { permLevels } from '../../permissions';
import { Command } from "src/gm";
import { stringToChannel } from "../../utils/parsers";
import { getDashboardLink } from "../../utils/specials";

export const command: Command = {
    name: "automod",
    aliases: ["am"],
    description: {
        short: "configure automod modes",
        long: "Configures automod settings. Use in place of the web dashboard to manage automod."
    },
    usage: "[{module}] | [<enable|disable> {module}] reset]",
    args: false,
    cooldown: 1,
    permLevel: permLevels.admin,
    moderation: true,
    guildOnly: true,
    async execute(client, message, args) {
        try {
            if (!message.guild) return;

            const allMods = await client.database.getAllAutoModules(message.guild.id) || [];

            let argIndex = 0;
            switch (args[argIndex]) {
                case "disable":
                case "enable": {
                    const option = args[argIndex] === "enable";
                    argIndex++;
                    if (!args[argIndex]) {
                        client.specials.sendError(message.channel, `Module not provided.\n\nAvailable mods:\n${allMods.map(m => `\`${m.name}\``).join(" ")}`);
                        break;
                    }
                    const mod = allMods.find(x => x.name === args[argIndex]);
                    if (!mod) {
                        client.specials.sendError(message.channel, `That is not a valid module.\n\nAvailable mods:\n${allMods.map(m => `\`${m.name}\``).join(" ")}`);
                        break;
                    }
                    argIndex++;
                    const channel = stringToChannel(message.guild, args[argIndex], true, true);
                    if (!channel && args[argIndex]) {
                        client.specials.sendError(message.channel, "A valid channel was not provided.");
                        break;
                    }
                    if (!mod.text) {
                        if (channel) {
                            client.specials.sendError(message.channel, `This module cannot be toggled in an individual channel. This module *does not handle messages*. **To configure additional settings for this module, go to the [dashboard](${getDashboardLink(message.guild.id, "automod")}).**`);
                            break;
                        }
                        /*if (mod.channelEffect) {
                            delete mod.channelEffect;
                        }
                        if (mod.channels) {
                            delete mod.channels;
                        }*/
                        if (option) {
                            if (mod.enableAll) {
                                client.specials.sendError(message.channel, "Module already enabled.");
                                break;
                            }
                            mod.enableAll = true;
                            await client.database.editGuildSetting(message.guild, `automod_${mod.name}`, JSON.stringify(mod));
                            message.channel.send(`Enabled ${mod.name}.\n⚠️ Further configuration may be needed in the dashboard.`);
                        } else {
                            if (!mod.enableAll) {
                                client.specials.sendError(message.channel, "Module already disabled.");
                                break;
                            }
                            mod.enableAll = false;
                            await client.database.editGuildSetting(message.guild, `automod_${mod.name}`, JSON.stringify(mod));
                            message.channel.send(`Disabled ${mod.name}.`);
                        }
                        break;
                    }
                    if (!mod.channels || !mod.channelEffect) {
                        client.specials.sendError(message.channel, `AutoModule data for \`${mod.name}\` is corrupted, please call \`${message.gprefix} ${this.name} reset ${mod.name}\`.`);
                        break;
                    }
                    // the 'enable' and 'disable' options obviously have different logic, this was unintentional
                    if (option) {
                        if (!channel) {
                            if (mod.enableAll) {
                                client.specials.sendError(message.channel, `Module \`${mod.name}\` is already enabled in all channels.`);
                                break;
                            }
                            mod.enableAll = true;
                            mod.channels = [];
                            mod.channelEffect = "enable";
                            await client.database.editGuildSetting(message.guild, `automod_${mod.name}`, JSON.stringify(mod));
                            message.channel.send(`Enabled \`${mod.name}\` in all channels.\n⚠️ Further configuration may be needed in the dashboard.`);
                            break;
                        }
                        mod.enableAll = false;
                        if (mod.channels.includes(channel.id)) {
                            if (mod.channelEffect === "disable") {
                                mod.channels.splice(mod.channels.indexOf(channel.id), 1);
                                const addResult = await client.database.editGuildSetting(message.guild, `automod_${mod.name}`, JSON.stringify(mod));
                                if (!addResult || !addResult.affectedRows) {
                                    client.specials.sendError(message.channel, "Failed to update config", true);
                                } else {
                                    message.channel.send(`Enabled \`${mod.name}\` in ${channel}`);
                                }
                                break;
                            }
                            client.specials.sendError(message.channel, `Module \`${mod.name}\` is already enabled in ${channel}.`);
                            break;
                        }
                        // // the error occurs when the channeleffect is to disable channels and the channel array is empty but a channel to enable is requested
                        let fmsg = `Successfully enabled \`${mod.name}\` in ${channel}`;
                        if (mod.channelEffect === "disable") {
                            if (mod.channels.length) {
                                client.specials.sendError(message.channel, `The module \`${mod.name}\` is not disabled in ${channel}.\n\nIf you want this module to be disabled everywhere but in ${channel}, first, send \`${message.gprefix} ${this.name} disable ${mod.name}\`, then, send \`${message.gprefix} ${this.name} enable ${mod.name} ${channel.id}\`.`);
                                break;
                            }
                            mod.channelEffect = "enable";
                            fmsg = `Enabled \`${mod.name}\` in ${channel} and disabled in all other channels.`;
                        }
                        mod.channels.push(channel.id);
                        const addResult = await client.database.editGuildSetting(message.guild, `automod_${mod.name}`, JSON.stringify(mod));
                        if (!addResult || !addResult.affectedRows) {
                            client.specials.sendError(message.channel, "Failed to update config", true);
                        } else {
                            message.channel.send(fmsg);
                        }
                    } else {
                        if (!channel) {
                            if ((!mod.channels.length && mod.channelEffect === "enable") && !mod.enableAll) {
                                client.specials.sendError(message.channel, `Module \`${mod.name}\` is already disabled in all channels. Send that command again with a channel to enable in all channels except that channel.`);
                                break;
                            }
                            mod.enableAll = false;
                            mod.channels = [];
                            mod.channelEffect = "enable";
                            await client.database.editGuildSetting(message.guild, `automod_${mod.name}`, JSON.stringify(mod));
                            message.channel.send(`Disabled \`${mod.name}\` in all channels.`);
                            break;
                        }
                        mod.enableAll = false;
                        if (!mod.channels.includes(channel.id)) {
                            if (!mod.channels.length || mod.channelEffect === "disable") {
                                mod.channels.push(channel.id);
                                if (mod.channelEffect !== "disable") {
                                    mod.channelEffect = "disable";
                                    await client.database.editGuildSetting(message.guild, `automod_${mod.name}`, JSON.stringify(mod));
                                    message.channel.send(`Disabled \`${mod.name}\` in ${channel} and enabled in all other channels.`);
                                    break;
                                }
                                await client.database.editGuildSetting(message.guild, `automod_${mod.name}`, JSON.stringify(mod));
                                message.channel.send(`Disabled \`${mod.name}\` in ${channel}`);
                                break;
                            }
                            client.specials.sendError(message.channel, `Module \`${mod.name}\` is already disabled in ${channel}.\n\nIf you want this module to be enabled everywhere but in ${channel}, first, send \`${message.gprefix} ${this.name} enable ${mod.name}\`, then, send \`${message.gprefix} ${this.name} disable ${mod.name} ${channel.id}\`.`);
                            break;
                        }
                        mod.channels.splice(mod.channels.indexOf(channel.id), 1);
                        const dResult = await client.database.editGuildSetting(message.guild, `automod_${mod.name}`, JSON.stringify(mod));
                        if (!dResult || !dResult.affectedRows) {
                            client.specials.sendError(message.channel, "Failed to update config", true);
                        } else {
                            message.channel.send(`Disabled \`${mod.name}\` in ${channel}`);
                        }
                    }
                    break;
                }
                case "reset": {
                    argIndex++;
                    if (!args[argIndex]) {
                        client.specials.sendError(message.channel, `Module not provided.\n\nAvailable mods:\n${allMods.map(m => `\`${m.name}\``).join(" ")}`);
                        break;
                    }
                    const mod = allMods.find(x => x.name === args[argIndex]);
                    if (!mod) {
                        client.specials.sendError(message.channel, `That is not a valid module.\n\nAvailable mods:\n${allMods.map(m => `\`${m.name}\``).join(" ")}`);
                        break;
                    }
                    await client.database.editGuildSetting(message.guild, `automod_${mod.name}`, undefined, true);
                    message.channel.send({
                        embed: {
                            color: await client.database.getColor("info"),
                            description: `The configuration for ${mod.name} has been reset.`
                        }
                    });
                    break;
                }
                default: {
                    const mod = allMods.find(x => x.name === args[argIndex]);
                    if (args[argIndex] && mod) {
                        argIndex++;
                        if (args[argIndex] && args[argIndex] === "enable" || args[argIndex] === "disable") {
                            client.specials.sendError(message.channel, `To enable/disable a module, you must send \`${message.gprefix} am enable|disable ${mod.name || "{module}"}\`.`)
                            break;
                        }
                        const enabled = await client.database.getAutoModuleEnabled(message.guild.id, mod.name, undefined, true) || false;
                        /*if (!enabled) {
                            client.specials.sendError(message.channel, "Module not enabled anywhere");
                            break;
                        }*/
                        const info = await client.services?.getInfo(client, message.guild.id, `automod_${mod.name}`);
                        if (mod.text) {
                            if (mod.channelEffect && mod.channels) {
                                const channelList = mod.channels.map(x => message.guild?.channels.cache.get(x) || "#deleted-channel");
                                message.channel.send({
                                    embed: {
                                        color: await client.database.getColor("info"),
                                        title: `Automod Config - \`${mod.name}\``,
                                        description: `Information about the \`${mod.name}\` module.${info ? `\n\n${info}` : ""}

**${(mod.channelEffect === "enable" || (mod.channelEffect === "disable" && !channelList.length)) || mod.enableAll ? "Enabled": "Disabled"} In**
${!enabled ? "Module not enabled anywhere" : (mod.enableAll ? "all channels" : (channelList.length ? channelList.join(", ") : "all channels"))}
`
                                    }
                                });
                            }
                        } else {
                            message.channel.send({
                                embed: {
                                    color: await client.database.getColor("info"),
                                    title: "Automod Config",
                                    description: `Information about the \`${mod.name}\` module.${info ? `\n\n${info}` : ""}

**Status**
${!enabled ? "Disabled" : "Enabled"}
`
                                }
                            });
                        }
                        break;
                    } else if (args[argIndex]) {
                        client.specials.sendError(message.channel, `\`${args[argIndex]}\` is not a valid module.\n\nAvailable mods:\n${allMods.map(m => `\`${m.name}\``).join(" ")}`)
                        break;
                    }

                    message.channel.send({
                        embed: {
                            color: await client.database.getColor("info"),
                            title: "Automod Config",
                            description: `The automod service is split into various modules. The automod modules are responsible for performing the various automod tasks. They are enabled individually and are all off by default.

Enable or disable mods by sending this command followed by \`enable\` or \`disable\`, then the module name, and then the channel to enable in. **To configure further options, please use the [web dashboard](${getDashboardLink(message.guild.id, "automod")}).**

**Modules**
${allMods.map(m => {
    let txt = `${m.enableAll || ((m.channelEffect === "enable" || m.channelEffect === "disable") && m.channels && m.channels.length) ? "<:check_sm:775144057050759179>" : "<:cross_sm:775144091062894612>"} `;
    if (m.text && m.channels) {
        if (m.enableAll) {
            txt += `\`${m.name}\` (enabled everywhere)`
        } else if (m.channels.length) {
            txt += `\`${m.name}\` (${m.channelEffect === "enable" ? "enabled in" : "disabled in"} ${m.channels.map((c) => message.guild?.channels.cache.get(c) || "#unknown")})`
        } else {
            txt += `\`${m.name}\` (${m.channelEffect === "enable" ? "disabled" : "enabled everywhere"})`
        }
    } else {
        txt += `\`${m.name}\` ${m.enableAll ? "(enabled)" : "(disabled)"}`
    }
    return txt;
}).join("\n")}

Get more details with \`${message.gprefix}${this.name} <insert mod here>\`.
`
                        }
                    });
                    break;
                }
            }
        } catch (error) {
            xlg.error(error);
            await client.specials.sendError(message.channel);
            return false;
        }
    }
}
