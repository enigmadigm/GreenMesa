import { GuildMember, MessageEmbed, Snowflake, TextChannel, User } from "discord.js";
import moment from "moment";
import { Bot } from "../bot";
import { ModActionEditData } from "../gm";
import { combineEmbedText, titleCase } from "./parsers";
import { isSnowflake } from "./specials";
import { getFriendlyUptime } from "./time";

// enum colorContraventions {
//     ban = 0xff8282,
// }

export class Contraventions {//TODO: get rid of this class and just export all of the inner methods or export them as an object
    public static async logWarn(u: GuildMember, agent: GuildMember | string, reason = ""): Promise<void> {
        const modTag = typeof agent === "string" ? undefined : agent.user.tag;
        const modId = typeof agent === "string" ? agent : agent.id;
        const d: ModActionEditData = {
            guildid: u.guild.id,
            userid: u.id,
            usertag: u.user.tag,
            agent: modId,
            agenttag: modTag,
            summary: reason,
            type: "warn"
        };
        await this.logOne(d, -1);
    }

    public static async logKick(u: GuildMember, agent: GuildMember | string, reason = ""): Promise<void> {
        const modTag = typeof agent === "string" ? undefined : agent.user.tag;
        const modId = typeof agent === "string" ? agent : agent.id;
        const d: ModActionEditData = {
            guildid: u.guild.id,
            userid: u.id,
            usertag: u.user.tag,
            agent: modId,
            agenttag: modTag,
            summary: reason,
            type: "kick"
        };
        await this.logOne(d, -1);
    }

    public static async logBan(u: GuildMember, agent: GuildMember | string, reason = "", duration = 0): Promise<void> {// 0xff8282
        const modTag = typeof agent === "string" ? undefined : agent.user.tag;
        const modId = typeof agent === "string" ? agent : agent.id;
        const d: ModActionEditData = {
            guildid: u.guild.id,
            userid: u.id,
            usertag: u.user.tag,
            agent: modId,
            agenttag: modTag,
            summary: reason,
            type: "ban",
        };
        if (duration) {
            d.endtime = moment().add(duration, "ms").toISOString();
        }
        await this.logOne(d, -1, duration);
    }

    public static async logUnban(guildid: Snowflake, u: GuildMember | Snowflake, agent: GuildMember | string, reason = "", utag?: string): Promise<void> {
        const modTag = typeof agent === "string" ? undefined : agent.user.tag;
        const modId = typeof agent === "string" ? agent : agent.id;
        const userId = typeof u === "string" ? u : u.id;
        const userTag = u instanceof GuildMember ? u.user.tag : typeof utag === "string" ? utag : undefined;
        const d: ModActionEditData = {
            guildid,
            userid: userId,
            usertag: userTag,
            agent: modId,
            agenttag: modTag,
            summary: reason,
            type: "unban"
        };
        await this.logOne(d);
    }

    public static async logMute(u: GuildMember, duration: number, agent: GuildMember | string, reason = "", remute = false): Promise<void> {
        const modTag = typeof agent === "string" ? undefined : agent.user.tag;
        const modId = typeof agent === "string" ? agent : agent.id;
        const d: ModActionEditData = {
            guildid: u.guild.id,
            userid: u.id,
            usertag: u.user.tag,
            endtime: moment().add(duration, "ms").toISOString(),
            agent: modId,
            agenttag: modTag,
            summary: remute ? "Attempted mute evasion; automatically remuting to counter." : reason,
            type: remute ? "remute" : "mute"
        };
        await this.logOne(d, -1, duration);
    }

    public static async logUnmute(u: GuildMember, agent: GuildMember | string, reason = ""): Promise<void> {
        const modTag = typeof agent === "string" ? undefined : agent.user.tag;
        const modId = typeof agent === "string" ? agent : agent.id;
        const d: ModActionEditData = {
            guildid: u.guild.id,
            userid: u.id,
            usertag: u.user.tag,
            agent: modId,
            agenttag: modTag,
            summary: reason,
            type: "unmute"
        };
        await this.logOne(d);
    }

