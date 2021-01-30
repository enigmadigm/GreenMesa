import xlg from "../xlogger";
import fetch from 'node-fetch';
import jsdom from 'jsdom';
import { Command } from "src/gm";
// import { getGlobalSetting } from "../dbmanager";

const command: Command = {
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
            const r = await fetch('https://either.io');
            const body = await r.text();
            const dom = new jsdom.JSDOM(body);
            const ae = dom.window.document.querySelector('div.result.result-1 > .option-text');
            const be = dom.window.document.querySelector('div.result.result-2 > .option-text');
            const msg = await message.channel.send({
                embed: {
                    color: await client.database?.getColor("info_embed_color"),
                    description: `Would you rather:\n**🅰 | ${ae.textContent}**\nor\n**🅱 | ${be.textContent}**`
                }
            });
            await msg.react('🇦');
            msg.react('🇧');

            message.channel.stopTyping();
        } catch (error) {
            xlg.error(error);
            await client.specials?.sendError(message.channel, `An error occurred while thinking of a WYR:\n\`${error.message}\``);
            return false;
        }

    }
}

export default command;