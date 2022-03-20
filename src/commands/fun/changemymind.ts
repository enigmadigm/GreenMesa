import { default as fetch } from "node-fetch";
import { validURL } from '../../utils/urls';
import { ChangeMyMindAPIResponse, Command } from "src/gm";

export const command: Command = {
    name: 'changemymind',
    aliases: ["cmm"],
    description: {
        short: 'make an image',
        long: 'Use to make a change my mind image with custom text.'
    },
    usage: '<text>',
    args: true,
    async execute(client, message, args) {
        try {
            message.channel.sendTyping();
            if (args.length > 1000) {
                await message.channel.send({
                    embeds: [{
                        color: await client.database.getColor("fail"),
                        title: "Nope",
                        description: "I will not accept text longer than 1000 characters.",
                    }],
                });
                return false;
            }

            const url = `https://nekobot.xyz/api/imagegen?type=changemymind&text=${encodeURIComponent(args.join(" "))}`;
            const r = await fetch(url);
            const j = await r.json() as ChangeMyMindAPIResponse;
            if (r.status === 200 && j.status === 200 && j.success && j.message && validURL(j.message)) {
                await message.channel.send({
                    embeds: [{
                        color: await client.database.getColor("info"),
                        image: {
                            url: j.message
                        },
                        footer: {
                            text: "changemymind | neko",
                        },
                    }],
                });
            }

        } catch (error) {
            xlg.error(error);
            await client.specials.sendError(message.channel, `Failure while generating image`);
        }
    }
}
