const puppeteer = require('puppeteer');
const Discord = require('discord.js');

module.exports = {
    name: 'lmgtfy',
    description: 'teach an idiot how to google, or just get a search link',
    aliases:['search', 'google', 'iie'],
    usage:"[explainer: -e] [plain text link: -t] <search terms>",
    args: true,
    guildOnly: false,
    category: 'fun',
    async execute(client, message, args) {
        let sengine = "google.com/search";
        let iie = "";
        let plainText = false;
        let sc;
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
            const browser = await puppeteer.launch();
            const page = await browser.newPage();
            await page.goto(`https://google.com/search?q=${args.join("+")}${(message.channel.nsfw) ? "" : "&safe=active"}`);
            sc = await page.screenshot();
            await browser.close();
        }
        let sterms = args.join("+");
        if (plainText == true) {
            message.channel.send(`https://${sengine}?q=${sterms}${iie}`).catch(console.error);
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
                await message.channel.send({ files: [scfile], embed: embed }).catch(console.error);
                message.channel.stopTyping();
                return;
            }
            message.channel.send({
                embed: {
                    "description": `[Your answer](https://${sengine}?q=${sterms}${iie})`,
                    "color": 15277667
                }
            }).catch(console.error);
        }
    }
}
