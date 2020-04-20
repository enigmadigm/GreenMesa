module.exports = {
    name: 'creload',
    description: 'Reloads a command file',
    aliases:['cmdreload'],
    usage:"<cmd to reload>",
    args: true,
    ownerOnly: true,
    execute(client, message, args) {
        const commandName = args[0].toLowerCase();
        const command = message.client.commands.get(commandName)
            || message.client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

        if (!command) return message.channel.send(`There is no command with name or alias \`${commandName}\`, ${message.author}!`);

        // Deleting old command from cache
        delete require.cache[require.resolve(`./${command.name}.js`)];

        try {
            // Getting updated command
            const newCommand = require(`./${command.name}.js`);
            // Adding/updating the command in client.commands
            message.client.commands.set(newCommand.name, newCommand);
        } catch (error) {
            console.log(error);
            message.channel.send(`There was an error while reloading a command \`${commandName}\`:\n\`${error.message}\``);
        }

        message.channel.send(`Command \`${command.name}\` was reloaded!`);
    }
}