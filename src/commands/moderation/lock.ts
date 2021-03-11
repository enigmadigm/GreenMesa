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
    permissions: ["MANAGE_CHANNELS"],
    async execute(client, message, args) {
        try {
            if (!message.guild || !message.member) return;

            const g = await message.guild.fetch();
            const channel = stringToChannel(message.guild, args.join(" "), true, true) || message.channel;
            if (!(channel instanceof TextChannel)) {
                await client.specials?.sendError(message.channel, "Channel must be a text channel");
                return;
            }
            const everyone = g.roles.cache.find(x => x.position === 0);
            if (!everyone) {
                await client.specials?.sendError(message.channel, "Unable to access @everyone role");
                return;
            }
            const p = channel.permissionsFor(everyone);
            if (p && !p.has("SEND_MESSAGES")) {
                await channel.updateOverwrite(everyone, {
                    'SEND_MESSAGES': true
                });
                try {
                    // if (!channel.permissionsFor(message.guild.me || "")?.has("SEND_MESSAGES")) {}
                    await channel.send("This channel has been unlocked\n(send again to lock)");
                } catch (error) {
                    message.author.send(`I gave @ everyone permissions to speak in ${channel}, but I do not have the permissions to speak`);
                }
            } else {
                await channel.updateOverwrite(everyone, {
                    'SEND_MESSAGES': false
                });
                try {
                    await channel.send("This channel has been locked\n(send again to unlock)");
                } catch (error) {
                    message.author.send(`${channel} is now locked, and I do not have the permissions to speak in it.`);
                }
            }
        } catch (error) {
            xlg.error(error);
            await client.specials?.sendError(message.channel);
            return false;
        }
    }
}
