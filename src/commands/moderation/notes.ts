import xlg from "../../xlogger";
import { permLevels } from '../../permissions';
import { Command, UserNote } from "src/gm";
import { stringToMember } from "../../utils/parsers";
import { MessageEmbedOptions } from "discord.js";
//import moment from 'moment';

export const command: Command = {
    name: "notes",
    description: {
        short: "view notes of users",
        long: "View notes given to users."
    },
    usage: "<member>",
    examples: [
        "sm notes @Darth"
    ],
    args: true,
    cooldown: 3,
    permLevel: permLevels.mod,
    moderation: false,
    guildOnly: true,
    async execute(client, message, args) {
        try {
            if (!message.guild) return;
            const a = args.join(" ");
            let targetId = /^[0-9]{18}$/.test(a) && !message.guild.members.cache.get(a) ? a : "";
            let targetName = targetId ? "Expired Member" : "";
            if (!targetId) {
                const target = await stringToMember(message.guild, a, true, true, true);
                if (!target) {
                    await client.specials?.sendError(message.channel, `Could not find target`);
                    return;
                }
                targetId = target.id;
                targetName = `${target}`;
            }
            const gud = await client.database.getGuildUserData(message.guild.id, targetId);
            if (!gud) {
                await client.specials?.sendError(message.channel, `Could not retrieve user info`);
                return;
            }
            const notes: UserNote[] = gud.modnote && gud.modnote.length ? JSON.parse(gud.modnote) : [];
            if (!notes.length) {
                await client.specials?.sendInfo(message.channel, "No notes");
                return;
            }
            const embed: MessageEmbedOptions = {
                color: await client.database.getColor("info_embed_color"),
                description: `Notes for ${targetName} (${targetId})`,
                fields: []
            };
            for (const n of notes) {
                embed.fields?.push({
                    name: `# ${n.id} - ${n.author}`,
                    value: `${n.content}\n${n.created}${n.created !== n.updated ? " *(edited)*" : ""}`,
                });
            }
            await message.channel.send({ embed });
        } catch (error) {
            xlg.error(error);
            await client.specials?.sendError(message.channel);
            return false;
        }
    }
}
