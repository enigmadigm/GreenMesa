import { default as fetch } from "node-fetch";
import xlg from "../xlogger";
import { validURL } from '../utils/urls';
//import { getGlobalSetting } from "../dbmanager";
import { Command } from "src/gm";

const command: Command = {
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
                        color: await client.database?.getColor("fail_embed_color"),
                        title: "Nope",
                        description: "I will not accept text longer than 1000 characters."
                    }
                });
                message.channel.stopTyping();
                return false;
            }
            const url = `https://nekobot.xyz/api/imagegen?type=changemymind&text=${args.join(" ")}`;
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
            message.channel.stopTyping();
            client.specials?.sendError(message.channel, "Failure while generating image");
        }
    }
}

export default command;