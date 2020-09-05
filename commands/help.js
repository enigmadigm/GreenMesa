const { prefix } = require('../auth.json');
module.exports = {
    name: 'help',
    description: 'gives a list of commands or command help',
    aliases:['commands'],
    usage:"[command name]",
    cooldown: 5,
    execute(client, message, args) {
        const data = [];
        const { commands } = message.client;

        if (!args.length) {
            data.push(`**My unhidden commands: (${commands.array().length})**`);
            // for some reason if you don't separate \` ${command.name} \` with a space it flips out
            //                                         ^               ^
            data.push(commands.filter(command => !['botkill', 'botreset', 'creload', 'config'].includes(command.name)).map(command => {
                let availableDesc = command.description || "*no description*";
                if (command.description && (command.description.short || command.description.long)) {
                    availableDesc = command.description.short || command.description.long;
                }
                return `\` ${command.name} \` - ${availableDesc}`
            }).join('\n'));
            data.push(`\n**You can send \`${prefix}help [command name]\` to get info on a specific command!**`)

            return message.author.send(data, { split: true })
                .then(() => {
                    if (message.channel.type === 'dm') return;
                    message.channel.send('Sending help DM.');
                })
                .catch(error => {
                    console.error(`Could not send help DM to ${message.author.tag}.\n`, error);
                    message.reply('it seems like I can\'t DM you! Do you have DMs disabled?');
                })
        }
        const name = args[0].toLowerCase();
        const command = commands.get(name) || commands.find(c => c.aliases && c.aliases.includes(name));

        if (!command) {
            return message.reply('that\'s not a valid command!');
        }
        const embed = {
            title: `${prefix}${command.name}`,
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
            embed.fields.push({ name: "Usage", value: `${prefix}${command.name} ${command.usage}` });
        }
        embed.fields.push({ name: "Cooldown", value: `${command.cooldown || 2} second(s)` });

        message.channel.send({ embed });
    }
}