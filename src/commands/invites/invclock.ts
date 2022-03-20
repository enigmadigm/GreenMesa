import { permLevels } from '../../permissions';
import { Command, GuildMessageProps } from "src/gm";
import moment from 'moment';

export const command: Command<GuildMessageProps> = {
    name: "invclock",
    aliases: ["invreset"],
    description: {
        short: "reset invite tracking",
        long: "Invites are always being tracked, but using this command you can set the date at which the invite stats will be displayed from."
    },
    cooldown: 15,
    // permLevel: permLevels.admin,
    permLevel: permLevels.botMaster,
    guildOnly: true,
    permissions: ["MANAGE_GUILD"],
    async execute(client, message) {
        try {
            const dataState = await client.invites.getInvitesState(message.guild.id);
            dataState.reset_at = moment().format();
            await client.invites.updateInvitesState(dataState);
            await message.channel.send(`Invite tracking is clocking from now`);
        } catch (error) {
            xlg.error(error);
            await client.specials.sendError(message.channel);
            return false;
        }
    }
}
