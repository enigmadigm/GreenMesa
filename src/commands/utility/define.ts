import { MessageEmbedOptions } from "discord.js";
import fetch from "node-fetch";
import { Command } from "src/gm";
import config from '../../../auth.json' assert {type: "json"};
import mw from 'mw-collegiate';
const MWKEY = config.MWKEY;

export const command: Command = {
    name: "define",
    description: {
        short: "get a true definition",
        long: "Use this sleek command that I spent hours creating to get the beautiful definition of any proper English word!"
    },
    args: true,
    usage: "<some english word>",
    aliases: ["def"],
    async execute(client, message, args) {
        try {
            if (args.length > 0 && args.length < 11) {
                if (message.mentions.members?.size && message.mentions.members.first()?.id !== message.guild?.me?.id) {
                    if (message.mentions.members.first()?.id == "142831008901890048") {
                        await message.channel.send({
                            embeds: [{
                                title: `The definition of ${message.mentions.users.first()?.username}`,
                                description: "One of the universe's worst ideas",
                                color: 15277667,
                                footer: {
                                    text: "Definitions",
                                },
                            }],
                        });
                        return;
                    }
                    if (message.mentions.members.first()?.id == "343386990030356480") {
                        await message.channel.send({
                            embeds: [{
                                title: "The definition of " + message.mentions.users.first()?.username,
                                description: "a total dumbass",
                                color: 15277667,
                                footer: {
                                    text: "Definitions",
                                },
                            }],
                        });
                        return;
                    }
                    if (message.mentions.members.first()?.id == "211992874580049920") {
                        await message.channel.send({
                            embeds: [{
                                title: "The definition of " + message.mentions.users.first()?.username,
                                description: "Idiot",
                                color: 15277667,
                                footer: {
                                    text: "Definitions",
                                },
                            }],
                        });
                        return;
                    }
                    await message.channel.send({
                        embeds: [{
                            title: "Well you see I can't define that mention",
                            description: "I can't define mentions unless they are special!",
                            color: 15277667,
                            footer: {
                                text: "Definitions",
                            },
                        }],
                    });
                    return;
                }
                if (args.join(" ") === client.user?.id || (message.mentions.members?.size && message.mentions.members.first()?.id === message.guild?.me?.id)) {
                    await message.channel.send({
                        embeds: [{
                            title: `The definition of ${message.guild?.me?.displayName}`,
                            description: "that's this bot, stupid head",
                            color: 15277667,
                            footer: {
                                text: "Definitions",
                            },
                        }],
                    });
                    return;
                }
                const def = args.join(" ").toLowerCase();
                const letters = /^[A-Za-z\s-]+$/; // regular expression testing whether everything matched against contains only upper/lower case letters
                if (letters.test(def)) {
                    const r = await fetch(`https://www.dictionaryapi.com/api/v3/references/collegiate/json/${def}?key=${MWKEY}`, { method: "GET" });
                    const j = await r.json() as mw.Entry[];
                    if (!j[0]) {
                        await message.channel.send({
                            embeds: [{
                                title: "It appears you typed gibberish.",
                                description: "That, or we're just dumb.",
                                color: 16750899,
                                footer: {
                                    text: "Definitions",
                                },
                            }],
                        });
                    } else if (/* !j.every((e) => e.shortdef) */!j[0].shortdef) {
                        // j.push("or " + j.pop() + "?");
                        const lastWord = j.pop();
                        const altWords = [...j, `or ${lastWord}?`].join(", ");
                        const embed: MessageEmbedOptions = {
                            title: "Your word could not be found",
                            description: "Did you mean: " + altWords,
                            color: 16750899,
                            footer: {
                                text: "Definitions"
                            }
                        };
                        await message.channel.send({ embeds: [embed] });
                    } else {
                        const largeDefs = [];
                        for (let i = 0; i < (j.length > 3 ? 3 : j.length); i++) {
                            const r = j[i];

                            if (r.hwi.hw && r.shortdef && r.shortdef.length >= 1) {
                                const defsArray = [];
                                for (let x = 0; x < r.shortdef.length; x++) {
                                    defsArray[x] = "**[" + (x + 1) + "]** " + r.shortdef[x];
                                }

                                /*https://nodejs.org/en/knowledge/getting-started/what-is-require/
                                * The rules of where require finds the files can be a little
                                * complex, but a simple rule of thumb is that if the file
                                * doesn't start with "./" or "/", then it is either considered
                                * a core module (and the local Node path is checked), or a
                                * dependency in the local node_modules folder. If the file
                                * starts with "./" it is considered a relative file to the
                                * file that called require. If the file starts with "/", it
                                * is considered an absolute path. NOTE: you can omit ".js"
                                * and require will automatically append it if needed. For
                                * more detailed information, see the official docs
                                */
                                /*https://nodejs.org/api/modules.html#modules_file_modules
                                * If the exact filename is not found, then Node.js will attempt to
                                * load the required filename with the added extensions: .js, .json, and finally.node.
                                *
                                * .js files are interpreted as JavaScript text files, and.json files are
                                * parsed as JSON text files..node files are interpreted as compiled addon modules loaded with process.dlopen().
                                *
                                * A required module prefixed with '/' is an absolute path to the file.For example,
                                * require('/home/marco/foo.js') will load the file at / home / marco / foo.js.
                                *
                                * A required module prefixed with './' is relative to the file calling require().That is,
                                * circle.js must be in the same directory as foo.js for require('./circle') to find it.
                                *
                                * Without a leading '/', './', or '../' to indicate a file, the module must either be
                                * a core module or is loaded from a node_modules folder.
                                *
                                * If the given path does not exist, require() will throw an Error with its
                                * code property set to 'MODULE_NOT_FOUND'.
                                */
                                /*const config = await import("../auth.json");
                                if (config.wordsDefined && !config.wordsDefined.includes(def)) config.wordsDefined.push(def);
                                 if (!config.wordsDefined) config.wordsDefined = [def];
                                 fs.writeFile("./auth.json", JSON.stringify(config, null, 2), function (err) {
                                     if (err) return console.log(err);
                                 });*/
                                client.database.logDefined();
                                if (defsArray.join(", ").length < 1020) {
                                    const sDef = {
                                        name: `📖  ${r.hwi.hw.split('*').join("")} *${r.fl}*`,
                                        value: `(${i + 1} of ${j.length})\n${defsArray.join(", ")}`
                                    }
                                    if (i === 0) {
                                        sDef.value = `${r.hwi.prs && r.hwi.prs[0] ? `${r.hwi.hw.split('*').join(" ● ")} **|** \\ ${r.hwi.prs[0].mw} \\` : ''}\n${defsArray.join(", ")}`
                                    }
                                    largeDefs.push(sDef);
                                }
                            }
                        }
                        await message.channel.send({
                            embeds: [{
                                title: `Definition of *${def}*`,
                                color: 25600 || 65280,
                                fields: largeDefs,
                                footer: {
                                    text: "Collegiate Dictionary | Definitions",
                                    iconURL: "https://cdn.discordapp.com/attachments/660242946834038791/756892388198449162/MWLogo_120x120.png",
                                },
                            }],
                        });
                        return;
                    }
                } else {
                    await message.channel.send({
                        embeds: [{
                            title: "Please send a valid word to be defined",
                            description: "Whatever you entered wasn't found to be valid, it probably contained a number",
                            color: 16711680,
                            footer: {
                                text: "Definitions",
                            },
                        }],
                    });
                    return;
                }
            } else {
                await message.channel.send({
                    embeds: [{
                        description: "Please limit arguments to **ten** or less words",
                        color: 16711680,
                        footer: {
                            text: "Definitions",
                        },
                    }]
                });
                return;
            }
        } catch (error) {
            xlg.error(error);
            await client.specials.sendError(message.channel);
            return false;
        }
    }
}

