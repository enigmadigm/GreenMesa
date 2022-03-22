
import { permLevels } from '../../permissions.js';
import { Command, UserNote } from "src/gm";
import { stringToMember } from "../../utils/parsers.js";

export const command: Command = {
    name: "rmnote",
    description: {
        short: "delete user notes",
        long: "Delete a member's note."
    },
    usage: "<member> <id>",
    examples: [
        "@Darth 6"
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
                await client.specials?.sendError(message.channel, `You did not specify an id\n\`<user> <id>\``);
                return;
            }
            if (!/^[0-9]{1,100}$/.test(args[0])) {
                await client.specials?.sendError(message.channel, `The id must be a number`);
                return;
            }
            const id = parseInt(args[0], 10);
            args.shift();
            const gud = await client.database.getGuildUserData(message.guild.id, target.id);
            if (!gud) {
                await client.specials?.sendError(message.channel, `Could not retrieve user info`);
                return;
            }
            const notes: UserNote[] = gud.modnote && gud.modnote.length ? JSON.parse(gud.modnote) : [];
            const note = notes.find((x) => x.id === id);
            if (!note) {
                await client.specials?.sendError(message.channel, `A note with that ID does not exist`);
                return;
            }
            notes.splice(notes.indexOf(note), 1);

            gud.modnote = JSON.stringify(notes).escapeSpecialChars();
            await client.database.updateGuildUserData(gud);
            await client.specials?.sendInfo(message.channel, "Note deleted");
        } catch (error) {
            xlg.error(error);
            await client.specials?.sendError(message.channel);
            return false;
        }
    }
}
