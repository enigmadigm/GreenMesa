import { Command } from "src/gm";

const command: Command = {
    name: 'creload',
    description: 'Reloads a command file',
    aliases:['cmdreload', 'cre'],
    usage:"<cmd to reload>",
    args: true,
    ownerOnly: true,
    cooldown: 1,
    category: "owner",
    async execute(client, message, args) {
        try {
            if (!client.commands) return;
    
            const commandName = args[0].toLowerCase();
            const command = client.commands.get(commandName)
                || client.commands.find(cmd => !!(cmd.aliases && cmd.aliases.includes(commandName)));
    
            if (!command) {
                client.specials?.sendError(message.channel, `There is no command with name or alias \`${commandName}\``);
                return;
            }
    
            // Deleting old command from cache
            delete require.cache[require.resolve(`./${command.name}.js`)];
    
            try {
                // Getting updated command
                const newCommand = await import(`./${command.name}.js`);
                // Adding/updating the command in client.commands
                client.commands.set(newCommand.name, newCommand);
            } catch (error) {
                console.log(error);
                client.specials?.sendError(message.channel, `There was an error while reloading a command \`${commandName}\`:\n\`${error.message}\``);
            }
    
            message.channel.send(`Command \`${command.name}\` was reloaded!`);
        } catch (error) {
            xlg.error(error);
            await client.specials?.sendError(message.channel);
            return false;
        }
    }
}

export default command;