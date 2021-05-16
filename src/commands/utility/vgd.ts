
import { permLevels } from '../../permissions';
// import { getGlobalSetting } from "../dbmanager";
import fetch from "node-fetch";
import { Command } from "src/gm";

export const command: Command = {
    name: "vgd",
    //aliases: [""],
    description: {
        short: "shorten a link with v.gd",
        long: "This command will take any valid link and shorten it to the public domain [v.gd](https://v.gd). URLs should not contain whitespace, and may be limited in length."
    },
    usage: "<url>",
    args: 1,
    permLevel: permLevels.member,
    guildOnly: false,
    async execute(client, message, args) {
        try {
            if (args.length > 1) {
                await client.specials?.sendError(message.channel, "A valid URL should not contain whitespace");
                return;
            }
            const url = args[0].slice(0, 1024);
            const r = await fetch(`https://v.gd/create.php?format=json&url=${args[0]}`);
            if (r.status !== 200) {
                await client.specials?.sendError(message.channel, "Received a non-ok response code from v.gd", true);
                return;
            }
            const j = await r.json();
            if (!j || j.errorcode || !j.shorturl) {
                if (j.errorcode === 1 && j.errormessage) {
                    await client.specials?.sendError(message.channel, `Could not shorten URL:\n${j.errormessage}`, true);
                } else {
                    await client.specials?.sendError(message.channel, `Could not shorten URL`, true);
                }
                return;
            }
            message.channel.send({
                embed: {
                    color: await client.database.getColor("info"),
                    title: "🔗 Link Shortener",
                    fields: [
                        {
                            name: "Input",
                            value: `${url}`
                        },
                        {
                            name: "Output",
                            value: `[${j.shorturl.replace("https://", "")}](${j.shorturl})`
                        }
                    ],
                    footer: {
                        text: "v.gd"
                    }
                }
            });
        } catch (error) {
            xlg.error(error);
            await client.specials?.sendError(message.channel);
            return false;
        }
    }
}

