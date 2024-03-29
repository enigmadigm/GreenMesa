import { GuildMember, Message, NewsChannel, Snowflake, TextChannel, ThreadChannel, Util } from "discord.js";
import { Bot } from "../bot.js";
import { GuildMessageProps, MessageService } from "../gm";
import { stringToMember } from "../utils/parsers.js";

async function sendAfk(m: string, c: TextChannel | NewsChannel | ThreadChannel, t: GuildMember) {
    const text = Util.removeMentions(m);
    // for (let word of afk.afk.split(" ")) {
    //     // const ext = extractString(afk.afk, /<@&(\d*)>/);
    //     const ext = stringToRole(message.guild, word, false, false);
    //     if (ext) {
    //         word = `\`@${ext.name}\``;
    //     }
    //     t.push(word);
    // }

    let b = `**${t.user.tag.escapeDiscord()} is afk:**\n${text}`;
    if (b.length > 2000) {
        while (b.length > 1992) {
            b = b.slice(0, -1);
        }
        b += "..."
    }
    await c.send(b);
}

export const service: MessageService = {
    events: ["message", "messageUpdate"],
    async execute(client, event, message: Message & GuildMessageProps) {
        try {
            if (!message.guild || message.author.id === client.user?.id) return;
            const afk = await Bot.client.database.getUserData(message.author.id);
            if (afk.afk !== "~~off~~" && afk.afk !== "off") {
                await client.database.updateUserData({
                    userid: message.author.id,
                    afk: "off"
                });
                if (afk.afk) {
                    try {
                        // await message.author.send(`\\👋 Your afk message has been reset`);
                        await message.react("👋");// just going to react to their first message with a wave instead of dming them
                    } catch (error) {
                        //
                    }
                }
            }
            const testMentions = async () => {
                const matches = message.content.match(/(<@!?[0-9]{18}>)/g);
                if (matches && matches.length === 1) {
                    const match = matches[0];
                    const target = await stringToMember(message.guild, match, false, false, false);
                    if (target && target.id !== message.author.id) {
                        return target;
                    }
                }
                return false;
            }
            const testReference = async (gid: Snowflake, cid: Snowflake, mid: Snowflake) => {
                if (gid === message.guild.id) {
                    const c = <TextChannel | NewsChannel | undefined>message.guild.channels.cache.get(cid);
                    if (c) {
                        try {
                            const m = await c.messages.fetch(mid);
                            if (m.member) {
                                return m.member;
                            }
                        } catch (error) {
                            //
                        }
                    }
                }
                return false;
            }
            let target: GuildMember | false;
            if (message.mentions && (target = await testMentions())) {
                const afk = await Bot.client.database.getUserData(target.id);
                if (afk.afk && afk.afk !== "~~off~~" && afk.afk !== "off") {
                    sendAfk(afk.afk, message.channel, target);
                }
                //const u = message.mentions.users.first();
                /*if () {
                    const iec_gs = await client.database.getColor("info");
                    message.channel.send({
                        embed: {
                            "description": `${message.guild?.me?.nickname || client.user.username}'s prefix for **${message.guild?.name}** is **${message.gprefix}**`,
                            "color": iec_gs
                        }
                    })
                    return;
                }*/
            } else if (message.reference && message.reference.messageId && message.reference.guildId && (target = await testReference(message.reference.guildId, message.reference.channelId, message.reference.messageId))) {
                const afk = await Bot.client.database.getUserData(target.id);
                if (afk.afk && afk.afk !== "~~off~~" && afk.afk !== "off") {
                    sendAfk(afk.afk, message.channel, target);
                }
            }
        } catch (error) {
            xlg.error(error);
        }
    }
}