import xlg from "../../xlogger";
import { permLevels } from '../../permissions';
import { Command } from "src/gm";

export const command: Command = {
    name: "autorole",
    aliases: ["ar"],
    description: {
        short: "set up in the dashboard",
        long: "Set up autorole in the dashboard."
    },
    cooldown: 2,
    permLevel: permLevels.trustedMember,
    guildOnly: true,
    async execute(client, message) {
        try {
            message.channel.send({
                embed: {
                    color: await client.database.getColor("info"),
                    description: `Please go to [the dashboard](https://stratum.hauge.rocks/dash/${message.guild ? `${message.guild.id}/autorole` : ""}) to configure the autorole features of Stratum.`
                }
            })
        } catch (error) {
            xlg.error(error);
            await client.specials?.sendError(message.channel);
            return false;
        }
    }
}
