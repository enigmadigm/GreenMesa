import xlg from "../../xlogger";
import { permLevels } from '../../permissions';
import { Command, XClient, XKCDEndpointResponse } from "src/gm";
import fetch from 'node-fetch';
import { randomIntFromInterval } from "../../utils/parsers";
import { DMChannel, MessageAttachment, MessageEmbed, NewsChannel, TextChannel } from "discord.js";

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

async function sendById(client: XClient, channel: TextChannel | DMChannel | NewsChannel, num: number) {
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
        await sendComic(channel, c.title || c.safe_title, attach, c.alt, c.num)
    } catch (error) {
        client.specials?.sendError(channel, "Comic could not be retrieved. Try again later.", true);
        return;
    }
}

async function sendComic(channel: TextChannel | DMChannel | NewsChannel, title: string, att: MessageAttachment, desc = "", issue: number) {
    await channel.send(`**${title}** - #${issue}`, [
        att,
        new MessageEmbed().setDescription(`${desc ? `||${desc}||` : "*no caption*"}`).setColor("#2f3136")
    ]);
}

export const command: Command = {
    name: "xkcd",
    description: {
        short: "get xkcd comics",
        long: "Get xkcd comics or info about them. Send `xkcd latest` for the latest comic."
    },
    usage: "[latest|byid|random] ...options]",
    args: false,
    cooldown: 1,
    permLevel: permLevels.member,
    moderation: undefined,
    guildOnly: true,
    ownerOnly: false,
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
                        await sendComic(message.channel, j.title || j.safe_title, attach, j.alt, j.num);
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
                    await sendById(client, message.channel, pi);
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

                    await sendById(client, message.channel, randomIntFromInterval(1, currentNumber));
                    break;
                }
                default: {
                    // ai++;
                    const o = args[ai];
                    if (o && /^[0-9]+$/.test(o)) {
                        if (!checkFilePerms(message.channel)) break;
                        const pi = parseInt(o, 10);
                        await sendById(client, message.channel, pi);
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
