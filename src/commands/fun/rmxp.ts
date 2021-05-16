// NOTE: This whole xp system is in long-term development and needs work. The updates will probably come with a web console if there ever is one.
import { Command } from "src/gm";
import { permLevels } from "../../permissions";
import { stringToMember } from "../../utils/parsers";


export const command: Command = {
    name: 'rmxp',
    description: {
        short: "remove points from member",
        long: 'Remove messaging points from member. This will bypass the normal way of earning points: sending messages and being active.'
    },
    aliases: ['-xp'],
    usage: "<member> <points>",
    guildOnly: true,
    permLevel: permLevels.admin,
    args: 2,
    async execute(client, message, args) {
        try {
            if (!message.guild) return;
            const target = await stringToMember(message.guild, args[0], true, true, true);
            if (!target) {
                message.channel.send('Invalid target.');
                return;
            }
            args.shift();
            if (!(await client.specials?.argsMustBeNum(message.channel, args))) return false;// if (/[0-9]/.test(args[0]))
            const amount = parseInt(args[0], 10);

            // const xpData = await client.database.getXP(target);
            // const xp = xpData ? xpData.xp : 0;
            // const newPoints = xp + amount;
            const xpType = await client.database.getGlobalSetting('xp_type');
            await client.database.setXP(target.guild.id, target.id, amount, -1);

            await client.specials?.sendInfo(message.channel, `Removed ${amount} ${xpType ? xpType.value : "points"} from ${target}`);
        } catch (error) {
            xlg.error(error);
            await client.specials?.sendError(message.channel);
            return false;
        }
    }
}
