import xlg from "../../xlogger";
import { permLevels } from '../../permissions';
//import { getGlobalSetting } from "../dbmanager";
import fetch from "node-fetch";
import { Command } from "src/gm";
import * as config from "../../../auth.json";

export const command: Command = {
    name: "kutt",
    //aliases: [""],
    description: {
        short: "shorten a link with kutt.it",
        long: "This command will take any valid link and shorten it to the public domain [kutt.ti](https://kutt.it). URLs should not contain whitespace, and may be limited in length."
    },
    usage: "<url>",
    args: 1,
    permLevel: permLevels.member,
    guildOnly: false,
    async execute(client, message, args) {
        try {
            if (args.length > 1) {
                await client.specials.sendError(message.channel, "A valid URL should not contain whitespace");
                return;
            }
            const url = args[0].slice(0, 1024);
            const a = args[0];
            const r = await fetch(`https://kutt.it/api/v2/links`, {
                method: "POST",
                body: JSON.stringify({
                    target: a
                }),
                headers: {
                    "x-api-key": `${config.KUTT}`,
                    "content-type": `application/json   `,
                },
            });
            console.log(r.status)
            if (r.status !== 200 && r.status !== 201) {
                await client.specials.sendError(message.channel, "Received a non-ok response code from kutt.it", true);
                return;
            }
            const j = await r.json();
            if (!j || !j.link || !j.address) {
                await client.specials.sendError(message.channel, `Could not shorten URL. Feel free to tell the devs if this keeps happening.`, true);
                return;
            }
            message.channel.send({
                embed: {
                    color: await client.database.getColor("info"),
                    title: "🔗 Link Shortener",
                    fields: [{
                        name: "Input",
                        value: `${url}`
                    },
                    {
                        name: "Output",
                        value: `[${j.link.replace("https://", "")}](${j.link})`
                    }
                    ],
                    footer: {
                        text: "kutt.it"
                    }
                }
            });
        } catch (error) {
            xlg.error(error);
            await client.specials.sendError(message.channel);
            return false;
        }
    }
}
