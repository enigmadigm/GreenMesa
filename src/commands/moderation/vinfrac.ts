import { permLevels } from '../../permissions';
import { Command } from "src/gm";
import { Contraventions } from '../../utils/contraventions';
import moment from 'moment';
import { isSnowflake } from '../../utils/specials';

export const command: Command = {
    name: "vinfrac",
    aliases: ["vi"],
    description: {
        short: "view an infraction",
        long: "Use to view an infraction on a user or a general mod action."
    },
    examples: [
        "69",
    ],
    usage: "<number>",
    args: 1,
    cooldown: 0,
    permLevel: permLevels.mod,
    moderation: true,
    guildOnly: true,
    async execute(client, message, args) {
        try {
            if (!(await client.specials.argsMustBeNum(message.channel, [args[0]]))) return false;
            const n = parseInt(args[0], 10);
            const file = await client.database.getModActionByGuildCase(message.guild.id, n);
            if (!file) {// if the infraction is not recorded or does not exist
                await message.channel.send(`I couldn't find a case with an ID of \` ${n} \`. Try something else?`);
                return;
            }

            const u = client.users.cache.get(file.userid);
            const agent = isSnowflake(file.agent) ? client.users.cache.get(file.agent) : undefined;
            const e = await Contraventions.constructEmbed(u || file.userid, agent || file.agent, file.casenumber, file.type, -1, file.summary, file.endtime ? Math.abs(moment(file.created).diff(file.endtime, "ms")) : 0, file.endtime, file.usertag, undefined, !file.notified);// reconstruct the case embed from the retrieved data
            // send the retrieved infraction data
            await message.channel.send({
                embeds: [
                    {
                        color: await client.database.getColor("info"),
                        description: `Log entry for case ID \` ${file.casenumber} \` in \` this guild \`\nEntry concerns user \` ${file.usertag.escapeDiscord()} \``,
                    },
                    e
                ]
            });
        } catch (error) {
            xlg.error(error);
            await client.specials.sendError(message.channel);
            return false;
        }
    }
}
