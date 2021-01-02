const xlg = require("../xlogger");
const { permLevels } = require('../permissions');
const { getGlobalSetting } = require("../dbmanager");
const fetch = require("node-fetch");

module.exports = {
    name: "isgd",
    //aliases: [""],
    description: {
        short: "shorten a link with is.gd",
        long: "This command will take any valid link and shorten it to the public domain [is.gd](https://is.gd). URLs should not contain whitespace, and may be limited in length."
    },
    category: "utility",
    usage: "<url>",
    args: true,
    specialArgs: 1,
    permLevel: permLevels.member,
    guildOnly: false,
    async execute(client, message, args) {
        try {
            if (args.length > 1) {
                await client.specials.sendError(message.channel, "A valid URL should not contain whitespace");
                return;
            }
            const url = args[0].slice(0, 1024);
            const r = await fetch(`https://is.gd/create.php?format=json&url=${args[0]}`);
            if (r.status !== 200) {
                await client.specials.sendError(message.channel, "Received a non-ok response code from is.gd", true);
                return;
            }
            const j = await r.json();
            if (!j || j.errorcode || !j.shorturl) {
                if (j.errorcode === 1 && j.errormessage) {
                    await client.specials.sendError(message.channel, `Could not shorten URL:\n${j.errormessage}`, true);
                    return;
                } else {
                    await client.specials.sendError(message.channel, `Could not shorten URL`, true);
                    return;
                }
            }
            message.channel.send({
                embed: {
                    color: parseInt((await getGlobalSetting("info_embed_color"))[0].value, 10),
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
                        text: "is.gd"
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