import { Command } from "src/gm";

const command: Command = {
    name: '418',
    description: 'oh no!',
    category: 'fun',
    async execute(client, message) {
        message.channel.send("Command outdated and is being used as a placeholder. The replacement command will be `sm http`.");
    }
}

export default command;