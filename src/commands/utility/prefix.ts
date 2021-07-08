import { permLevels, getPermLevel } from "../../permissions";
import { Command } from "src/gm";

export const command: Command = {
    name: "prefix",
    description: "set or view the prefix for guild",
    guildOnly: true,
    async execute(client, message, args) {
        try {
            if (!args.length) {
                await message.channel.send({
                    embeds: [{
                        color: await client.database.getColor("info"),
                        title: `${message.gprefix}`,
                        description: `Server prefix`
                    }],
                });
                return;
            }
            const permLevel = await getPermLevel(message.member);
            if (permLevel < permLevels.admin) {
                await message.channel.send(":frowning2: Insufficient permissions.");
                return;
            }
            const a = args.join(" ");
            if (a.length > 46) {
                await message.channel.send(":frowning2: Prefix must be less than 47 characters.");
                return;
            }
            await client.database.setPrefix(message.guild.id, a);
            await message.channel.send({
                embeds: [{
                    color: await client.database.getColor("success"),
                    description: `Prefix changed to ${a}`,
                }],
            });
        } catch (error) {
            xlg.error(error);
            await client.specials.sendError(message.channel);
            return false;
        }
    }
}
