import xlg from "../xlogger";
import { MessageService } from "../gm";
import { Bot } from "../bot";
import { Message } from "discord.js";
import moment from "moment";

interface SpamCacheData {
    guildid: string;
    channelid: string;
    messages: Message[];
    lastMessageTime?: Date;
}

const spamCache: SpamCacheData[] = [];

function getCache(guildid: string, channelid: string): SpamCacheData {
    const cache = spamCache.find(x => x.channelid);
    if (!cache) {
        spamCache.push({
            guildid,
            channelid,
            messages: [],
        });
        return getCache(guildid, channelid);
    } else {
        return cache;
    }
}

/*function updateCache(obj: SpamCacheData): void {
    for (const i in spamCache) {
        if (spamCache[i].guildid == obj.guildid) {
            spamCache[i] = obj;
            break; //Stop this loop, we found it!
        }
    }
}*/

export const service: MessageService = {
    text: true,
    async execute(client, message) {
        try {
            if (!message.guild || !(message instanceof Message)) return;
            const modResult = await Bot.client.database?.getAutoModuleEnabled(message.guild.id, "antispam", message.channel.id);
            if (!modResult) return;

            const cache = getCache(message.guild.id, message.channel.id);
            cache.messages.push(message);
            cache.messages = cache.messages.filter((m) => moment(m.createdTimestamp) > moment().subtract(10, "seconds"));
            const perUnit = cache.messages.length / 10;
            if (perUnit > 0.8) {
                message.delete();
            }
            cache.lastMessageTime = message.createdAt;
            //updateCache(cache);
        } catch (error) {
            xlg.error(error);
        }
    }
}