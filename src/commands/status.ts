import xlg from "../xlogger";
//import { getGlobalSetting } from "../dbmanager";
import { Command } from "src/gm";

export const command: Command = {
    name: "status",
    description: "returns ok",
    async execute(client, message) {
        try {
            message.channel.send({
                embed: {
                    color: await client.database.getColor("info"),
                    description: "ok"
                }
            });
        } catch (error) {
            xlg.error(error);
            await client.specials?.sendError(message.channel);
            return false;
        }
    }
}

