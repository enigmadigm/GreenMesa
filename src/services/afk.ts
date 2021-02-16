import { Message } from "discord.js";
import { Bot } from "../bot";
import { MessageService } from "../gm";
import { stringToMember } from "../utils/parsers";
import xlg from "../xlogger";

export const service: MessageService = {
    text: true,
    async execute(client, message: Message) {
        try {
            if (!message.guild) return;
            const afk = await Bot.client.database?.getUserData(message.author.id);
            if (afk && afk.afk && afk.afk !== "~~off~~") {
                await client.database?.updateUserData(message.author.id, "~~off~~");
            }
            if (message.mentions) {
                //const u = message.mentions.users.first();
                const matches = message.content.match(/(<@!?[0-9]{18}>)/g);
                if (matches && matches.length === 1) {
                    const match = matches[0];
                    const target = await stringToMember(message.guild, match, false, false, false);
                    if (target && target.id !== message.author.id) {
                        const afk = await Bot.client.database?.getUserData(target.id);
                        if (afk && afk.afk && afk.afk !== "~~off~~") {
                            message.channel.send(`**${target.user.tag} is currently afk:**\n${afk.afk}`);
                        }
                    }
                }
                /*if () {
                    const iec_gs = await client.database?.getColor("info_embed_color");
                    message.channel.send({
                        embed: {
                            "description": `${message.guild?.me?.nickname || client.user.username}'s prefix for **${message.guild?.name}** is **${message.gprefix}**`,
                            "color": iec_gs
                        }
                    })
                    return;
                }*/
            }
        } catch (error) {
            xlg.error(error);
        }
    }
}