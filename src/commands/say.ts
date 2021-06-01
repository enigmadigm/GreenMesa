import { MessageEmbed, NewsChannel, TextChannel } from "discord.js";
import { Command, CommandArgumentFlag, GuildMessageProps } from "src/gm";
import { permLevels } from "../permissions";
import { stringToChannel } from "../utils/parsers";

type MC = { content: string | null, embed: MessageEmbed | undefined };
function constructMessage(content: string, flags: CommandArgumentFlag[]): MC {
    const fin: MC = { content: null, embed: undefined };
    if (content) {
        fin.content = content;
    }
    if (flags.length) {
        for (const flag of flags) {
            if (!fin.embed) fin.embed = new MessageEmbed();
            fin.embed.setDescription("");
            if (flag.name === "description" && flag.value) {
                fin.embed.setDescription(flag.value);
            }
            if (flag.name === "color" && flag.value) {
                if (parseInt(flag.value, 10) && parseInt(flag.value, 10) <= 16777215) {
                    fin.embed.setColor(parseInt(flag.value, 10));
                } else {
                    const h = /^(?:0x|#)?([a-zA-Z0-9]{6})$/.exec(flag.value);
                    if (h && h[1]) {
                        fin.embed.setColor(parseInt(h[1], 16));
                    }
                }
            }
            if (flag.name === "title" && flag.value) {
                fin.embed.setTitle(flag.value);
            }
            if (flag.name === "footer" && flag.value) {
                fin.embed.setFooter(flag.value);
            }
            if (flag.name === "author" && flag.value) {
                fin.embed.setAuthor(flag.value);
            }
        }
    }
    return fin;
}

export const command: Command<GuildMessageProps> = {
    name: 'say',
    description: {
        short: "message through the bot",
        long: "Make the bot send something in chat. Embeds can also be sent through this command using argument flags (e.g. --description=\"guess who\")."
    },
    flags: [],
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
            if (!args.length && flags.length) {
                args.push("");
            }
            const channel = stringToChannel(message.guild, args[0], false, false);
            if (channel && (channel instanceof TextChannel || channel instanceof NewsChannel)) {
                args.shift();
            }
            if (!args.length) {
                await client.specials.sendError(message.channel, `Stuff to send was not specified.`);
                return;
            }
            const made = constructMessage(args.join(" "), flags);
            await message.channel.send(made);
            try {
                if (!channel) {
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
