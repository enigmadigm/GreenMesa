//const { prefix } = require('../auth.json');
//const { getGlobalSetting } = require('../dbmanager');
const { permLevels } = require('../permissions');
const { getGlobalSetting } = require("../dbmanager");

module.exports = {
    name: 'help',
    description: 'get a command list or command help',
    aliases:['commands'],
    usage:"[command name]",
    cooldown: 2,
    category: 'misc',
    async execute(client, message, args) {
        const { commands } = message.client;
        
        if (!args.length) {
            try {
                const cats = ['fun', 'utility', 'moderation', 'misc'];
                const catnames = {
                    "fun": "fun",
                    "utility": "utility",
                    "moderation": "management",
                    "misc": "miscellaneous"
                };
                const catsem = ['🎉', '🔬', '🛠', '🙋‍♂️'];
                
                for (let c = 0; c < cats.length; c++) {
                    const cat = cats[c];
                    const data = [];
                    //data.push(`**My public commands: (${commands.array().length})**`);
                    // for some reason if you don't separate \` ${command.name} \` with a space it flips out
                    //                                         ^               ^
                    data.push(commands.filter(comd => !['botkill', 'botreset', 'creload', 'evaluate'].includes(comd.name) && ((comd.category && comd.category === cat) || (cat === 'misc' && !comd.category))).map(command => {
                        let availableDesc = command.description || "*no description*";
                        if (command.description && (command.description.short || command.description.long)) {
                            availableDesc = command.description.short || command.description.long;
                        }
                        return `\` ${command.name} \` - ${availableDesc}`
                    }).join('\n'));
                    data.push(`**You can send \`${message.gprefix}help [command name]\` to get help on a specific command!**`)
                    let cmdcount = commands.filter(comd => !['botkill', 'botreset', 'creload', 'evaluate'].includes(comd.name) && ((comd.category && comd.category === cat) || (cat === 'misc' && !comd.category))).size;
                    await message.author.send({
                        embed: {
                            title: `${catsem[c]} ${catnames[cat]}`,
                            color: parseInt((await getGlobalSetting("darkred_embed_color") || ['7322774'])[0].value, 10),
                            description: `${data.join("\n").length < 2048 ? data.join("\n") || 'none' : 'too many commands to send!'}`,
                            footer: {
                                text: `${data.join("\n").length < 2048 ? cmdcount : ''} command(s)`
                            }
                        }
                    }).catch(console.error);
                }
    
                
                if (message.channel.type === 'dm') return;
                message.channel.send(":e_mail: *you've* got mail!");
            } catch (error) {
                console.error(`Could not send help DM to ${message.author.tag}.\n`, error);
                message.channel.send('I can\'t DM you! Do you have DMs disabled?');
            }
            return;
        }
        const name = args[0].toLowerCase();
        const command = commands.get(name) || commands.find(c => c.aliases && c.aliases.includes(name));

        if (!command) {
            return message.reply('that\'s not a valid command!');
        }
        const embed = {
            title: `${message.gprefix}${command.name}`,
            fields: [],
            color: 25600,
            footer: {
                text: `${message.author.tag} asked for command help`
            }
        }

        if (command.description) {
            if (command.description.short || command.description.long) {
                embed.fields.push({ name: "Description", value: `${command.description.long || command.description.short}` });
            } else {
                embed.fields.push({ name: "Description", value: `${command.description}` });
            }
        }
        if (command.aliases) {
            embed.fields.push({ name: "Aliases", value: `${command.aliases.join(', ')}` });
        }
        if (command.usage) {
            embed.fields.push({ name: "Usage", value: `\`\`\`${message.gprefix}${command.name} ${command.usage}\`\`\`` });
        }
        embed.fields.push({ name: "Cooldown", value: `${command.cooldown || 2} second(s)` });
        if (command.permLevel) {
            let permKeys = Object.keys(permLevels);
            embed.fields.push({
                name: "Permissions",
                value: permKeys[command.permLevel]
            })
        }

        message.channel.send({ embed });
    }
}