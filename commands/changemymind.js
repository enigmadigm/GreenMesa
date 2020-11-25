const { default: fetch } = require("node-fetch")
const xlg = require("../xlogger")
const { validURL } = require('../utils/urls');
const { getGlobalSetting } = require("../dbmanager");

module.exports = {
    name: 'changemymind',
    description: {
        short: 'make an image',
        long: 'Use to make a change my mind image with custom text.'
    },
    usage: '<text>',
    args: true,
    category: "fun",
    async execute(client, message, args) {
        try {
            message.channel.startTyping();
            if (args.length > 1000) {
                message.channel.send({
                    embed: {
                        color: parseInt((await getGlobalSetting("fail_embed_color"))[0].value, 10),
                        title: "Nope",
                        description: "I will not accept text longer than 1000 characters."
                    }
                });
                message.channel.stopTyping();
                return false;
            }
            var url = `https://nekobot.xyz/api/imagegen?type=changemymind&text=${args.join(" ")}`;
            await fetch(url)
                .then(res => res.json())
                .then(async j => {
                    if (j.status == 200 && j.success && j.message && validURL(j.message)) {
                        message.channel.send({
                            embed: {
                                color: parseInt((await getGlobalSetting("info_embed_color"))[0].value, 10),
                                image: {
                                    url: j.message
                                },
                                footer: {
                                    text: "changemymind | neko"
                                }
                            }
                        }).catch(xlg.log);
                    }
                })
            message.channel.stopTyping();
        } catch (error) {
            xlg.error(error);
            message.channel.stopTyping().catch(xlg.error);
            message.channel.send({
                embed: {
                    color: parseInt((await getGlobalSetting('fail_embed_color'))[0].value),
                    description: `Failure while generating image`
                }
            }).catch(xlg.error);
        }
    }
}