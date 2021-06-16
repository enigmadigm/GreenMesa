// —
import { permLevels } from '../permissions';
import { Command } from 'src/gm';
import { MessageEmbedOptions } from 'discord.js';
import { PaginationExecutor } from '../utils/pagination';

function titleCase(str: string) {
    if (str == "nsfw") {
        return "NSFW";
    }
    const splitStr = str.toLowerCase().split(' ');
    for (let i = 0; i < splitStr.length; i++) {
        // You do not need to check if i is larger than splitStr length, as your for does that for you
        // Assign it back to the array
        splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
    }
    // Directly return the joined string
    return splitStr.join(' ');
}

export const command: Command = {
    name: "help",
    description: {
        short: "detailed command help",
        long: "Per command/category help. List commands and categories. Find out how to use commands.",
    },
    usage:"[command|category]",
    cooldown: 2,
    async execute(client, message, args) {
        try {
            const { commands } = client;
            const { categories } = client;
            //const cats = categories.map(c => c.name);

            // kind of an unnecessary and stupid part, this will rename any categories with the key being the original and the value being the new name
            /*const catnames = {
                "moderation": "management"
            };
            categories.each((c) => {
                if (Object.keys(catnames).includes(c)) {
                    categories.get(c).name = catnames[c];
                }
            });*/

            if (!args.length) {
                const data = [];
                //const helpfields = [];
                const helpfields = categories.filter(ca => ca.name !== "owner").map(ca => {
                    return {
                        name: `${titleCase(ca.name)}${ca.emoji ? ` ${ca.emoji} ` : ''}`,
                        value: `\`\`\` ${message.gprefix}help ${ca.name.toLowerCase()} \`\`\``,
                        inline: true
                    }
                });

                /*data.push(categories.filter(ca => ca.name !== "owner").map(ca => {
                    return `${titleCase(ca.name)}${` ${ca.emoji || ""} ` || ''}\n\`\`\` ${message.gprefix}help ${ca.name.toLowerCase()} \`\`\``
                }).join('\n'));*/

                data.push(`Send \`${message.gprefix}help [command name]\` to get help for a specific command!`);

                const pages: MessageEmbedOptions[] = [];

                const cmdcount = commands.size; // commands.filter(co => co.category !== "owner").size;
                const e: MessageEmbedOptions = {
                    title: `Help: Categories`,
                    color: await client.database.getColor("darkred_embed_color"),
                    description: `${data.join("\n").length < 2048 ? data.join("\n") || 'none' : 'too much to send'}`,
                    fields: helpfields,
                    footer: {
                        text: `${data.join("\n").length < 2048 ? cmdcount : ''} command(s) ● Full List: ${message.gprefix}commands`
                    }
                };
                pages.push(e);

                for (const category of categories.array()) {
                    if (category.name === "owner") {
                        continue;
                    }
                    const data = [];
                    //data.push(`**My public commands: (${commands.array().length})**`);
                    // for some reason if you don't separate \` ${command.name} \` with a space it flips out
                    //                                         ^               ^
                    data.push(commands.filter(comd => ((comd.category && comd.category === category.name) || (category.name === 'misc' && !comd.category))).map(command => {
                        let availableDesc = "";
                        if (!command.description) {
                            availableDesc = "*no description*";
                        } else if (typeof command.description == "string") {
                            availableDesc = command.description;
                        } else {
                            availableDesc = command.description.short || command.description.long
                        }
                        return `\`${message.gprefix}\`\u200b\`${command.name} \` - ${availableDesc}`
                    }).join('\n'));
                    data.push('')
                    data.push(`You can send \`${message.gprefix}help [command name]\` to get help on a specific command!`)
                    const cmdcount = commands.filter(comd => ((comd.category && comd.category === category.name) || (category.name === 'misc' && !comd.category))).size;
                    const e: MessageEmbedOptions = {
                        title: `${category.emoji || ''}${category.emoji ? '  ' : ''}Help: ${titleCase(category.name)}`,
                        color: await client.database.getColor("darkred_embed_color"),
                        description: `${data.join("\n").length < 2048 ? data.join("\n") || 'none' : 'too many commands to send!'}`,
                        footer: {
                            text: `${data.join("\n").length < 2048 ? cmdcount : ''} command(s)`
                        }
                    };
                    pages.push(e);
                }
                await PaginationExecutor.createEmbed(message, pages);
                return;
            }
            const name = args[0].toLowerCase();
            const command = commands.get(name) || commands.find(c => !!(c.aliases && c.aliases.includes(name)));
            const category = categories.get(name);

            if (command) {// if help was requested for a specific command
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const embed: MessageEmbedOptions = {
                    title: `${message.gprefix}${command.name}`,
                    fields: [],
                    color: 25600,
                    footer: {
                        text: `${message.author.tag} asked for help`
                    }
                }

                if (command.description) {
                    if (typeof command.description !== "string") {
                        embed.fields?.push({ name: "Description", value: `${command.description.long || command.description.short}` });
                    } else {
                        embed.fields?.push({ name: "Description", value: `${command.description}` });
                    }
                }
                if (command.flags && command.flags.length) {
                    const longest = command.flags.reduce((p, c) => `-${p.f.length > 1 ? "-" : ""}${p.f}${p.v ? `="${p.v}"` : ""}`.length < `-${c.f.length > 1 ? "-" : ""}${c.f}${c.v ? `="${c.v}"` : ""}`.length ? c : p);
                    const longestString = `-${longest.f.length > 1 ? "-" : ""}${longest.f}${longest.v ? `="${longest.v}"` : ""}`;
                    embed.fields?.push({
                        name: `Flags`,
                        value: `${command.flags.map((f) => {
                            const flagSec = `-${f.f.length > 1 ? "-" : ""}${f.f}${f.v ? `="${f.v}"` : ""}`;
                            return `\`${flagSec}${longestString.slice(flagSec.length).split("").map(() => " ").join("")}\` ${f.d}`;
                        }).join("\n")}`,
                    });
                }
                if (command.aliases) {
                    embed.fields?.push({ name: "Aliases", value: `${command.aliases.join(', ')}` });
                }
                if (command.usage) {
                    embed.fields?.push({ name: "Usage", value: `\`${message.gprefix}${command.name} ${command.usage/*.replace(/`/g, "\\`")*/}\`` });
                }
                if (command.examples && command.examples.length) {
                    const longest = command.examples.reduce((p, c) => p.length < c.length ? c : p);
                    embed.fields?.push({
                        name: `Example${command.examples.length > 1 ? "s" : ""}`,
                        value: `${command.examples.map(example => `\`${message.gprefix} ${command.aliases && command.aliases.length ? command.aliases[0] : command.name} ${example}${longest.substring(example.length - 1, longest.length).split("").map(() => " ").join("")}\``).join("\n")}`,
                    });
                }
                embed.fields?.push({ name: "Cooldown", value: `\`${command.cooldown ?? 0}\` second(s)`, inline: true });
                if (command.permLevel) {
                    const permKeys = Object.keys(permLevels);
                    embed.fields?.push({
                        name: "Designate",
                        value: `${permKeys[command.permLevel]}`,
                        inline: true
                    });
                }
                if (command.permissions?.length) {
                    embed.fields?.push({
                        name: "Required Permissions",
                        value: `${command.permissions.map(x => `${x.toLowerCase().replace(/_/g, " ")}`).join(", ")}`,
                    });
                }

                await message.channel.send({ embed });
            } else if (category) {// if help was requested for a specific category
                if (category.name === "owner") {
                    message.channel.send("That is a hidden category");
                    return;
                }
                const data = [];
                //data.push(`**My public commands: (${commands.array().length})**`);
                // for some reason if you don't separate \` ${command.name} \` with a space it flips out
                //                                         ^               ^
                data.push(commands.filter(comd => ((comd.category && comd.category === category.name) || (category.name === 'misc' && !comd.category))).map(command => {
                    let availableDesc = "";
                    if (!command.description) {
                        availableDesc = "*no description*";
                    } else if (typeof command.description == "string") {
                        availableDesc = command.description;
                    } else {
                        availableDesc = command.description.short || command.description.long
                    }
                    return `\`${message.gprefix}\`\u200b\`${command.name} \` - ${availableDesc}`
                }).join('\n'));
                data.push('')
                data.push(`You can send \`${message.gprefix}help [command name]\` to get help on a specific command!`)
                const cmdcount = commands.filter(comd => ((comd.category && comd.category === category.name) || (category.name === 'misc' && !comd.category))).size;
                await message.channel.send({
                    embed: {
                        title: `${category.emoji || ''}${category.emoji ? '  ' : ''}Help: ${titleCase(category.name)}`,
                        color: await client.database.getColor("darkred_embed_color"),
                        description: `${data.join("\n").length < 2048 ? data.join("\n") || 'none' : 'too many commands to send!'}`,
                        footer: {
                            text: `${data.join("\n").length < 2048 ? cmdcount : ''} command(s)`
                        }
                    }
                });
            } else {
                await message.channel.send({
                    embed: {
                        color: await client.database.getColor("fail"),
                        description: `\` ${name.escapeDiscord()} \` is not a valid command or category`,
                        footer: {
                            text: `an nlp command assistant is in the works`
                        }
                    }
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

