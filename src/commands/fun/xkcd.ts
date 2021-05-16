
import { permLevels } from '../../permissions';
import { Command, XClient, XKCDEndpointResponse } from "src/gm";
import fetch from 'node-fetch';
import { randomIntFromInterval } from "../../utils/parsers";
import { CollectorFilter, DMChannel, MessageAttachment, MessageEmbed, NewsChannel, TextChannel } from "discord.js";

const HOST = "http://xkcd.com/";

async function getComic(number: number): Promise<XKCDEndpointResponse | number> {
    const r = await fetch(`${HOST}/${number}/info.0.json`);
    if (r.status !== 200) {
        return r.status;
    }
    const j: XKCDEndpointResponse = await r.json();
    return j;
}

function checkFilePerms(c: TextChannel | NewsChannel) {
    if (!c.guild.me) return false;
    if (!c.permissionsFor(c.guild.me)?.has("ATTACH_FILES")) {
        return false;
    }
    return true;
}

async function sendById(client: XClient, channel: TextChannel | DMChannel | NewsChannel, num: number, wid = "") {
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
        client.specials?.sendError(channel, "Comic could not be retrieved. Try again later.", true);
        return;
    }
}

async function sendComic(channel: TextChannel | DMChannel | NewsChannel, title: string, att: MessageAttachment, desc = "", issue: number, wid = "") {
    const s = await channel.send({
        embed: new MessageEmbed().setTitle(`${title}`).setImage(`${att.attachment}`).setColor("#2f3136").setFooter(`#${issue} ● caption hidden`)
    });
    await s.react("<:eye_2:830536828884221992>").catch(xlg.error);

    const filter: CollectorFilter = (r, u) => r.emoji.id === '830536828884221992' && u.id === wid;
    const collected = await s.awaitReactions(filter, {
        max: 1,
        time: 60000
    });
    if (collected && collected.size) {
        s.embeds[0].description = `${desc ? `${desc}` : "*no caption*"}`;
        if (s.embeds[0].footer) {
            s.embeds[0].footer.text = `#${issue}`;
        }
        await s.edit(new MessageEmbed(s.embeds[0]));
    }
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
    ownerOnly: false,
    permissions: ["ADD_REACTIONS", "ATTACH_FILES", "EMBED_LINKS", "USE_EXTERNAL_EMOJIS"],
    async execute(client, message, args) {
        try {
            if (!(message.channel instanceof TextChannel || message.channel instanceof NewsChannel) || !message.guild?.me) return;
            if (!args.length) {
                message.channel.send({
                    embed: {
                        color: await client.database.getColor("info"),
                        title: "xkcd comics",
                        description: `A command that lets you view xkcd comics.\nYou can use the following subcommands:
\`\`\`prolog
latest
byid
random
\`\`\``
                    }
                });
                return;
            }
            message.channel.startTyping();
            let ai = 0;
            switch (args[ai].toLowerCase()) {
                case "latest": {
                    if (!checkFilePerms(message.channel)) break;
                    ai++;
                    const o = args[ai];
                    if (o) {
                        client.specials?.sendError(message.channel, `No arguments are required for this subcommand`);
                        break;
                    }
                    try {
                        const r = await fetch(`${HOST}/info.0.json`);
                        const j: XKCDEndpointResponse = await r.json();
                        const attach = new MessageAttachment(`${j.img}`);
                        // await message.channel.send(`**${j.title || j.safe_title}**${j.alt ? `\n${j.alt}` : ""}`, attach);
                        // await message.channel.send(`**${j.title || j.safe_title}**`, [attach, new MessageEmbed().setDescription(`${j.alt ? `||${j.alt}||` : "*no caption*"}`).setColor("#2f3136")]);
                        sendComic(message.channel, j.safe_title || j.title, attach, j.alt, j.num, message.author.id);
                    } catch (error) {
                        client.specials?.sendError(message.channel, "Comic could not be retrieved. Try again later.", true);
                    }
                    break;
                }
                case "byid": {
                    if (!checkFilePerms(message.channel)) break;
                    ai++;
                    const o = args[ai];
                    if (!o) {
                        client.specials?.sendError(message.channel, `A strip ID is required for this subcommand`);
                        break;
                    }
                    if (args[ai + 1]) {
                        client.specials?.sendError(message.channel, `Only one (1) argument may be supplied`);
                        break;
                    }
                    if (!/^[0-9]+$/.test(o)) {
                        client.specials?.sendError(message.channel, `ID must be a number`);
                        break;
                    }
                    const pi = parseInt(o, 10);
                    sendById(client, message.channel, pi, message.author.id);
                    break;
                }
                case "random": {
                    if (!checkFilePerms(message.channel)) break;
                    ai++;
                    const o = args[ai];
                    if (o) {
                        client.specials?.sendError(message.channel, `No arguments are required for this subcommand`);
                        break;
                    }
                    const r = await fetch(`${HOST}/info.0.json`);
                    const j: XKCDEndpointResponse = await r.json();
                    const currentNumber = j.num;

                    sendById(client, message.channel, randomIntFromInterval(1, currentNumber), message.author.id);
                    break;
                }
                case "search": {
                    if (!checkFilePerms(message.channel)) break;
                    ai++;
                    const o = args.slice(1, args.length).join("+");
                    if (!o) {
                        client.specials?.sendError(message.channel, `A strip ID is required for this subcommand`);
                        break;
                    }
                    const sr = await fetch(`https://search-xkcd.mfwowocringe.repl.co/search/${o}`)
                    const j = await sr.json();
                    if (!j || sr.status !== 200 || j.status !== "Success" || typeof j.id !== "number") {
                        await client.specials.sendError(message.channel, "No search results found.\n\nThere may be a problem with the search service.", true);
                        break;
                    }
                    sendById(client, message.channel, j.id, message.author.id);
                    break;
                }
                default: {
                    // ai++;
                    const o = args[ai];
                    if (o && /^[0-9]+$/.test(o)) {
                        if (!checkFilePerms(message.channel)) break;
                        const pi = parseInt(o, 10);
                        sendById(client, message.channel, pi, message.author.id);
                        break;
                    }
                    client.specials?.sendError(message.channel, "No valid option was sent", true);
                    break;
                }
            }
            message.channel.stopTyping();
        } catch (error) {
            message.channel.stopTyping();
            xlg.error(error);
            await client.specials?.sendError(message.channel);
            return false;
        }
    }
}
