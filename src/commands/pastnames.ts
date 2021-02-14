import xlg from "../xlogger";
import { permLevels } from '../permissions';
import { Command } from "src/gm";
import { stringToMember } from "../utils/parsers";

export const command: Command = {
    name: "pastnames",
    description: {
        short: "get past nicknames",
        long: "Get a list of past nicknames of a member in a server."
    },
    usage: "[member]",
    cooldown: 3,
    permLevel: permLevels.member,
    guildOnly: true,
    async execute(client, message, args) {
        try {
            if (!message.guild) return;

            const target = await stringToMember(message.guild, args.join(" "), true, true, true) || message.member;
            if (!target) {
                client.specials?.sendError(message.channel, "Target invalid");
                return;
            }
            const ud = await client.database?.getGuildUserData(target.guild.id, target.user.id);
            if (!ud || !ud.nicknames) {
                client.specials?.sendError(message.channel, `Could not access user data. ${target} may not have any nicknames yet.`);
                return;
            }
            message.channel.send(`${ud.nicknames.split(",").join("\n")}`, { code: true });
        } catch (error) {
            xlg.error(error);
            await client.specials?.sendError(message.channel);
            return false;
        }
    }
}
