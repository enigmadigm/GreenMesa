import { permLevels } from '../../permissions.js';
import fetch from "node-fetch";
import { Command } from "src/gm";

export const command: Command = {
    name: "tinyurl",
    description: {
        short: "shorten a link with tinyurl",
        long: "This command will take any valid link and shorten it to the domain tinyurl.com."
    },
    usage: "<url>",
    args: 1,
    permLevel: permLevels.member,
    async execute(client, message, args) {
        try {
            if (args.length > 1) {
                await client.specials.sendError(message.channel, "A valid URL should not contain whitespace");
                return;
            }
            const url = args[0].slice(0, 1024);
            const r = await fetch(`http://tinyurl.com/api-create.php?url=${url}`);
            if (r.status !== 200) {
                await client.specials.sendError(message.channel, "URL not shortened", true);
                return;
            }
            const j = await r.text();
            await message.channel.send({
                embeds: [{
                    color: await client.database.getColor("info"),
                    title: "🔗 Link Shortener",
                    fields: [
                        {
                            name: "Input",
                            value: `${url}`
                        },
                        {
                            name: "Output",
                            value: `${j}`
                        }
                    ],
                    footer: {
                        text: "tinyurl.com"
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
