import { Command } from "src/gm";
import { titleCase } from "../utils/parsers";

export const command: Command = {
    name: 'commands',
    description: {
        short: 'command list',
        long: "Get the nearly complete command list in categories."
    },
    cooldown: 60,
    async execute(client, message) {
        const { commands, categories } = client;

        const cats = categories.map(c => c.name).filter(n => n !== "owner" && n !== "nsfw");
        for (let c = 0; c < cats.length; c++) {
            const cat = cats[c];
            const data = [];
            //data.push(`**My public commands: (${commands.array().length})**`);
            // for some reason if you don't separate \` ${command.name} \` with a space it flips out
            //                                         ^               ^
            //                                         ^               ^
            data.push(commands
                .filter(comd => comd.category !== "owner" && ((comd.category && comd.category === cat) || (cat === 'misc' && !comd.category)))
                .map(command => {
                    let availableDesc = "";
                    if (!command.description) {
                        availableDesc = "*no description*";
                    } else if (typeof command.description == "string") {
                        availableDesc = command.description;
                    } else {
                        availableDesc = command.description.short || command.description.long
                    }
                    return `\` ${command.name} \` - ${availableDesc}`
                }).join('\n'));
            data.push('')
            data.push(`You can send \`${message.bprefix}help [command name]\` to get help on a specific command!`)
            const cmdcount = commands.filter(comd => !['botkill', 'botreset', 'creload', 'evaluate'].includes(comd.name) && ((comd.category && comd.category === cat) || (cat === 'misc' && !comd.category))).size;
            try {
                await message.author.send({
                    embeds: [{
                        title: `${categories.get(cat)?.emoji ?? ""} ${categories.get(cat)?.emoji ? ' ' : ''}${titleCase(categories.get(cat)?.name ?? "")}`,
                        color: await client.database.getColor("info"),
                        description: `${data.join("\n").length < 2048 ? data.join("\n") || 'none' : 'too many commands to send!'}`,
                        footer: {
                            text: `${cmdcount} command(s)`,
                        },
                    }],
                });
            } catch (error) {
                xlg.error(`could not send all commands help ${message.author.tag}:`, error);
                await message.channel.send(`I can't DM you! Do you have DMs disabled?`);
            }
        }

        if (message.channel.type !== 'dm') {
            await message.channel.send("📩 *you've* got mail!");
        }
    }
}
