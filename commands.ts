import { Client, Message } from "discord.js";

export interface commandInterface {
    name: string,
    description: string,
    aliases: string[],
    usage: string,
    permLevel: number,
    guildOnly: boolean,
    execute(client: Client, message: Message, args: string[])
}