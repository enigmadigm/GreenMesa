import fetch from 'node-fetch';
import jsdom from 'jsdom';
import { Command } from "src/gm";

export const command: Command = {
    name: 'wouldyourather',
    aliases: ['wyr'],
    description: {
        short: 'play would you rather',
        long: 'Get a wyr question and choices.'
    },
    guildOnly: true,
    async execute(client, message) {
        try {
            message.channel.sendTyping();
            const r = await fetch('https://either.io');
            const body = await r.text();
            const dom = new jsdom.JSDOM(body);
            const ae = dom.window.document.querySelector('div.result.result-1 > .option-text');
            const be = dom.window.document.querySelector('div.result.result-2 > .option-text');
            const msg = await message.channel.send({
                embeds: [{
                    color: await client.database.getColor("info"),
                    description: `Would you rather:\n**🅰 | ${ae?.textContent}**\nor\n**🅱 | ${be?.textContent}**`,
                }],
            });
            await msg.react('🇦');
            await msg.react('🇧');

        } catch (error) {
            xlg.error("wyr err:", error);
            if (client.specials.isNodeError(error)) {
                await client.specials.sendError(message.channel, `An error occurred while thinking of a WYR:\n\`${error.message}\``);
            }
            return false;
        }
    }
}
