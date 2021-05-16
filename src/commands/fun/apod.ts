import { default as fetch } from "node-fetch";

import config from '../../../auth.json';
import lux from "luxon";
import { validURL } from '../../utils/urls';
import { Command } from "src/gm";

export const command: Command = {
    name: 'apod',
    description: {
        short: 'get the Astronomy Picture of the Day',
        long: 'Get the Astronomy Picture of the Day from NASA.'
    },
    usage: '[date]',
    args: false,
    async execute(client, message, args) {
        try {
            let url = `https://api.nasa.gov/planetary/apod?api_key=${config.NASA.key}`;
            if (args.length) {
                try {
                    const apoddate = new Date(args.join(" "));
                    url += `&date=${lux.DateTime.fromJSDate(apoddate).toISODate()}`;
                } catch (error) {
                    return;
                }
            }
            fetch(url)
                .then(res => res.json())
                .then(async j => {
                    if (!j.url || !validURL(j.url)) {
                        if (j.code && j.code == 400) {
                            message.channel.send({
                                embed: {
                                    color: await client.database.getColor("fail"),
                                    title: "Error",
                                    description: "Invalid Date"
                                }
                            });
                            return;
                        }
                        if (j.code && j.code == 404) {
                            message.channel.send({
                                embed: {
                                    color: await client.database.getColor("fail"),
                                    title: "Sorry",
                                    description: `**At this date there is no image data from NASA.**\nIf you are searching for today's data you may find that this changes later. You may also search for an APOD at a different date. I have no control over this.`
                                }
                            });
                            return;
                        }
                        message.channel.send({
                            embed: {
                                color: await client.database.getColor("fail"),
                                title: "Sorry",
                                description: "The APOD could not be retrieved."
                            }
                        });
                        return;
                    }
                    message.channel.send({
                        embed: {
                            timestamp: j.date ? new Date(j.date).getTime() : new Date().getTime(),
                            color: await client.database.getColor("info"),
                            title: `${(j.title) ? j.title : 'NASA APOD'}`,
                            description: j.explanation && j.explanation.length < 2048 ? j.explanation : null,
                            image: {
                                url: j.url
                            },
                            footer: {
                                text: `Astronomy Picture of the Day${j.copyright ? `\n© ${j.copyright}` : ''}`,
                                iconURL: "https://gpm.nasa.gov/sites/default/files/document_files/NASA-Logo-Large.png"
                            }
                        }
                    });
                });
        } catch (error) {
            xlg.error(error);
            await client.specials?.sendError(message.channel);
            return false;
        }
    }
}

