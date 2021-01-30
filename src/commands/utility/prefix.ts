import xlg from "../../xlogger";
import { permLevels, getPermLevel } from "../../permissions";
import { Command } from "src/gm";

export const command: Command = {
    name: "prefix",
    description: "set or view the prefix for guild",
    guildOnly: true,
    async execute(client, message, args) {
        try {
            if (!message.guild || !message.member) return;
            if (!args.length) {
                message.channel.send({
                    embed: {
                        color: await client.database?.getColor("info_embed_color"),
                        title: `${message.gprefix}`,
                        description: `guild prefix`
                    }
                });
                return;
            }
            const permLevel = await getPermLevel(message.member);
            if (args.length > 0) {
                if (permLevel < permLevels.admin) {
                    message.channel.send(":frowning2: Insufficient permissions.").catch(xlg.error);
                    return;
                }
                if (args.join(" ").length > 46) {
                    message.channel.send(":frowning2: Prefix must be less than 47 characters.");
                    return;
                }
                await client.database?.setPrefix(message.guild.id, args.join(" "));
                message.channel.send({
                    embed: {
                        color: await client.database?.getColor("success_embed_color"),
                        description: `prefix updated`
                    }
                });
                return;
            }
        } catch (error) {
            xlg.error(error);
            await client.specials?.sendError(message.channel);
            return false;
        }
    }
}

