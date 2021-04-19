import xlg from '../xlogger';
import { Command } from "src/gm";
import { getDashboardLink } from "../utils/specials";

export const command: Command = {
    name: 'dashboard',
    description: {
        short: "dashboard link",
        long: "Get the link to the bot's dashboard"
    },
    async execute(client, message) {
        try {
            await client.specials.sendInfo(message.channel, `[Access the dashboard](${getDashboardLink(message.guild?.id)})`);
        } catch (error) {
            xlg.error(error);
            await client.specials?.sendError(message.channel);
            return false;
        }
    }
}
