import xlg from "../xlogger";
import { MessageService, XMessage } from "../gm";
import { Bot } from "../bot";
import { Message, TextChannel } from "discord.js";
import moment from "moment";
import { stringSimilarity } from "../utils/parsers";

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

interface DeletedMessagesLog {
    id: string;
    time: Date;
}

const deleted: DeletedMessagesLog[] = [];
const deletionQueue: Message[] = [];
/*async function enqueueDeletion(channel: TextChannel, c: Message[]): Promise<void> {

}*/
let deleting = false;

async function deleteMessages(msgs: Message[], channel: TextChannel) {
    try {
        const toBulk = msgs.filter(x => !deleted.find(x1 => x1.id === x.id));
        if (toBulk.length > 1) {
            await channel.bulkDelete(toBulk);
            for (const bm of toBulk) {
                deleted.push({
                    id: bm.id,
                    time: new Date()
                });
            }
            return;
        }
    } catch (error) {
        xlg.log(`antispam could not bulkdelete in ${msgs[0].channel.id}`);
        //xlg.error(error.message);
    }
    deletionQueue.push(...msgs);
    if (deleting) return;
    while (deletionQueue.length) {
        //console.log(deletionQueue.map(x => x.id))
        if (!deleting) deleting = true;
        const m = deletionQueue[0];
        if (!deleted.find(x => x.id === m.id)) {
            try {
                await m.delete();
                deleted.push({
                    id: m.id,
                    time: new Date()
                });
            } catch (error) {
                xlg.log(`antispam could not delete ${m.id}`)
            }
        }
        deletionQueue.shift();
    }
    deleting = false;
}

setTimeout(() => {
    const old = deleted.filter(x => moment(x.time) < moment().subtract(1, "minute"));
    for (const o of old) {
        const i = deleted.indexOf(o);
        deleted.splice(i, 1);
    }
}, 60000);

export const service: MessageService = {
    text: true,
    async getInformation() {
        return "Stop excessive spam. Enable this module to prevent incursions of spammers on your server. This module currently acts on a per channel basis only and watches for spam over time. To avoid false positives, it waits to be sure spam is occurring. If it flags spam, it will delete messages from the start of when it believes a user starts to spam. This module may take up to ten (10) seconds to detect spam.";
    },
    async execute(client, message: XMessage) {
        try {
            if (!message.guild || !message.member || !(message.channel instanceof TextChannel) || message.author.bot || message.webhookID) return;
            const modResult = await Bot.client.database.getAutoModuleEnabled(message.guild.id, "antispam", message.channel.id, undefined, message.member);
            if (!modResult) return;
            let flag = false;

            if (message.mentions && (message.mentions.users.size > 5 || message.mentions.roles.size > 4)) {
                flag = true;
                message.delete();
            } else {
                const cache = getCache(message.guild.id, message.channel.id);
                cache.messages.push(message);
                cache.messages = cache.messages.filter((m) => moment(m.createdTimestamp) > moment().subtract(10, "seconds"));
                const perUnit = cache.messages.length / 10;
                if (perUnit > 0.8) {
                    flag = true;
                    deleteMessages(cache.messages.filter(x => x.deletable && x.author.id === message.author.id), message.channel);
                    //message.delete();
                }
                cache.lastMessageTime = message.createdAt;
            }
            /*const c: Message[] = [];
            for await(const m of cache.messages) {
                for await(const m2 of cache.messages) {
                    if (m.author.id === m2.author.id && m.id !== m2.id && (m.content === m2.content || stringSimilarity(m.content, m2.content) > 0.6)) {
                        c.push(m2);
                    }
                }
            }
            console.log("YEAH", `${message.channel}`);
            try {
                if (c.length > 1) {
                    for (const m0 of c) {
                        if (m0.deletable) {
                            m0.delete({
                                reason: "spam detected"
                            });
                        }
                    }
                }
            } catch (error) {
                xlg.log("antispam could not delete message");
            }*/
            //updateCache(cache);
            if (flag) {
                await client.services?.punish<XMessage>(modResult, message.member, message);
            }
        } catch (error) {
            xlg.error(error);
        }
    }
}