import { default as fetch } from "node-fetch";
import config from '../../../auth.json';
import { validURL } from '../../utils/urls';
import { APODAPIResponse, Command } from "src/gm";
import moment from "moment";

export const command: Command = {
    name: 'apod',
    description: {
        short: 'get the Astronomy Picture of the Day',
        long: 'Get the Astronomy Picture of the Day from NASA.'
    },
    examples: [
        "1-1-2004"
    ],
    usage: '[date: YYYY-MM-DD]',
    async execute(client, message, args) {
        try {
            let url = `https://api.nasa.gov/planetary/apod?api_key=${config.NASA.key}`;
            if (args.length) {
                try {
                    const a = args.join(" ");
                    if (!/[0-9]{1,4}(\/|-)[0-9]{1,2}(\/|-)[0-9]{1,4}/.test(a)) {
                        await message.channel.send(`Invalid date provided, see message examples.`);
                        return;
                    }
                    const apoddate = new Date(a);
                    url += `&date=${moment(apoddate).format("YYYY-MM-DD")}`;
                } catch (error) {
                    xlg.error("apod: date parsing err", error);
                    return;
                }
            }

            const r = await fetch(url)
            const j = await r.json() as APODAPIResponse;

            if (!('url' in j)) {
                if ('code' in j && j.code == 400) {
                    await message.channel.send({
                        embeds: [{
                            color: await client.database.getColor("fail"),
                            title: "Error",
                            description: "Invalid Date"
                        }],
                    });
                    return;
                }
                if ('code' in j && j.code == 404) {
                    await message.channel.send({
                        embeds: [{
                            color: await client.database.getColor("fail"),
                            title: "Sorry",
                            description: `**At this date there is no image data from NASA.**\nIf you are searching for today's data you may find that this changes later. You may also search for an APOD at a different date. I have no control over this.`,
                        }],
                    });
                    return;
                }
                await message.channel.send({
                    embeds: [{
                        color: await client.database.getColor("fail"),
                        title: "Sorry",
                        description: "The APOD could not be retrieved.",
                    }],
                });
                return;
            }
            if (!validURL(j.url)) {
                await message.channel.send({
                    embeds: [{
                        color: await client.database.getColor("fail"),
                        title: "Sorry",
                        description: "I don't have an image to show you",
                    }],
                });
                return;
            }
            await message.channel.send({
                embeds: [{
                    timestamp: j.date ? new Date(j.date).getTime() : new Date().getTime(),
                    color: await client.database.getColor("info"),
                    title: `${(j.title) ? j.title : 'NASA APOD'}`,
                    description: j.explanation && j.explanation.length < 2048 ? j.explanation : undefined,
                    image: {
                        url: j.url
                    },
                    footer: {
                        text: `Astronomy Picture of the Day${j.copyright ? `\n© ${j.copyright}` : ''}`,
                        iconURL: "https://gpm.nasa.gov/sites/default/files/document_files/NASA-Logo-Large.png"
                    }
                }],
            });
        } catch (error) {
            xlg.error(error);
            await client.specials.sendError(message.channel);
            return false;
        }
    }
}
