import xlg from '../../xlogger';
import puppeteer from 'puppeteer';
import Discord, { DMChannel, MessageEmbedOptions } from 'discord.js';
import { Command } from 'src/gm';

const preload = `
// overwrite the \`languages\` property to use a custom getter
Object.defineProperty(navigator, "languages", {
  get: function() {
    return ["en-US", "en"];
  };
});

// overwrite the \`plugins\` property to use a custom getter
Object.defineProperty(navigator, 'plugins', {
  get: function() {
    // this just needs to have \`length > 0\`, but we could mock the plugins too
    return [1, 2, 3, 4, 5];
  },
});
`;

const pageArgs = [
    '--lang="en-US"',
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-infobars',
    '--window-position=0,0',
    '--ignore-certifcate-errors',
    '--ignore-certifcate-errors-spki-list',
    '--user-agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3312.0 Safari/537.36"'
];

const opts: puppeteer.LaunchOptions = {
    defaultViewport: {
        width: 1300,
        height: 950
    },
    ignoreHTTPSErrors: true,
    args: pageArgs
};

async function goMarionette(dest: string): Promise<{page: puppeteer.Page, browser: puppeteer.Browser}> {
    const browser = await puppeteer.launch(opts);
    const page = await browser.newPage();
    await page.setExtraHTTPHeaders({// https://stackoverflow.com/a/47292022/10660033
        'Accept-Language': 'en'
    });
    await page.evaluateOnNewDocument(preload);
    /*page.on("request", r => {// when this is used, puppeteer throws an 'Interception not enabled!' error
        if (
            ["image", "stylesheet", "font", "script"].indexOf(r.resourceType()) !== -1
        ) {
            r.abort();
        } else {
            r.continue();
        }
    });*/
    await page.goto(dest);
    return { page, browser };
}

export const command: Command = {
    name: 'lmgtfy',
    description: {
        short: "teach the uninformed how to google",
        long: "Teach the uninformed how to google, or just get a search link."
    },
    aliases:['search', 'google', 'iie'],
    usage:"[explainer: -e] [plain text link: -t] <search terms>",
    args: true,
    guildOnly: true,
    async execute(client, message, args) {
        try {
            if (!message.guild) return;

            const useArgs: string[] = args.reduce((p, c, ci) => {
                const condition = (pcv: string) => pcv.startsWith("-") && pcv.length < 20;
                if (p.length === ci && condition(c)) {
                    //useArgs.push(c);
                    p.push(c);
                    args.shift();
                }
                return p;
            }, <string[]>[]);

            let sengine = "google.com/search";
            let iie = "";
            let plainText = false;
            let sc;
            const sterms = encodeURIComponent(args.join(" "));
            if (useArgs.includes('-t') && useArgs.includes('-e')) {
                sengine = "lmgtfy.app/";
                iie = "&iie=1";
                plainText = true;
            } else if (useArgs.includes('-e')) {
                sengine = "lmgtfy.app/";
                iie = "&iie=1";
            } else if (useArgs.includes('-t')) {
                plainText = true;
            } else {
                plainText = false;
                message.channel.startTyping();
                const {page, browser} = await goMarionette(`https://google.com/search?q=${sterms}${(!(message.channel instanceof DMChannel) && message.channel.nsfw) ? "" : "&safe=active"}&hl=en`);
                sc = await page.screenshot();
                await browser.close();
            }
            if (plainText == true) {
                await message.channel.send(`https://${sengine}?q=${sterms}${iie}`);
            } else {
                if (sc) {
                    const embed: MessageEmbedOptions = {
                        description: `[Let Me Google That For You](https://${sengine}?q=${sterms}${iie})`,
                        color: 0x2F3136,
                        image: {
                            url: 'attachment://screenshot.png'
                        },
                        footer: {
                            text: (!(message.channel instanceof DMChannel) && message.channel.nsfw) ? undefined : "Safe Search On"
                        }
                    }
                    const scfile = new Discord.MessageAttachment(sc, 'screenshot.png');
                    await message.channel.send({ files: [scfile], embed: embed });
                    message.channel.stopTyping();
                    return;
                }
                await message.channel.send({
                    embed: {
                        description: `[Let Me Google That For You](https://${sengine}?q=${sterms}${iie})`,
                        color: 0xF4B400
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

