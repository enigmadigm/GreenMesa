import puppeteer from 'puppeteer';
import Discord, { DMChannel, MessageEmbedOptions } from 'discord.js';
import { Command } from 'src/gm';
import { PaginationExecutor } from '../../utils/pagination';

//TODO: provide the first few links that result from the search

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
    const contexts = browser.browserContexts();
    contexts[0].overridePermissions("https://google.com", [
        "geolocation"
    ]);
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
    await page.setGeolocation({ latitude: 34.0536909, longitude: -118.242766 });
    await page.goto(dest);
    return { page, browser };
    // Clicks on an element at position x,y https://stackoverflow.com/a/60254260/10660033
    /* async function clickOnElement(elem, x = null, y = null) {
        const rect = await page.evaluate(el => {
            const { top, left, width, height } = el.getBoundingClientRect();
            return { top, left, width, height };
        }, elem);

        // Use given position or default to center
        const _x = x !== null ? x : rect.width / 2;
        const _y = y !== null ? y : rect.height / 2;

        await page.mouse.click(rect.left + _x, rect.top + _y);
    } */
}

export const command: Command = {
    name: 'lmgtfy',
    description: {
        short: "teach the uninformed how to google",
        long: "Teach the uninformed how to google, or just get a search link.",
    },
    flags: [
        {
            f: "t",
            d: "get a plaintext link",
        },
        {
            f: "e",
            d: "get an explainer link (lmgtfy.app)",
        },
        {
            f: "i",
            d: "search google images",
            v: "something something "
        },
        {
            f: "l",
            d: "light mode (with capture search mode)",
        },
    ],
    aliases:['search', 'google', 'iie'],
    usage:"[explainer: -e] [plain text link: -t] [google images: -i] [light mode: -l] <search terms>",
    args: true,
    guildOnly: true,
    async execute(client, message, args, flags) {
        try {
            if (!message.guild) return;

            let dark = true;
            let sengine = "google.com/search";
            let iie = "";
            let plainText = false;
            let sc;
            const sterms = encodeURIComponent(args.join(" "));
            /*if (useArgs.includes('-t') && useArgs.includes('-e')) {
                sengine = "lmgtfy.app/";
                iie = "&iie=1";
                plainText = true;
            }*/
            if (flags.find(x => x.name === 'e')) {
                sengine = "lmgtfy.app/";
                iie = "&iie=1";
            } else if (flags.find(x => x.name === 'i')) {
                sengine = "google.com/images";
            }
            if (flags.find(x => x.name === 't')) {
                plainText = true;
            }
            if (flags.find(x => x.name === 'l')) {
                dark = false;
            }

            if (!flags.length || (!flags.find(x => x.name === "e") && !flags.find(x => x.name === "t"))) {
                plainText = false;
                message.channel.startTyping();
                const { page, browser } = await goMarionette(`https://${sengine}?q=${sterms}${(!(message.channel instanceof DMChannel) && message.channel.nsfw) ? "" : "&safe=active"}&hl=en`);
                const voiceElement = await page.$$('[aria-label*="Search by voice"],.clear-button,.gb_Xd');
                voiceElement.forEach((e) => {
                    e.evaluate(node => node.style.display = 'none');
                });
                if (sengine === "google.com/images") {
                    const cameraElement = await page.$$('[aria-label*="Search by image"],scrolling-carousel,body > div > c-wiz > div:nth-child(1),body > div > c-wiz > div:nth-child(1)');
                    cameraElement.forEach((e) => {
                        e.evaluate(node => node.style.display = 'none');
                    });
                } else {
                    const miniappsElement = await page.$$('[data-async-type*="miniapps"],.ULSxyf,#top_nav');
                    miniappsElement.forEach((e) => {
                        e.evaluate(node => node.style.display = 'none');
                    });
                }
                if (dark) {
                    // await page.addStyleTag({ url: `${client.specials.getBackendRoot()}/css/dr-google.css` });
                }
                sc = await page.screenshot();
                await browser.close();
            }

            if (plainText == true) {
                await message.channel.send(`https://${sengine}?q=${sterms}${iie}`);
            } else {
                if (sc) {
                    const embed: MessageEmbedOptions = {
                        description: `[Let Me Google That For You](https://${sengine}?q=${sterms}${iie})`,
                        color: await client.database.getColor("embed"),
                        image: {
                            url: 'attachment://screenshot.png'
                        },
                        footer: {
                            text: (!(message.channel instanceof DMChannel) && message.channel.nsfw) ? undefined : "Safe Search On"
                        }
                    }
                    const scfile = new Discord.MessageAttachment(sc, 'screenshot.png');
                    const response = await message.channel.send({ files: [scfile], embed: embed });
                    PaginationExecutor.addCloseListener(response);
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

