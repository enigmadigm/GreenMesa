import xlg from "../../xlogger";
import { permLevels } from '../../permissions';
import { Command } from "src/gm";
import { MessageEmbed, TextChannel } from "discord.js";
import { Contraventions } from "../../utils/contraventions";
import moment from "moment";

export const command: Command = {
    name: "reason",
    description: {
        short: "set reason for an infraction",
        long: "Set the reason/summary given for a mod case. The reason will be recorded in the modlog files and shown in the modlog."
    },
    usage: "<case #> <reason>",
    args: true,
    cooldown: 1,
    permLevel: permLevels.mod,
    moderation: true,
    guildOnly: true,
    async execute(client, message, args) {
        try {
            if (!message.guild) return;
            if (!/^[0-9]+$/.test(args[0])) {
                message.channel.send(`Invalid case. Provide a case number.`);
                return;
            }
            const c = parseInt(args[0], 10);
            args.shift();
            if (!args.length) {
                message.channel.send(`Provide a reason. What do you think the point of this command is?`);
                return;
            }
            const a = args.join(" ");
            const file = await client.database.getModActionByGuildCase(message.guild.id, c);
            if (!file) {
                message.channel.send(`I couldn't find a case with an ID of ${c}. Try something else?`);
                return;
            }
            file.summary = a;
            const r = await client.database.setModAction(file);
            if (!r || !r.affectedRows) {
                message.channel.send(`Something went wrong while updating the file. Please join https://dsc.gg/ro if this happens again.`);
                return;
            }
            const responseMessage = await message.channel.send(`Reason added to case ${c}`);
            if (/^[0-9]{18}$/.test(file.superid)) {
                const chan = await client.database.getGuildSetting(message.guild.id, "modlog");// get the case channel
                if (chan && chan.value) {// try to send the message to the channel
                    // Bot.client.specials.sendMessageAll({ embed }, r.value);
                    const c = message.guild.channels.cache.get(chan.value);
                    if (c && c instanceof TextChannel) {
                        try {
                            const u = client.users.cache.get(file.userid);
                            const agent = client.users.cache.get(file.agent);
                            const m = await c.messages.fetch(file.superid);
                            const e = Contraventions.constructEmbed(u || file.userid, agent || file.agent, file.casenumber, file.type, await client.database.getColor("info"), file.summary, file.endtime ? Math.abs(moment(file.created).diff(file.endtime, "ms")) : 0, file.endtime);
                            m.embeds[0].description = e.description;
                            await m.edit(new MessageEmbed(m.embeds[0]));
                            await responseMessage.edit(`${responseMessage.content} and the case message in ${m.channel}`);
                        } catch (error) {
                            //
                        }
                    }
                }
            }
        } catch (error) {
            xlg.error(error);
            await client.specials?.sendError(message.channel);
            return false;
        }
    }
}
