import { permLevels } from '../../permissions';
import { Command, XClient, XKCDEndpointResponse } from "src/gm";
import fetch from 'node-fetch';
import { randomIntFromInterval } from "../../utils/parsers";
import { CollectorFilter, DMChannel, MessageAttachment, MessageEmbed, MessageReaction, NewsChannel, TextChannel, ThreadChannel, User } from "discord.js";

const HOST = "http://xkcd.com/";

async function getComic(number: number): Promise<XKCDEndpointResponse | number> {
    const r = await fetch(`${HOST}/${number}/info.0.json`);
    if (r.status !== 200) {
        return r.status;
    }
    const j: XKCDEndpointResponse = await r.json();
    return j;
}

async function sendById(client: XClient, channel: TextChannel | DMChannel | NewsChannel | ThreadChannel, num: number, wid = "") {
    try {
        const c = await getComic(num);
        if (c === 404) {
            client.specials?.sendError(channel, "Comic does not exist. Yet.", true);
            return;
        }
        if (typeof c === "number") {
            client.specials?.sendError(channel, "xkcd gave an unexpected response.", true);
            return;
        }

        const attach = new MessageAttachment(`${c.img}`);
        // await channel.send(`**${c.title || c.safe_title}**`, [attach, new MessageEmbed().setDescription(`${c.alt ? `||${c.alt}||` : "*no caption*"}`).setColor("#2f3136")]);
        await sendComic(channel, c.safe_title || c.title, attach, c.alt, c.num, wid)
    } catch (error) {
        await client.specials.sendError(channel, "Comic could not be retrieved. Try again later.", true);
        return;
    }
}

async function sendComic(channel: TextChannel | DMChannel | NewsChannel | ThreadChannel, title: string, att: MessageAttachment, desc = "", issue: number, wid = "") {
    const s = await channel.send({
        embeds: [new MessageEmbed().setTitle(`${title}`).setImage(`${att.attachment}`).setColor("#2f3136").setFooter(`#${issue} ● caption hidden`)]
    });
    await s.react("<:eye_2:830536828884221992>").catch(xlg.error);

    const filter: CollectorFilter<[MessageReaction, User]> = (r, u) => r.emoji.id === '830536828884221992' && u.id === wid;
    const collector = s.createReactionCollector({
        filter,
        max: 1,
        time: 60000
    });
    collector.on("collect", async () => {
        s.embeds[0].description = `${desc ? `${desc}` : "*no caption*"}`;
        if (s.embeds[0].footer) {
            s.embeds[0].footer.text = `#${issue}`;
        }
        await s.edit({ embeds: [new MessageEmbed(s.embeds[0])] }).catch(xlg.error);
    });
}

export const command: Command = {
    name: "xkcd",
    description: {
        short: "get xkcd comics",
        long: "Get xkcd comics or info about them. Send `xkcd latest` for the latest comic."
    },
    usage: "[latest|byid|random|search] ...options]",
    examples: [
        "1000",
        "random",
        "search house of pancakes",
    ],
    args: false,
    cooldown: 1,
    permLevel: permLevels.member,
    guildOnly: true,
    permissions: ["ADD_REACTIONS", "ATTACH_FILES", "USE_EXTERNAL_EMOJIS"],
    async execute(client, message, args) {
        try {
            if (!args.length) {
                await message.channel.send({
                    embeds: [{
                        color: await client.database.getColor("info"),
                        title: "xkcd comics",
                        description: `A command that lets you view xkcd comics.\nYou can use the following subcommands:
\`\`\`prolog
latest
byid
random
\`\`\``
                    }],
                });
                return;
            }
            message.channel.startTyping();
            let ai = 0;
            switch (args[ai].toLowerCase()) {
                case "latest": {
                    ai++;
                    const o = args[ai];
                    if (o) {
                        await client.specials.sendError(message.channel, `No arguments are required for this subcommand`);
                        break;
                    }
                    try {
                        const r = await fetch(`${HOST}/info.0.json`);
                        const j: XKCDEndpointResponse = await r.json();
                        const attach = new MessageAttachment(`${j.img}`);
                        // await message.channel.send(`**${j.title || j.safe_title}**${j.alt ? `\n${j.alt}` : ""}`, attach);
                        // await message.channel.send(`**${j.title || j.safe_title}**`, [attach, new MessageEmbed().setDescription(`${j.alt ? `||${j.alt}||` : "*no caption*"}`).setColor("#2f3136")]);
                        await sendComic(message.channel, j.safe_title || j.title, attach, j.alt, j.num, message.author.id);
                    } catch (error) {
                        await client.specials.sendError(message.channel, "Comic could not be retrieved. Try again later.", true);
                    }
                    break;
                }
                case "byid": {
                    ai++;
                    const o = args[ai];
                    if (!o) {
                        await client.specials.sendError(message.channel, `A strip ID is required for this subcommand`);
                        break;
                    }
                    if (args[ai + 1]) {
                        await client.specials.sendError(message.channel, `Only one (1) argument may be supplied`);
                        break;
                    }
                    if (!/^[0-9]+$/.test(o)) {
                        await client.specials.sendError(message.channel, `ID must be a number`);
                        break;
                    }
                    const pi = parseInt(o, 10);
                    await sendById(client, message.channel, pi, message.author.id);
                    break;
                }
                case "random": {
                    ai++;
                    const o = args[ai];
                    if (o) {
                        await client.specials.sendError(message.channel, `No arguments are required for this subcommand`);
                        break;
                    }
                    const r = await fetch(`${HOST}/info.0.json`);
                    const j: XKCDEndpointResponse = await r.json();
                    const currentNumber = j.num;
                    
                    await sendById(client, message.channel, randomIntFromInterval(1, currentNumber), message.author.id);
                    break;
                }
                case "search": {
                    ai++;
                    const o = args.slice(1, args.length).join("+");
                    if (!o) {
                        await client.specials.sendError(message.channel, `A strip ID is required for this subcommand`);
                        break;
                    }
                    const sr = await fetch(`https://search-xkcd.mfwowocringe.repl.co/search/${o}`)
                    const j = await sr.json();
                    if (!j || sr.status !== 200 || j.status !== "Success" || typeof j.id !== "number") {
                        await client.specials.sendError(message.channel, "No search results found.\n\nThere may be a problem with the search service.", true);
                        break;
                    }
                    await sendById(client, message.channel, j.id, message.author.id);
                    break;
                }
                default: {
                    // ai++;
                    const o = args[ai];
                    if (o && /^[0-9]+$/.test(o)) {
                        const pi = parseInt(o, 10);
                        await sendById(client, message.channel, pi, message.author.id);
                        break;
                    }
                    await client.specials.sendError(message.channel, "No valid option was sent", true);
                    break;
                }
            }
            message.channel.stopTyping();
        } catch (error) {
            message.channel.stopTyping();
            xlg.error(error);
            await client.specials.sendError(message.channel);
            return false;
        }
    }
}
