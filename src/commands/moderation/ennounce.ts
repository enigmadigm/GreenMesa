import { MessageEmbedOptions } from 'discord.js';
import { Command } from 'src/gm';
import { permLevels } from '../../permissions.js';
//import { getGuildSetting, getGlobalSetting } from "../dbmanager";
/*const Validator = require('jsonschema').Validator;
var v = new Validator();
var schema = {
    "type": "object"
};*/

export const command: Command = {
    name: 'ennounce',
    description: {
        short: 'send an embed and more',
        long: 'Make the bot send a custom embed with optional color. The sender message is deleted. Embed color can be sent in decimal, 0x hex format, or just type a common color with \\ prefixing, all in the first argument.'
    },
    args: true,
    usage: '[\\common color | decimal < 16777215] <message | json> [--no-footer --json]',
    guildOnly: true,
    permLevel: permLevels.mod,
    moderation: true,
    async execute(client, message, args) {
        try {
            let sclength = 0;
            let seacolor;
            if (parseInt(args[0], 10) && parseInt(args[0], 10) <= 16777215) {
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
                seacolor = await client.database.getColor("info");
                sclength = 0;
            }
            let embed: MessageEmbedOptions = {
                color: seacolor,
                description: args.join(" ").slice(sclength).trim(),
                timestamp: new Date().getTime(),
                footer: {
                    icon_url: message.author.displayAvatarURL(),
                    text: "admin message"
                }
            }
            if (args.includes('--json') || args.includes('-j')) {
                args.splice(args.findIndex(arg => arg == '--json' || arg == '-j'), 1);
    
                /*let validation = v.validate(args.join(" ").slice(sclength).trim(), schema);
                if (validation.errors && validation.errors.length) {
                    return message.channel.send(`\`\`\`${validation.errors}\`\`\``);
                }*/
                const a = args.join(" ");
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                let parsedJSON: any;
                try {
                    parsedJSON = JSON.parse(a.slice(sclength).trim());
                } catch (e) {
                    await message.channel.send(`\`\`\`data is not of type object\`\`\``);
                    return;
                }

                if (!parsedJSON.description && !parsedJSON.title) {
                    await message.channel.send(`Invalid embed format. You must have a title or description.`);
                    return;
                }
                embed = { ...parsedJSON };
            } else if (args.includes('--no-footer') || args.includes('-nf')) {
                args.splice(args.findIndex(arg => arg == '--no-footer' || arg == '-nf'), 1);
                embed = {
                    color: seacolor,
                    description: args.join(" ").slice(sclength).trim()
                }
            }

            await message.channel.send({ embeds: [embed] });
            await message.delete().catch(O_o => O_o);
        } catch (error) {
            xlg.error(error);
            await client.specials.sendError(message.channel);
            return false;
        }
    }
}

