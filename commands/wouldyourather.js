const xlg = require("../xlogger");
const fetch = require('node-fetch');
const { getGlobalSetting } = require("../dbmanager");
const jsdom = require('jsdom');

module.exports = {
    name: 'wouldyourather',
    aliases: ['wyr'],
    description: {
        short: 'play would you rather',
        long: 'Get a wyr question and choices.'
    },
    guildOnly: true,
    category: "fun",
    async execute(client, message) {
        try {
            message.channel.startTyping();
            await fetch('https://either.io')
                .then(res => res.text())
                .then(async body => {
                    var dom = new jsdom.JSDOM(body);
                    var ae = dom.window.document.querySelector('div.result.result-1 > .option-text');
                    var be = dom.window.document.querySelector('div.result.result-2 > .option-text');
                    var msg = await message.channel.send({
                        embed: {
                            color: parseInt((await getGlobalSetting("info_embed_color") || ['7322774'])[0].value, 10),
                            description: `Would you rather:\n**🅰 | ${ae.textContent}**\nor\n**🅱 | ${be.textContent}**`
                        }
                    }).catch(xlg.error);
                    await msg.react('🇦');
                    msg.react('🇧');
                });
            message.channel.stopTyping();
        } catch (error) {
            xlg.error(error);
            await client.specials.sendError(message.channel, `An error occurred while thinking of a WYR:\n\`${error.message}\``);
            return false;
        }

    }
}