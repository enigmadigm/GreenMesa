const { default: fetch } = require("node-fetch");
const xlg = require("../xlogger");
const config = require('../auth.json');
const { getGlobalSetting } = require("../dbmanager");
const lux = require("luxon");
const { validURL } = require('../utils/urls');

module.exports = {
    name: 'apod',
    description: {
        short: 'get the Astronomy Picture of the Day',
        long: 'Get the Astronomy Picture of the Day from NASA.'
    },
    usage: '[date]',
    category: 'fun',
    args: false,
    async execute(client, message, args) {
        var url = `https://api.nasa.gov/planetary/apod?api_key=${config.NASA.key}`;
        if (args.length) {
            try {
                var apoddate = new Date(args.join(" "));
                url += `&date=${lux.DateTime.fromJSDate(apoddate).toISODate()}`;
            } catch (error) {
                return;
            }
        }
        fetch(url)
            .then(res => res.json())
            .then(async j => {
                if (!j.url || !validURL(j.url)) {
                    if (j.code && j.code == 400) return message.channel.send({
                        embed: {
                            color: parseInt((await getGlobalSetting("fail_embed_color"))[0].value, 10),
                            title: "Error",
                            description: "Invalid Date"
                        }
                    }).catch(xlg.error);
                    if (j.code && j.code == 404) return message.channel.send({
                        embed: {
                            color: parseInt((await getGlobalSetting("fail_embed_color"))[0].value, 10),
                            title: "Sorry",
                            description: `**At this date there is no image data from NASA.**\nIf you are searching for today's data you may find that this changes later. You may also search for an APOD at a different date. I have no control over this.`
                        }
                    }).catch(xlg.error);
                    return message.channel.send({
                        embed: {
                            color: parseInt((await getGlobalSetting("fail_embed_color"))[0].value, 10),
                            title: "Sorry",
                            description: "The APOD could not be retrieved."
                        }
                    }).catch(xlg.error);
                }
                let embed = {
                    timestamp: j.date ? new Date(j.date) : new Date(),
                    color: parseInt((await getGlobalSetting("info_embed_color"))[0].value, 10),
                    title: `${(j.title) ? j.title : 'NASA APOD'}`,
                    image: {
                        url: j.url
                    },
                    footer: {
                        text: `Astronomy Picture of the Day${j.copyright ? `\n© ${j.copyright}` : ''}`,
                        iconURL: "https://gpm.nasa.gov/sites/default/files/document_files/NASA-Logo-Large.png"
                    }
                }
                if (j.explanation && j.explanation.length < 2048) {
                    embed.description = j.explanation;
                }
                message.channel.send({ embed: embed }).catch(xlg.error);
            })
            .catch(xlg.log);
    }
}