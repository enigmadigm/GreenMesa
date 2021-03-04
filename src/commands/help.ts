import xlg from '../xlogger';
import { permLevels } from '../permissions';
import { Command } from 'src/gm';
import { MessageEmbedOptions } from 'discord.js';
import { PaginationExecutor } from '../utils/pagination';

// —

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
    name: 'help',
    description: 'get a command list or command help',
    usage:"[command name]",
    cooldown: 2,
    async execute(client, message, args) {
        try {
            const { commands } = client;
            const { categories } = client;
            if (!commands || !categories) return;
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
                const helpfields = categories?.filter(ca => ca.name !== "owner").map(ca => {
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

                const cmdcount = commands?.size; // commands.filter(co => co.category !== "owner").size;
                const e: MessageEmbedOptions = {
                    title: `Help: Categories`,
                    color: await client.database?.getColor("darkred_embed_color"),
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
                    data.push(commands?.filter(comd => ((comd.category && comd.category === category.name) || (category.name === 'misc' && !comd.category))).map(command => {
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
                    const cmdcount = commands?.filter(comd => ((comd.category && comd.category === category.name) || (category.name === 'misc' && !comd.category))).size;
                    const e: MessageEmbedOptions = {
                        title: `${category.emoji || ''}${category.emoji ? '  ' : ''}Help: ${titleCase(category.name)}`,
                        color: await client.database?.getColor("darkred_embed_color"),
                        description: `${data.join("\n").length < 2048 ? data.join("\n") || 'none' : 'too many commands to send!'}`,
                        footer: {
                            text: `${data.join("\n").length < 2048 ? cmdcount : ''} command(s)`
                        }
                    };
                    pages.push(e);
                }
                PaginationExecutor.createEmbed(message, pages);
                return;
            }
            const name = args[0].toLowerCase();
            const command = commands.get(name) || commands?.find(c => !!(c.aliases && c.aliases.includes(name)));
            const category = categories.get(name);

            if (command) {
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
                        value: `${command.examples.map(example => `\`${example}${longest.substring(example.length - 1, longest.length).split("").map(() => " ").join("")}\``).join("\n")}`
                    });
                }
                embed.fields?.push({ name: "Cooldown", value: `${command.cooldown || 2} second(s)`, inline: true });
                if (command.permLevel) {
                    const permKeys = Object.keys(permLevels);
                    embed.fields?.push({
                        name: "Permissions",
                        value: permKeys[command.permLevel],
                        inline: true
                    })
                }
        
                message.channel.send({ embed });
            } else if (category) {
                if (category.name === "owner") {
                    message.channel.send("That is a hidden category");
                    return;
                }
                const data = [];
                //data.push(`**My public commands: (${commands.array().length})**`);
                // for some reason if you don't separate \` ${command.name} \` with a space it flips out
                //                                         ^               ^
                data.push(commands?.filter(comd => ((comd.category && comd.category === category.name) || (category.name === 'misc' && !comd.category))).map(command => {
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
                const cmdcount = commands?.filter(comd => ((comd.category && comd.category === category.name) || (category.name === 'misc' && !comd.category))).size;
                await message.channel.send({
                    embed: {
                        title: `${category.emoji || ''}${category.emoji ? '  ' : ''}Help: ${titleCase(category.name)}`,
                        color: await client.database?.getColor("darkred_embed_color"),
                        description: `${data.join("\n").length < 2048 ? data.join("\n") || 'none' : 'too many commands to send!'}`,
                        footer: {
                            text: `${data.join("\n").length < 2048 ? cmdcount : ''} command(s)`
                        }
                    }
                });
            } else {
                message.channel.send({
                    embed: {
                        color: await client.database?.getColor("fail_embed_color"),
                        description: `that is not a valid command or category`,
                        footer: {
                            text: `an nlp command assistant is in the works`
                        }
                    }
                });
                return;
            }
        } catch (error) {
            xlg.error(error);
            await client.specials?.sendError(message.channel);
            return false;
        }
    }
}

