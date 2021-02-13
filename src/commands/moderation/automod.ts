import xlg from "../../xlogger";
import { permLevels } from '../../permissions';
import { Command } from "src/gm";
import { stringToChannel } from "../../utils/parsers";

export const command: Command = {
    name: "automod",
    aliases: ["am"],
    description: {
        short: "configure automod modes",
        long: "Configures automod settings. Use in place of the web dashboard to manage automod."
    },
    usage: "[{module}] | [<enable|disable> {module}]",
    args: false,
    cooldown: 1,
    permLevel: permLevels.admin,
    moderation: true,
    guildOnly: true,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async execute(client, message, args) {
        try {
            if (!message.guild) return;
            
            const allMods = await client.database?.getAllAutoModules(message.guild.id) || [];

            let argIndex = 0;
            switch (args[argIndex]) {
                case "disable":
                case "enable": {
                    argIndex++;
                    if (!args[argIndex]) {
                        client.specials?.sendError(message.channel, "Module not provided. See modules by sending this command with no arguments.");
                        break;
                    }
                    const mod = allMods.find(x => x.name === args[argIndex]);
                    if (!mod) {
                        client.specials?.sendError(message.channel, "That is not a valid module. See modules by sending this command with no arguments.");
                        break;
                    }
                    const option = args[argIndex - 1] === "enable";
                    argIndex++;
                    const channel = stringToChannel(message.guild, args[argIndex], true, true);
                    if (!channel && args[argIndex]) {
                        client.specials?.sendError(message.channel, "A valid channel was not provided.");
                        break;
                    }
                    if (option) {
                        if (!channel) {
                            if (mod.enableAll) {
                                client.specials?.sendError(message.channel, `Module \`${mod.name}\` is already enabled in all channels`);
                                break;
                            }
                            mod.enableAll = true;
                            await client.database?.editGuildSetting(message.guild, `automod_${mod.name}`, JSON.stringify(mod));
                            message.channel.send(`Successfully enabled \`${mod.name}\` in all channels`);
                            break;
                        }
                        if (mod.channels.includes(channel.id)) {
                            client.specials?.sendError(message.channel, `Module \`${mod.name}\` is already enabled in ${channel}`);
                            break;
                        }
                        mod.enableAll = false;
                        mod.channels.push(channel.id);
                        const addResult = await client.database?.editGuildSetting(message.guild, `automod_${mod.name}`, JSON.stringify(mod));
                        if (!addResult || !addResult.affectedRows) {
                            client.specials?.sendError(message.channel, "Failed to update config", true);
                            break;
                        } else {
                            message.channel.send(`Successfully enabled \`${mod.name}\``);
                        }
                    } else {
                        if (!channel) {
                            if (!mod.channels.length && !mod.enableAll) {
                                client.specials?.sendError(message.channel, `Module \`${mod.name}\` is already disabled in all channels`);
                                break;
                            }
                            mod.enableAll = false;
                            mod.channels = [];
                            await client.database?.editGuildSetting(message.guild, `automod_${mod.name}`, JSON.stringify(mod));
                            message.channel.send(`Successfully disabled \`${mod.name}\` in all channels`);
                            break;
                        }
                        if (!mod.channels.includes(channel.id)) {
                            client.specials?.sendError(message.channel, `Module \`${mod.name}\` is already disabled in ${channel}`);
                            break;
                        }
                        mod.channels.splice(mod.channels.indexOf(channel.id), 1);
                        const dResult = await client.database?.editGuildSetting(message.guild, `automod_${mod.name}`, JSON.stringify(mod));
                        if (!dResult || !dResult.affectedRows) {
                            client.specials?.sendError(message.channel, "Failed to update config", true);
                            break;
                        } else {
                            message.channel.send(`Successfully disabled \`${mod.name}\``);
                        }
                    }
                    break;
                }
                default: {
                    const mod = allMods.find(x => x.name === args[argIndex]);
                    if (args[argIndex] && mod) {
                        const enabled = await client.database?.getAutoModuleEnabled(message.guild.id, mod.name, undefined, true) || false;
                        /*if (!enabled) {
                            client.specials?.sendError(message.channel, "Module not enabled anywhere");
                            break;
                        }*/
                        const channelList = mod.channels.map(x => message.guild?.channels.cache.get(x) || "#deleted-channel");
                        const info = await client.services?.getInfo(client, message.guild.id, `automod_${mod.name}`);
                        message.channel.send({
                            embed: {
                                color: await client.database?.getColor("info_embed_color"),
                                title: "Automod Config",
                                description: `Information about the \`${mod.name}\` module.${info ? `\n\n${info}` : ""}

**Enabled In**
${!enabled ? "Module not enabled anywhere" : mod.enableAll ? "all channels" : channelList.join(", ")}
`
                            }
                        });
                        break;
                    }

                    message.channel.send({
                        embed: {
                            color: await client.database?.getColor("info_embed_color"),
                            title: "Automod Config",
                            description: `The automod service is split into various modules. The automod modules are responsible for performing the various automod tasks. They are enabled individually and are all off by default.

Enable or disable mods by sending this command followed by \`enable\` or \`disable\`, then the module name, and then the channel to enable in. **To configure further options, please use the [web dashboard](https://stratum.hauge.rocks).**

**Modules**
${allMods.map(m => {
    if (m.channels.length) {
        return `\`${m.name}\` (${m.channels.map((c) => message.guild?.channels.cache.get(c) || "#unknown")})`
    } else if (m.enableAll) {
        return `\`${m.name}\` (everywhere)`
    } else {
        return `\`${m.name}\` (disabled)`
    }
}).join("\n")}

Get more details with \`${message.gprefix}${this.name} {mod}\`.
`
                        }
                    });
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
