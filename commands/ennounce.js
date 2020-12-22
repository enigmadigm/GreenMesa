const { getGuildSetting } = require("../dbmanager");
const { permLevels } = require('../permissions');
const { getGlobalSetting } = require('../dbmanager');
/*const Validator = require('jsonschema').Validator;
var v = new Validator();
var schema = {
    "type": "object"
};*/

module.exports = {
    name: 'ennounce',
    description: {
        short: 'send an embed and more',
        long: 'Make the bot send a custom embed with optional color. The sender message is deleted. Embed color can be sent in decimal, 0x hex format, or just type a common color with \\ prefixing, all in the first argument.'
    },
    args: true,
    usage: '[\\common color | decimal < 16777215] <message | json> [--no-footer --json]',
    guildOnly: true,
    permLevel: permLevels.mod,
    category: 'moderation',
    async execute(client, message, args) {
        let moderationEnabled = await getGuildSetting(message.guild, 'all_moderation');
        if (!moderationEnabled[0] || moderationEnabled[0].value === 'disabled') {
            return client.specials.sendModerationDisabled(message.channel);
        }

        var sclength = 0;
        var seacolor;
        if (!isNaN(args[0]) && parseInt(args[0], 10) && parseInt(args[0], 10) <= 16777215) {
            seacolor = parseInt(args[0], 10);
            args.shift();
        } else if ((args[0].startsWith("0x")) && args[0].length == 8 && /[a-zA-Z0-9]/.test(args[0])) {
            seacolor = parseInt(args[0], 16);
            args.shift();
        } else if (args[0] == "\\red") {
            seacolor = 0xff0000;
            args.shift();
        } else if (args[0] == "\\blue") {
            seacolor = 0x0000ff;
            args.shift();
        } else if (args[0] == "\\green") {
            seacolor = 0x00ff00;
            args.shift();
        } else if (args[0] == "\\yellow") {
            seacolor = 0xffff00;
            args.shift();
        } else if (args[0] == "\\orange") {
            seacolor = 0xffa500;
            args.shift();
        } else if (args[0] == "\\purple") {
            seacolor = 0x800080;
            args.shift();
        } else if (args[0] == "\\pink") {
            seacolor = 0xffc0cb;
            args.shift();
        } else if (args[0] == "\\indigo") {
            seacolor = 0x4b0082;
            args.shift();
        } else {
            //seacolor = 0x3498db;
            seacolor = parseInt((await getGlobalSetting("info_embed_color"))[0].value, 10);
            sclength = 0;
        }
        var embed = {
            embed: {
                color: seacolor,
                description: args.join(" ").slice(sclength).trim(),
                timestamp: new Date(),
                footer: {
                    icon_url: message.author.displayAvatarURL,
                    text: "admin message"
                }
            }
        }
        if (args.includes('--json') || args.includes('-j')) {
            args.splice(args.findIndex(arg => arg == '--json' || arg == '-j'), 1);

            /*let validation = v.validate(args.join(" ").slice(sclength).trim(), schema);
            if (validation.errors && validation.errors.length) {
                return message.channel.send(`\`\`\`${validation.errors}\`\`\``);
            }*/
            try {
                var parsedJSON = JSON.parse(args.join(" ").slice(sclength).trim());
            } catch (e) {
                return message.channel.send(`\`\`\`data is not of type object\`\`\``);
            }

            if (!parsedJSON.description && !parsedJSON.title) {
                return message.channel.send('Invalid embed format. You must have a title or description.');
            }
            embed = { embed: parsedJSON };
        } else if (args.includes('--no-footer') || args.includes('-nf')) {
            args.splice(args.findIndex(arg => arg == '--no-footer' || arg == '-nf'), 1);
            embed = {
                embed: {
                    color: seacolor,
                    description: args.join(" ").slice(sclength).trim()
                }
            }
        }

        message.delete().catch(O_o => {O_o});
        message.channel.send(embed).catch(e => {
            console.log(e);
            message.channel.send(`Error sending embed:\n${e.message}`)
        });
    }
}