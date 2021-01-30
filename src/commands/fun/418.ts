import { Command } from "src/gm";
import xlg from "../../xlogger";

export const command: Command = {
    name: '418',
    description: 'oh no!',
    async execute(client, message) {
        try {
            message.channel.send("Command outdated and is being used as a placeholder. The replacement command will be `sm http`.");
        } catch (error) {
            xlg.error(error);
            await client.specials?.sendError(message.channel);
            return false;
        }
    }
}

