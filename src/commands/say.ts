import { MessageAttachment, MessageEmbed } from "discord.js";
import { Command, CommandArgumentFlag } from "src/gm";
import { permLevels } from "../permissions";
import { stringToChannel } from "../utils/parsers";

type MC = { content: string | undefined, embed: MessageEmbed | undefined, attachments: MessageAttachment[] };
function constructMessage(content: string, flags: CommandArgumentFlag[], atts: MessageAttachment[]): MC {
    const fin: MC = { content: undefined, embed: undefined, attachments: [] };
    if (content) {
        fin.content = content;
    }
    if (flags.length) {
        for (const flag of flags) {
            if (!fin.embed) {
                fin.embed = new MessageEmbed();
                fin.embed.setDescription("");
            }
            if ((flag.name === "description" || flag.name === "desc") && flag.value) {
                fin.embed.setDescription(flag.value);
            }
            if ((flag.name === "color" || flag.name === "colour" || flag.name === "clr") && flag.value) {
                if (parseInt(flag.value, 10) && parseInt(flag.value, 10) <= 16777215) {
                    fin.embed.setColor(parseInt(flag.value, 10));
                } else {
                    const h = /^(?:0x|#)?([a-zA-Z0-9]{6})$/.exec(flag.value);
                    if (h && h[1]) {
                        fin.embed.setColor(parseInt(h[1], 16));
                    }
                }
            }
            if ((flag.name === "title" || flag.name === "tit") && flag.value) {
                fin.embed.setTitle(flag.value);
            }
            if ((flag.name === "footer" || flag.name === "foot") && flag.value) {
                fin.embed.footer = {
                    text: flag.value
                };
            }
            if (flag.name === "author" && flag.value) {
                fin.embed.setAuthor(flag.value);
            }
        }
    }
    if (atts.length) {
        fin.attachments.concat(atts);
    }
    return fin;
}

export const command: Command = {
    name: 'say',
    description: {
        short: "message through the bot",
        long: "Make the bot send something in chat. Embeds can also be sent through this command using argument flags (e.g. --description=\"guess who\")."
    },
    flags: [],// any arguments
    usage: "[channel] <bot message>",
    examples: [
        "--description=\"description content\" #channel outside message content",
        "--description=\"description content\"",
        "some text",
    ],
    args: true,
    guildOnly: true,
    permLevel: permLevels.mod,
    cooldown: 0,
    async execute(client, message, args, flags) {
        try {
            if (!args.length && !flags.length && !message.attachments.size) {// if no content
                await client.specials.sendError(message.channel, `Stuff to send was not specified.`);
                return;
            }
            if (!args.length && flags.length) {// if no normal text but embed options were specified
                args.push("");
            }
            const channel = stringToChannel(message.guild, args[0], false, false);
            if (channel && channel.isText()) {
                args.shift();
            }
            if (!args.length && !message.attachments.size) {// if no normal text content
                await client.specials.sendError(message.channel, `Stuff to send was not specified.`);
                return;
            }
            const made = constructMessage(args.join(" "), flags, [...message.attachments.values()]);
            if (channel && channel.isText()) {
                await channel.send(made);
            } else {
                await message.channel.send(made);
            }
            try {
                if (!channel && !flags.find(x => x.name === "nd")) {
                    await message.delete();
                }
            } catch (error) {
                //
            }
        } catch (error) {
            if (`${error}`.includes("Invalid Form Body")) {
                await client.specials.sendError(message.channel, `An error occurred. You probably tried to make an embed without a description.`);
                return;
            }
            xlg.error(error);
            await client.specials.sendError(message.channel);
            return false;
        }
    }
}
