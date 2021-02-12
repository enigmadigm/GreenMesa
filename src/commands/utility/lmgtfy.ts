import xlg from '../../xlogger';
import puppeteer from 'puppeteer';
import Discord, { DMChannel } from 'discord.js';
import { Command } from 'src/gm';

export const command: Command = {
    name: 'lmgtfy',
    description: 'teach an idiot how to google, or just get a search link',
    aliases:['search', 'google', 'iie'],
    usage:"[explainer: -e] [plain text link: -t] <search terms>",
    args: true,
    guildOnly: true,
    async execute(client, message, args) {
        try {
            if (!message.guild) return;
            let sengine = "google.com/search";
            let iie = "";
            let plainText = false;
            let sc;
            const sterms = encodeURIComponent(args.join(" "));
            if (args.join(' ').startsWith('-e -t') || args.join(' ').startsWith('-t -e')) {
                sengine = "lmgtfy.com/";
                iie = "&iie=1";
                args.shift();
                args.shift();
                plainText = true;
            } else if (args[0] == '-e') {
                sengine = "lmgtfy.com/";
                iie = "&iie=1";
                args.shift();
            } else if (args[0] == '-t') {
                plainText = true;
                args.shift();
            } else {
                plainText = false;
                message.channel.startTyping();
                const browser = await puppeteer.launch({
                    defaultViewport: {
                        width: 1300,
                        height: 950
                    },
                    args: ['--lang="en-US"']
                });
                const page = await browser.newPage();
                await page.setExtraHTTPHeaders({// https://stackoverflow.com/a/47292022/10660033
                    'Accept-Language': 'en'
                });
                await page.goto(`https://google.com/search?q=${sterms}${(!(message.channel instanceof DMChannel) && message.channel.nsfw) ? "" : "&safe=active"}&hl=en`);
                sc = await page.screenshot();
                await browser.close();
            }
            if (plainText == true) {
                message.channel.send(`https://${sengine}?q=${sterms}${iie}`);
            } else {
                if (sc) {
                    const embed = {
                        "description": `[Let Me Get That For You](https://${sengine}?q=${sterms}${iie})`,
                        "color": 15277667,
                        "image": {
                            "url": 'attachment://screenshot.png'
                        }
                    }
                    const scfile = new Discord.MessageAttachment(sc, 'screenshot.png');
                    await message.channel.send({ files: [scfile], embed: embed });
                    message.channel.stopTyping();
                    return;
                }
                message.channel.send({
                    embed: {
                        "description": `[Your answer](https://${sengine}?q=${sterms}${iie})`,
                        "color": 15277667
                    }
                });
            }
        } catch (error) {
            message.channel.stopTyping(true);
            xlg.error(error);
            await client.specials?.sendError(message.channel);
            return false;
        }
    }
}

