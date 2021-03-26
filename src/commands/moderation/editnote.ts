import xlg from "../../xlogger";
import { permLevels } from '../../permissions';
import { Command, UserNote } from "src/gm";
import { stringToMember } from "../../utils/parsers";
import moment from 'moment';

export const command: Command = {
    name: "editnote",
    description: {
        short: "edit user notes",
        long: "Edit a member's note. Specify the note id and the new content."
    },
    usage: "<member> <id> <new note>",
    examples: [
        "sm editnote @Darth 6 Pissed off the mods again today"
    ],
    args: true,
    cooldown: 2,
    permLevel: permLevels.mod,
    moderation: false,
    guildOnly: true,
    async execute(client, message, args) {
        try {
            if (!message.guild) return;
            const target = await stringToMember(message.guild, args[0], true, true, true);
            if (!target) {
                await client.specials?.sendError(message.channel, `Could not find target`);
                return;
            }
            args.shift();
            if (!args.length) {
                await client.specials?.sendError(message.channel, `You did not specify an id\n\`<user> <id> <note>\``);
                return;
            }
            if (!/^[0-9]{1,100}$/.test(args[0])) {
                await client.specials?.sendError(message.channel, `The id must be a number`);
                return;
            }
            const id = parseInt(args[0], 10);
            args.shift();
            if (!args.length) {
                await client.specials?.sendError(message.channel, `You did not specify a note\n\`<user> <id> <note>\``);
                return;
            }
            const a = args.join(" ");
            const gud = await client.database.getGuildUserData(message.guild.id, target.id);
            if (!gud) {
                await client.specials?.sendError(message.channel, `Could not retrieve user info`);
                return;
            }
            const notes: UserNote[] = gud.modnote && gud.modnote.length ? JSON.parse(gud.modnote) : [];
            if (a.length > 500) {
                client.specials?.sendError(message.channel, `You have exceeded the **500** character limit. You are over by **${a.length - 500}** characters.`)
                return;
            }
            const note = notes.find((x) => x.id === id);
            if (!note) {
                await client.specials?.sendError(message.channel, `A note with that ID does not exist`);
                return;
            }
            note.content = a;
            note.updated = moment().format('YYYY-MM-DD HH:mm:ss');

            gud.modnote = JSON.stringify(notes).escapeSpecialChars();
            await client.database.updateGuildUserData(gud);
            await client.specials?.sendInfo(message.channel, "Note edited");
        } catch (error) {
            xlg.error(error);
            await client.specials?.sendError(message.channel);
            return false;
        }
    }
}
