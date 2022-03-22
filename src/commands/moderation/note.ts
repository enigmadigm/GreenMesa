import { permLevels } from '../../permissions.js';
import { Command, GuildMessageProps, UserNote } from "src/gm";
import { stringToMember } from "../../utils/parsers.js";
import moment from 'moment';
const charlimit = 1000;

export const command: Command<GuildMessageProps> = {
    name: "note",
    description: {
        short: "add a note to a user",
        long: "Add a note to a user in the guild."
    },
    usage: "<member> <note>",
    examples: [
        "@Darth Pissed off the mods today"
    ],
    args: true,
    cooldown: 1,
    permLevel: permLevels.mod,
    moderation: false,
    guildOnly: true,
    async execute(client, message, args) {
        try {
            const target = await stringToMember(message.guild, args[0], true, true, true);
            if (!target) {
                await client.specials.sendError(message.channel, `Could not find target`);
                return;
            }
            args.shift();
            if (!args.length) {
                await client.specials.sendError(message.channel, `You did not specify a note\n\`<user> <note>\``);
                return;
            }
            const gud = await client.database.getGuildUserData(message.guild.id, target.id);
            if (!gud) {
                await client.specials.sendError(message.channel, `Could not retrieve user info`);
                return;
            }
            const notes: UserNote[] = gud.modnote && gud.modnote.length ? JSON.parse(gud.modnote) : [];

            /* no longer restricting number of notes per user */
            // if (notes.length >= 10) {
            //     client.specials?.sendError(message.channel, `No more than **10** notes are allowed per user.\n\nThis is to allow all notes to fit on one page without exceeding Discord's character limit.`)
            //     return;
            // }

            const a = args.join(" ");
            if (a.length > charlimit) {
                client.specials?.sendError(message.channel, `You have exceeded the **${charlimit}** character limit. You are over by **${a.length - charlimit}** characters.`)
                return;
            }
            notes.push({
                id: notes.length ? notes.reduce((p, c) => p.id > c.id ? p : c).id + 1 : 1,
                authorID: message.author.id,
                author: message.author.tag,
                content: a,
                created: moment().format('YYYY-MM-DD HH:mm:ss'),
                updated: moment().format('YYYY-MM-DD HH:mm:ss'),
            });

            gud.modnote = JSON.stringify(notes).escapeSpecialChars();
            await client.database.updateGuildUserData(gud);
            await client.specials.sendInfo(message.channel, `Note added (ID: ${notes[notes.length - 1].id})`);
        } catch (error) {
            xlg.error(error);
            await client.specials.sendError(message.channel);
            return false;
        }
    }
}
