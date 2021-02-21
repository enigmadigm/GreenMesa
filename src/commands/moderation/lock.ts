import xlg from "../../xlogger";
import { permLevels } from '../../permissions';
import { Command } from "src/gm";
import { stringToChannel } from "../../utils/parsers";
import { TextChannel } from "discord.js";

export const command: Command = {
    name: "lock",
    aliases: ["unlock"],
    description: {
        short: "stop users from sending messages in a channel",
        long: "Stop normal users from sending message in a channel. This works by disabling the Send Messages privilege for @everyone. This will not work if @everyone already has Send Messages disabled. Send command `lockprep` to try to fix this issue before sending this command."
    },
    usage: "[channel]",
    args: false,
    cooldown: 3,
    permLevel: permLevels.admin,
    moderation: true,
    guildOnly: true,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async execute(client, message, args) {
        try {
            if (!message.guild || !message.member) return;

            const g = await message.guild.fetch();
            const channel = stringToChannel(message.guild, args.join(" "), true, true) || message.channel;
            if (!(channel instanceof TextChannel)) {
                client.specials?.sendError(message.channel, "Channel must be a text channel");
                return;
            }
            const everyone = g.roles.cache.find(x => x.position === 0);
            if (!everyone) {
                client.specials?.sendError(message.channel, "Unable to access @everyone role");
                return;
            }
            const p = channel.permissionsFor(everyone);
            if (!p?.serialize().SEND_MESSAGES) {
                await channel.updateOverwrite(everyone, {
                    'SEND_MESSAGES': true
                });
                channel.send("This channel has been unlocked");
            } else {
                await channel.updateOverwrite(everyone, {
                    'SEND_MESSAGES': false
                });
                channel.send("This channel has been locked");
            }
        } catch (error) {
            xlg.error(error);
            await client.specials?.sendError(message.channel);
            return false;
        }
    }
}
