const { default: fetch } = require("node-fetch")
const xlg = require("../xlogger")

// https://github.com/Elementalmp4/GeraldCore/blob/master/commands/rule34.js

module.exports = {
    name: 'rule34',
    description: {
        short: 'get a rule34 image',
        long: 'Get an image from rule34. **NSFW**'
    },
    usage: '[tag]',
    args: false,
    execute(client, message, args) {
        if (!message.channel.nsfw) return message.channel.send("channel not nsfw");
        var url = `https://gelbooru.com/index.php?page=dapi&s=post&q=index`;
        if (args.length) {
            return fetch(url)
                .then(res => res.json())
                .then(j => {
                    let embed = {
                        title: 'r34',
                        image: {
                            url: j.url
                        }
                    }
                    message.channel.send({ embed: embed }).catch(xlg.error);
                })
                .catch(xlg.log);
        }
        fetch(url)
            .then(res => res.json())
            .then(j => {
                let embed = {
                    title: 'r34',
                    image: {
                        url: j.url
                    }
                }
                message.channel.send({ embed: embed }).catch(xlg.error);
            })
            .catch(xlg.log);
    }
}