    public static async logOne(data: ModActionEditData, color = -1, duration = 0): Promise<ModActionEditData | void> {
        if (!data.guildid || !data.userid || !Bot.client.user) return;
        const num = data.casenumber || (await Bot.client.database.getHighestCaseNumber(data.guildid)) + 1;// get the case number to be used for this entry
        data.casenumber = num;
        const u = Bot.client.users.cache.get(data.userid) || data.userid;// retrieve the user who the case pertains to
        // if (!u) return;//TODO: finding the user should not be necessary, the last known tag of the user should be stored with the mod action data in the db
        const m = isSnowflake(data.agent) ? Bot.client.users.cache.get(data.agent) || await Bot.client.users.fetch(data.agent) : "anonymous";
        const action = data.type;
        const embed = await this.constructEmbed(u, m, num, action, color, data.summary, duration, data.endtime, u instanceof User ? undefined : data.usertag);
        const r = await Bot.client.database.getGuildSetting(data.guildid, "modlog");// get the case channel
        if (r && r.value && isSnowflake(r.value)) {// try to send the message to the channel
            // Bot.client.specials.sendMessageAll({ embed }, r.value);
            const c = Bot.client.channels.cache.get(r.value);
            if (c && c instanceof TextChannel && c.permissionsFor(Bot.client.user)?.has("SEND_MESSAGES")) {
                const m = c.permissionsFor(Bot.client.user)?.has("EMBED_LINKS") ? await c.send({ embed }) : await c.send({ content: `${combineEmbedText(embed, 2)}` });//TODO: I should probably format the fallback message separately
                data.superid = m.id;//NOTE: superid column used for editing the info embed in the case logs (when it is a snowflake, it is attempted to be fetched)
            }
        }
        await Bot.client.database.setModAction(data);
        return data;
    }

    /**
     * Construct the embed data for a modlog channel entry
     * @param target user who the entry concerns
     * @param mod the moderator who executed the action
     * @param casenum the identifier for the entry
     * @param action the type of entry/action
     * @param color the embed flare color
     * @param reason case summary
     * @param duration if the action had a duration, the duration in ms
     * @param endat the formatted time/date the action will end at
     * @param usertag the tag of the target
     * @param modtag the tag of the mod
     * @returns embed data
     */
    public static async constructEmbed(target: User | string, mod: User | string, casenum: number, action = "log", color: number, reason = "", duration = 0, endat = "", usertag?: string, modtag?: string): Promise<MessageEmbed> {
        const modTag = mod instanceof User ? mod.tag : typeof modtag === "string" ? modtag : `unknown#0000`;
        const modId = mod instanceof User ? mod.id : "none";
        const targTag = target instanceof User ? target.tag : typeof usertag === "string" ? usertag : `unknown#0000`;
        const targId = target instanceof User ? target.id : target;
        const targUser = target instanceof User ? target : targId;
        if (color < 0) {// assign default color if no color was given
            if (action === "mute" || action === "remute") {
                color = await Bot.client.database.getColor("warn");
            } else if (action === "kick") {
                color = await Bot.client.database.getColor("ban");
            } else if (action === "ban") {
                color = await Bot.client.database.getColor("ban");
            } else if (action === "unban" || action === "unmute") {
                color = await Bot.client.database.getColor("success");
            } else if (action === "warn") {
                color = await Bot.client.database.getColor("warn");
            } else {
                color = await Bot.client.database.getColor("info");
            }
        }
        const e = {
            color,
            timestamp: new Date(),
            title: `Case ${casenum} ● ${titleCase(action)} ● ${targTag.escapeDiscord()}`,// 💼
            description: `**Perpetrator:** ${targTag.escapeDiscord()} ${targUser}\n**Marshal:** ${modTag.escapeDiscord()} ${mod instanceof User ? mod : null}`,
            footer: {
                text: `User: ${targId} Mod: ${modId}`
            }
        }
        const embed = new MessageEmbed(e);
        if (reason) {
            const rt = reason.length < 1500 ? reason : reason.substr(0, 1496) + "...";
            embed.description += `\n**Summary:** ${rt.escapeDiscord()}`;
        }
        if (duration) {
            const f = getFriendlyUptime(duration);
            if (duration < 1000) {
                f.seconds = 1;
            }
            const th = f.hours + (f.days * 24);
            const tm = f.minutes;
            const ts = f.seconds;
            const ttypes = ["hours", "minutes", "seconds"];
            if (!th) {
                ttypes.splice(ttypes.indexOf("hours"), 1);
            }
            if (!tm) {
                ttypes.splice(ttypes.indexOf("minutes"), 1);
            }
            if (!ts) {
                ttypes.splice(ttypes.indexOf("seconds"), 1);
            }
            const tt = [th, tm, ts].filter(x => x > 0).map((x, i, xt) => {
                return `${x} ${ttypes[i]}${i !== (xt.length - 1) ? (xt.length > 1 && xt.length - 2 === i ? `${xt.length > 2 ? "," : ""} and ` : ", ") : ""}`;
            });
            const joinedtt = tt.join("");
            embed.description += `\n**Period:** ${joinedtt} (ends at ${moment(endat).format('M/D/Y HH:mm:ss')})`;
        }
        return embed;
    }
}