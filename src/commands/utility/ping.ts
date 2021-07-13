import { Command } from "src/gm";

export const command: Command = {
    name: 'ping',
    description: 'the classic',
    cooldown: 0,
    async execute(client, message) {
        try {
            // Calculates ping between sending a message and editing it, giving a nice round-trip latency.
            // The second ping is an average latency between the bot and the websocket server (one-way, not round-trip)
            const m = await message.channel.send("Ping?");
            const dbRoundTrip = await client.database.getPing();
            const nanoDatabaseLatency = (dbRoundTrip[1] / 1e+6).toFixed(1);
            m.edit(`Pong! Latency is ${m.createdTimestamp - message.createdTimestamp}ms. API Latency is ${Math.round(client.ws.ping)}ms. Database latency is ${nanoDatabaseLatency}ms.`);
        } catch (error) {
            xlg.error(error);
            await client.specials.sendError(message.channel);
            return false;
        }
    }
}
