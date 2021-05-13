import { MessageEmbedOptions } from "discord.js";
import { Command } from "src/gm";
import { parseOptions } from "../../utils/parsers";
import { delayedLoop } from "../../utils/time";

//import { getGlobalSetting } from "../dbmanager";
export const command: Command = {
    name: 'poll',
    description: {
        short: "call a quick poll, or more (see help)",
        long: "Call a quick poll on the message the command was in. Specify poll options by separating them by semicolons.\n\nTo sepcify a custom title, prepend the command with `-t`, the first poll option will be used as the title. To remove the title and footer, prepend the command with `-m`.",
    },
    usage: "<poll options split by ;>",
    examples: [
        "one;two;three",
        "-t title;one;two;three",
        "-m one;two;three",
        "-m -t title;one;two;three"
    ],
    guildOnly: true,
    args: true,
    async execute(client, message, args) {
        try {
            let title = `Poll`;
            let footerText = `${message.author.tag}`;
            const useArgs = parseOptions(args);
            const opts = args.join(" ").split(";");
            if (useArgs.includes("-t") && useArgs.includes("-m")) {
                footerText = ``;
                title = opts.splice(0, 1)[0];
            } else if (useArgs.includes("-t")) {
                title = opts.splice(0, 1)[0];
            } else if (useArgs.includes("-m")) {
                title = ``;
                footerText = ``;
            }
            if (opts.includes("")) {
                client.specials?.sendError(message.channel, `Empty options are not allowed.`);
                return;
            }
            if (opts.length < 2) {
                client.specials?.sendError(message.channel, `At least **two** options are needed. ${opts.length} provided.\nSeparate with semicolons.`);
                return;
            }
            if (opts.length > 10) {
                client.specials?.sendError(message.channel, `A maximum of **10** options are allowed. ${opts.length} provided.`);
                return;
            }
            const emojis = ["<:1_:815735504825221121>", "<:2_:815735505047257119>", "<:3_:815735505085005835>", "<:4_:815735505085792327>", "<:5_:815735505538777108>", "<:6_:815735505642586152>", "<:7_:815735505961615391>", "<:8_:815735505982849054>", "<:9_:815735505664737321>", "<:10:815735505760682035>"]
            //const optEmojis: string[] = [];
            const options = opts.map((w, i) => {
                //optEmojis.push(emojis[i]);
                return `${emojis[i]} ${w[0].toUpperCase() + w.substring(1)}`;
            });
            const embed: MessageEmbedOptions = {
                color: await client.database.getColor("info"),
                title,
                description: options.join("\n"),
                image: {},
                footer: {
                    text: footerText
                }
            }
            if (message.attachments.size) {
                embed.image = {
                    url: message.attachments.first()?.url
                }
            }
            const voteEmbed = await message.channel.send({ embed });
            const loop = delayedLoop(0, options.length, 1, 1500);
            for await (const i of loop) {
                try {
                    const e = emojis[i];
                    await voteEmbed.react(e);
                } catch (error) {
                    //
                }
            }
            if (!message.deleted) {
                await message.delete().catch();
            }
        } catch (error) {
            xlg.error(error);
            await client.specials?.sendError(message.channel);
            return false;
        }
    }
}

