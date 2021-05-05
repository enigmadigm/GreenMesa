import { MessageEmbed, TextChannel, User } from "discord.js";
import moment from "moment";
import { Bot } from "../bot";
import { ModActionEditData } from "../gm";
import { titleCase } from "./parsers";
import { getFriendlyUptime } from "./time";

// enum colorContraventions {
//     ban = 0xff8282,
// }

export class Contraventions {
    public static async logWarn(gid: string, uid: string, agent: string, reason = ""): Promise<void> {
        const d: ModActionEditData = {
            guildid: gid,
            userid: uid,
            agent,
            summary: reason,
            type: "warn"
        };
        await this.logOne(d, await Bot.client.database.getColor("warn"));
    }

    public static async logKick(gid: string, uid: string, agent: string, reason = ""): Promise<void> {
        const d: ModActionEditData = {
            guildid: gid,
            userid: uid,
            agent,
            summary: reason,
            type: "kick"
        };
        await this.logOne(d, await Bot.client.database.getColor("ban"));
    }

    public static async logBan(gid: string, uid: string, agent: string, reason = "", duration = 0): Promise<void> {// 0xff8282
        const d: ModActionEditData = {
            guildid: gid,
            userid: uid,
            agent,
            summary: reason,
            type: "ban",
        };
        if (duration) {
            d.endtime = moment().add(duration, "ms").toISOString();
        }
        await this.logOne(d, await Bot.client.database.getColor("ban"), duration);
    }

    public static async logUnban(gid: string, uid: string, agent: string, reason = ""): Promise<void> {
        const d: ModActionEditData = {
            guildid: gid,
            userid: uid,
            agent,
            summary: reason,
            type: "unban"
        };
        await this.logOne(d);
    }

    public static async logMute(gid: string, uid: string, duration: number, agent: string, reason = ""): Promise<void> {
        const d: ModActionEditData = {
            guildid: gid,
            userid: uid,
            endtime: moment().add(duration, "ms").toISOString(),
            agent,
            summary: reason,
            type: "mute"
        };
        await this.logOne(d, await Bot.client.database.getColor("warn"), duration);
    }

    public static async logUnmute(gid: string, uid: string, agent: string, reason = ""): Promise<void> {
        const d: ModActionEditData = {
            guildid: gid,
            userid: uid,
            agent,
            summary: reason,
            type: "unmute"
        };
        await this.logOne(d);
    }

    public static async logOne(data: ModActionEditData, color = -1, duration = 0): Promise<ModActionEditData | void> {
        if (!data.guildid || !data.userid || !Bot.client.user) return;
        const num = data.casenumber || (await Bot.client.database.getHighestCaseNumber(data.guildid)) + 1;// get the case number to be used for this entry
        data.casenumber = num;
        const u = Bot.client.users.cache.get(data.userid) || await Bot.client.users.fetch(data.userid);// retrieve the user who the case pertains to
        if (!u) return;//TODO: finding the user should not be necessary, the last known tag of the user should be stored with the mod action data in the db
        if (color < 0) {// assign default color if no color was given
            color = await Bot.client.database.getColor("info");
        }
        const m = Bot.client.users.cache.get(data.agent) || await Bot.client.users.fetch(data.agent) || "anonymous";
        const action = data.type;
        const embed = this.constructEmbed(u, m, num, action, color, data.summary, duration, data.endtime);
        const r = await Bot.client.database.getGuildSetting(data.guildid, "modlog");// get the case channel
        if (r && r.value) {// try to send the message to the channel
            // Bot.client.specials.sendMessageAll({ embed }, r.value);
            const c = Bot.client.channels.cache.get(r.value);
            if (c && c instanceof TextChannel && c.permissionsFor(Bot.client.user)?.has("SEND_MESSAGES")) {
                const m = await c.send({ embed });
                data.superid = m.id;
            }
        }
        await Bot.client.database.setModAction(data);
        return data;
    }

    public static constructEmbed(target: User | string, mod: User | string, casenum: number, action = "log", color: number, reason = "", duration = 0, endat = ""): MessageEmbed {
        const modTag = mod instanceof User ? mod.tag : mod;
        const modId = mod instanceof User ? mod.id : "none";
        const targTag = target instanceof User ? target.tag : target;
        const targId = target instanceof User ? target.id : "none";
        const e = {
            color,
            timestamp: new Date(),
            title: `Case ${casenum} ● ${titleCase(action)} ● ${targTag}`,
            description: `**Perpetrator:** ${targTag} ${target}\n**Marshal:** ${modTag} ${mod instanceof User ? mod : null}`,
            footer: {
                text: `User: ${targId} Mod: ${modId}`
            }
        }
        const embed = new MessageEmbed(e);
        if (reason) {
            const rt = reason.length < 1500 ? reason : reason.substr(0, 1496) + "...";
            embed.description += `\n**Summary:** ${rt}`;
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
            embed.description += `\n\n**Period:**\n${joinedtt} (ends at ${moment(endat).format('M/D/Y HH:mm:ss')})`;
        }
        return embed;
    }
}