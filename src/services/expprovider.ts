import { MessageService, XMessage } from "../gm";
import Discord from 'discord.js';

const xpcooldowns: Discord.Collection<string, number> = new Discord.Collection();

export const service: MessageService = {
    async execute(client, message: XMessage) {
        if (message.author.bot || message.system) return;
        if (!message.guild || !client.user || !client.commands || !client.categories) return;

        const now = Date.now();
        if (!xpcooldowns.has(message.author.id)) {
            client.database?.updateXP(message);
            xpcooldowns.set(message.author.id, now);
            setTimeout(() => xpcooldowns.delete(message.author.id), 60000);
        }
    }
}