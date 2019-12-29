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

        // we have to delete the previously loaded command from client.commands and require it again, but you can't do it because the file was cached. I have to delete the file from the cache, and then it can be required it again
        delete require.cache[require.resolve(`./${command.name}.js`)];

        try {
            const newCommand = require(`./${command.name}.js`);
            message.client.commands.set(newCommand.name, newCommand);
        } catch (error) {
            console.log(error);
            message.channel.send(`The was an error while reloading a command \`${commandName}\`:\n\`${error.message}\``);
        }

        message.channel.send(`Command \`${command.name}\` was reloaded!`);
    }
}