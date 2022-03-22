import { MessageEmbedOptions } from "discord.js";
import { Command } from "src/gm";
import { delayedLoop } from "../../utils/time.js";

export const command: Command = {
    name: 'poll',
    description: {
        short: "call a quick poll, or more (see help)",
        long: "Call a quick poll on the message the command was in. Specify poll options by separating them by semicolons.",
    },
    usage: "<poll options split by ;>",
    flags: [
        {
            f: "t",
            d: "specify a custom title in the poll header",
            v: "custom title"
        },
        {
            f: "m",
            d: "remove the title and footer (combined with t removes only the footer)",
        },
    ],
    examples: [
        "one;two;three",
        "-t title;one;two;three",
        "-m one;two;three",
        "-m -t title;one;two;three"
    ],
    guildOnly: true,
    args: true,
    permissions: ["ADD_REACTIONS", "MANAGE_MESSAGES"],
    async execute(client, message, args, flags) {
        try {
            let title = `Poll`;
            let footerText = `${message.author.tag.escapeDiscord()}`;
            const opts = args.join(" ").split(";");
            const tf = flags.find(x => x.name === "t");
            const mf = flags.find(x => x.name === "m");
            if (tf && mf) {
                if (!tf.value) {
                    await client.specials.sendError(message.channel, `You didn't give a title value.\n\`-t="enter title here"\``);
                    return;
                }
                footerText = ``;
                title = tf.value;
            } else if (tf) {
                if (!tf.value) {
                    await client.specials.sendError(message.channel, `You didn't give a title value.\n\`-t="enter title here"\``);
                    return;
                }
                title = tf.value;
            } else if (mf) {
                title = ``;
                footerText = ``;
            }
            if (opts.includes("")) {
                await client.specials.sendError(message.channel, `Empty options are not allowed.`);
                return;
            }
            if (opts.length < 2) {
                await client.specials.sendError(message.channel, `At least **two** options are needed. ${opts.length} provided.\nSeparate with semicolons.`);
                return;
            }
            if (opts.length > 10) {
                await client.specials.sendError(message.channel, `A maximum of **10** options are allowed. ${opts.length} provided.`);
                return;
            }
            const emojis = message.guild.me && message.channel.permissionsFor(message.guild.me).has("USE_EXTERNAL_EMOJIS") ? ["<:1_:815735504825221121>", "<:2_:815735505047257119>", "<:3_:815735505085005835>", "<:4_:815735505085792327>", "<:5_:815735505538777108>", "<:6_:815735505642586152>", "<:7_:815735505961615391>", "<:8_:815735505982849054>", "<:9_:815735505664737321>", "<:10:815735505760682035>"] : ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣", "🔟"];
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
            const voteEmbed = await message.channel.send({ embeds: [embed] });
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
                try {
                    await message.delete();
                } catch (error) {
                    //
                }
            }
        } catch (error) {
            xlg.error(error);
            await client.specials.sendError(message.channel);
            return false;
        }
    }
}
