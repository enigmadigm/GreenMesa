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
    args: false,
    async execute(client, message, args) {
        var url = `https://api.nasa.gov/planetary/apod?api_key=${config.NASA.key}`;
        if (args.length) {
            var apoddate = new Date(args.join(" "));
            if (!apoddate || !apoddate.toISOString()) return;
            url += `&date=${lux.DateTime.fromJSDate(apoddate).toISODate()}`;
        }
        fetch(url)
            .then(res => res.json())
            .then(async j => {
                if (!j.url || !validURL(j.url)) {
                    return message.channel.send({
                        embed: {
                            color: parseInt((await getGlobalSetting("fail_embed_color"))[0].value, 10),
                            title: "Sorry",
                            description: "The APOD could not be retrieved."
                        }
                    })
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