import xlg from "../../xlogger";
import { permLevels } from '../../permissions';
import { Command } from "src/gm";

export const command: Command = {
    name: "automod",
    aliases: ["am"],
    description: {
        short: "configure automod modes",
        long: "Configures automod settings. Use in place of the web dashboard to manage automod."
    },
    usage: "[enable|disable] mode]",
    args: false,
    cooldown: 1,
    permLevel: permLevels.admin,
    moderation: true,
    guildOnly: true,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async execute(client, message, args) {
        try {
            if (!message.guild) return;
            
            const mods = client.services?.automods;
            if (!mods) {
                client.specials?.sendError(message.channel, "AM modules not loaded, please contact botmaster");
                return;
            }
            const modsConf = await client.database?.getGuildSettingsByPrefix(message.guild.id, "automod_");
            if (!modsConf) {
                return;
            }
            let argIndex = 0;
            switch (args[argIndex]) {
                case "disable":
                case "enable": {
                    argIndex++;
                    if (!args[argIndex]) {
                        client.specials?.sendError(message.channel, "Module not provided. See modules by sending this command with no arguments.");
                        break;
                    }
                    if (!mods.includes(args[argIndex])) {
                        client.specials?.sendError(message.channel, "That is not a valid module. See modules by sending this command with no arguments.");
                        break;
                    }
                    const mod = args[argIndex];
                    const option = args[argIndex - 1] === "enable";
                    if (option) {
                        const addResult = await client.database?.editGuildSetting(message.guild, `automod_${mod}`, "enabled");
                        if (!addResult || !addResult.affectedRows) {
                            client.specials?.sendError(message.channel, "Failed to update config", true);
                            break;
                        } else {
                            message.channel.send(`Successfully enabled \`${mod}\``);
                        }
                    } else {
                        const delResult = await client.database?.editGuildSetting(message.guild, `automod_${mod}`, undefined, true);
                        if (!delResult || !delResult.affectedRows) {
                            client.specials?.sendError(message.channel, "Failed to update config", true);
                            break;
                        } else {
                            message.channel.send(`Successfully disabled \`${mod}\``);
                        }
                    }
                    break;
                }
                default: {
                    message.channel.send({
                        embed: {
                            color: await client.database?.getColor("info_embed_color"),
                            title: "Automod Config",
                            description: `The automod service is split into various modules. The automod modules are responsible for performing the various automod tasks. They are enabled individually and are all off by default.

Enable or disable mods by sending this command followed by \`enable\` or \`disable\` and then the module name.

**Modules**
${mods.map(m => {
    const modMatch = modsConf.find(m1 => m1.property.split("_")[1] === m);
    if (modMatch) {
        return `\`${m} (${modMatch.value})\``
    } else {
        return `\`${m} (disabled)\``
    }
}).join(", ")}
`
                        }
                    })
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
