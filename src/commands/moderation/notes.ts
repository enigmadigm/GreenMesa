import { permLevels } from '../../permissions';
import { Command, GuildMessageProps, UserNote } from "src/gm";
import { combineEmbedText, stringToMember } from "../../utils/parsers";
import { MessageEmbed, MessageEmbedOptions } from "discord.js";
import { PaginationExecutor } from '../../utils/pagination';
import { isSnowflake } from '../../utils/specials';

export const command: Command<GuildMessageProps> = {
    name: "notes",
    description: {
        short: "view notes of users",
        long: "View notes given to users."
    },
    usage: "<member>",
    examples: [
        "@Darth"
    ],
    flags: [
        {
            f: "m",
            d: "maximum notes to show in one page",
            v: "1-20",
            isNumber: true,
        }
    ],
    args: true,
    cooldown: 2,
    permLevel: permLevels.mod,
    moderation: false,
    guildOnly: true,
    async execute(client, message, args, flags) {
        try {
            const a = args.join(" ");
            let targetId = isSnowflake(a) && !message.guild.members.cache.get(a) ? a : null;// allows for the executor to pass in an id of a member who has departed
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
                await client.specials.sendInfo(message.channel, "No notes");
                return;
            }
            const embed: MessageEmbedOptions = {
                color: await client.database.getColor("info"),
                description: `Notes for ${targetName} (${targetId})`,
                fields: [],
                footer: {
                    text: `${notes.length} notes`,
                },
            };
            const allFields = [];
            for (const n of notes) {
                allFields.push({
                    name: `${n.id} - ${n.author}`,
                    value: `${n.content}\n${n.created}${n.created !== n.updated ? " *(edited)*" : ""}`,
                });
            }
            const pages: MessageEmbed[] = [new MessageEmbed(Object.assign({}, embed))];
            for (const f of allFields) {
                const e = pages[pages.length - 1];
                if ((combineEmbedText(e) + `${f.name}${f.value}`).length > 5555 || e.fields.length >= (flags.find(x => x.name === "m" && x.numberValue.between(0, 20))?.numberValue || 20)) {
                    const e2 = new MessageEmbed(Object.assign({}, embed));
                    e2.addField(f.name, f.value, true);
                    pages.push(e2);
                    continue;
                }
                e.addField(f.name, f.value, true);
            }
            await PaginationExecutor.createEmbed(message, pages, undefined, true);
            // await message.channel.send({ embed });// now paginating
        } catch (error) {
            xlg.error(error);
            await client.specials?.sendError(message.channel);
            return false;
        }
    }
}
