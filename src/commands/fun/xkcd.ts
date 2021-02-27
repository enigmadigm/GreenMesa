import xlg from "../../xlogger";
import { permLevels } from '../../permissions';
import { Command, XKCDEndpointResponse } from "src/gm";
import fetch from 'node-fetch';
import { randomIntFromInterval } from "../../utils/parsers";
import { MessageAttachment, NewsChannel, TextChannel } from "discord.js";

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

export const command: Command = {
    name: "xkcd",
    description: {
        short: "get xkcd comics",
        long: "Get xkcd comics or info about them. Send `xkcd latest` for the latest comic."
    },
    usage: "[latest|byid|random] ...options]",
    args: false,
    specialArgs: undefined,
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
                        color: await client.database?.getColor("info_embed_color"),
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
            let ai = 0;
            switch (args[ai]) {
                case "latest": {
                    if (!checkFilePerms(message.channel)) break;
                    ai++;
                    const o = args[ai];
                    if (o) {// ADD AN OPTION TO SEE VERBOSE OUTPUT (SHOWS ADDITIONAL INFO THAN JUST IMAGE)
                        client.specials?.sendError(message.channel, `No arguments are required for this subcommand`);
                        break;
                    }
                    try {
                        const r = await fetch(`${HOST}/info.0.json`);
                        const j: XKCDEndpointResponse = await r.json();
                        /*await message.channel.send({
                            embed: {
                                color: await client.database?.getColor("info_embed_color"),

                            }
                        })*/
                        const attach = new MessageAttachment(`${j.img}`);
                        /*if (!attach.height) {
                            client.specials?.sendError(message.channel, `No image could be found.`);
                            break;
                        }*/
                        await message.channel.send(`**${j.title || j.safe_title}**${j.alt ? `\n${j.alt}` : ""}`, attach);
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
                    try {
                        const c = await getComic(pi);
                        if (c === 404) {
                            client.specials?.sendError(message.channel, "Comic does not exist. Yet.", true);
                            break;
                        }
                        if (typeof c === "number") {
                            client.specials?.sendError(message.channel, "xkcd gave an unexpected response.", true);
                            break;
                        }

                        const attach = new MessageAttachment(`${c.img}`);
                        /*if (!attach.height) {
                            client.specials?.sendError(message.channel, `No image could be found.`);
                            break;
                        }*/
                        await message.channel.send(`**${c.title || c.safe_title}**${c.alt ? `\n${c.alt}` : ""}`, attach);
                    } catch (error) {
                        client.specials?.sendError(message.channel, "Comic could not be retrieved. Try again later.", true);
                    }
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
                    try {
                        const r = await fetch(`${HOST}/info.0.json`);
                        const j: XKCDEndpointResponse = await r.json();
                        const currentNumber = j.num;
                        const c = await getComic(randomIntFromInterval(1, currentNumber));
                        if (c === 404) {
                            client.specials?.sendError(message.channel, "Comic does not exist. Yet.", true);
                            break;
                        }
                        if (typeof c === "number") {
                            client.specials?.sendError(message.channel, "xkcd gave an unexpected response.", true);
                            break;
                        }

                        const attach = new MessageAttachment(`${c.img}`);
                        /*if (!attach.height) {
                            client.specials?.sendError(message.channel, `No image could be found.`);
                            break;
                        }*/
                        await message.channel.send(`**${c.title || c.safe_title}**${c.alt ? `\n${c.alt}` : ""}`, attach);
                    } catch (error) {
                        client.specials?.sendError(message.channel, "Comic could not be retrieved. Try again later.", true);
                    }
                    break;
                }
                default: {
                    ai++;
                    const o = args[ai];
                    if (o && /^[0-9]+$/.test(o)) {
                        if (!checkFilePerms(message.channel)) break;
                        const pi = parseInt(o, 10);
                        try {
                            const c = await getComic(pi);
                            if (c === 404) {
                                client.specials?.sendError(message.channel, "Comic does not exist. Yet.", true);
                                break;
                            }
                            if (typeof c === "number") {
                                client.specials?.sendError(message.channel, "xkcd gave an unexpected response.", true);
                                break;
                            }

                            const attach = new MessageAttachment(`${c.img}`);
                            /*if (!attach.height) {
                                client.specials?.sendError(message.channel, `No image could be found.`);
                                break;
                            }*/
                            await message.channel.send(`**${c.title || c.safe_title}**${c.alt ? `\n${c.alt}` : ""}`, attach);
                        } catch (error) {
                            client.specials?.sendError(message.channel, "Comic could not be retrieved. Try again later.", true);
                        }
                    }
                    client.specials?.sendError(message.channel, "No valid option was sent", true);
                    break;
                }
            }
        } catch (error) {
            xlg.error(error);
            await client.specials?.sendError(message.channel);
            return false;
        }
    }
}
