const xlg = require("../xlogger");
const { permLevels } = require('../permissions');
const { getGlobalSetting } = require("../dbmanager");
const fetch = require("node-fetch");

module.exports = {
    name: "tinyurl",
    //aliases: [""],
    description: {
        short: "shorten a link with tinyurl",
        long: "This command will take any valid link and shorten it to the domain tinyurl.com."
    },
    category: "utility",
    usage: "<url>",
    args: true,
    specialArgs: 1,
    permLevel: permLevels.member,
    guildOnly: false,
    ownerOnly: false,
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
                            value: `${j}`
                        }
                    ]
                }
            });
        } catch (error) {
            xlg.error(error);
            await client.specials.sendError(message.channel);
            return false;
        }
    }
}