import { GuildMember, TextChannel } from "discord.js";
import moment from "moment";
import { UnbanActionData, UnmuteActionData, UserDataRow, WarnConf, XClient } from "../gm";
import { durationToString } from "./parsers";
import uniqid from 'uniqid';
import xlg from "../xlogger";

// export class BaseModAction<T> {
//     public client: XClient;
//     public mod: string;
//     public target: GuildMember;
//     public time: number;
//     public duration = "";

//     constructor(type: string, client: XClient, target: GuildMember, time = 0, mod?: string) {
//         this.client = client;
//         this.mod = mod || this.client.user?.tag || "0";
//         this.target = target;
//         this.time = time;

//         if (this.time) {
//             this.duration = durationToString(this.time);
//             //mendm = ` for ${dur}`
//         }
//     }

//     setTime(n: number): void {
//         this.time = n;

//         if (this.time) {
//             this.duration = durationToString(this.time);
//             //mendm = ` for ${dur}`
//         }
//     }

//     setMod(m: string): void {
//         this.mod = m;
//     }

//     public async set(data: T): Promise<boolean> {
//         if (this.client.database) {
//             if (this.time) {
//                 const t = moment().add(this.time, "ms").toDate();
//                 const r = await this.client.database.setAction(uniqid(), t, "unmute", data);
//                 if (!r) {
//                     return false;
//                 }
//             }
//             return true;
//         } else {
//             return false;
//         }
//     }
// }

// export class Mute extends BaseModAction<UnmuteActionData> {
//     public mutedRole?: Role;

//     /**
//      * @param client bot client
//      * @param target target to take action on
//      * @param time time in seconds
//      * @param mod moderator string
//      */
//     constructor(client: XClient, target: GuildMember, time?: number, mod?: string) {
//         super("unmute", client, target, time, mod);
//     }

//     public async setup(): Promise<void> {
//         const dbmr = await this.client.database?.getGuildSetting(this.target.guild, "mutedrole");
//         const mutedRoleID = dbmr ? dbmr.value : "";
//         // Check if the guild has the mutedRole
//         this.mutedRole = this.target.guild.roles.cache.find(r => r.id === mutedRoleID || r.name.toLowerCase() === 'muted' || r.name.toLowerCase() === 'mute');
//         // If the guild does not have the muted role execute the following

//         if (!this.mutedRole) {
//             // Create a role called "Muted"
//             this.mutedRole = await this.target.guild.roles.create({
//                 data: {
//                     name: 'Muted',
//                     color: '#708090',
//                     permissions: 0,
//                     position: 1
//                 }
//             });

//             this.client.database?.editGuildSetting(this.target.guild, "mutedrole", this.mutedRole.id);

//             // Prevent the user from sending messages or reacting to messages
//             this.target.guild.channels.cache.each(async (channel) => {
//                 if (this.mutedRole) {
//                     await channel.updateOverwrite(this.mutedRole, {
//                         SEND_MESSAGES: false,
//                         ADD_REACTIONS: false
//                     });
//                 }
//             });
//         }
//         if (this.mutedRole.position < this.target.roles.highest.position) {
//             this.mutedRole.setPosition(this.target.roles.highest.position);
//         }

//         // If the mentioned user already has the "mutedRole" then that can not be muted again
//         if (this.target.roles.cache.has(this.mutedRole.id)) {
//             //message.channel.send(`\`${target.user.tag}\` is already muted`);
//             return;
//         }

//         await this.target.roles.add(this.mutedRole, `muted by ${this.mod}`).catch(e => console.log(e.stack));
//         if (this.target.voice.connection && !this.target.voice.mute) {
//             await this.target.voice.setMute(true);
//         }

//         //message.channel.send(`<a:spinning_light00:680291499904073739>\\✅ Muted \`${toMute.user.tag}\`${mendm}`);

//         if (this.time) {
//             /*setTimeout(async () => {
//                 if (mutedRole) {
//                     if (!toMute.roles.cache.has(mutedRole.id)) return;
//                     // Remove the mentioned users role "mutedRole", "muted.json", and notify command sender
//                     await toMute.roles.remove(mutedRole, `unmuting automatically after ${dur}`);
//                     if (toMute.voice.connection && toMute.voice.mute) {
//                         toMute.voice.setMute(false);
//                     }
//                 }
//             }, time)*/
//             const data: UnmuteActionData = {
//                 guildid: this.target.guild.id,
//                 userid: this.target.id,
//                 roleid: this.mutedRole.id,
//                 duration: this.duration
//             }
//             await this.set(data);
//         }
//     }
// }
/**
 * Auto-mute a target permanently or for a period
 */
export async function mute(client: XClient, target: GuildMember, time = 0, mod?: string, channel?: TextChannel): Promise<void> {
    const moderator = target.guild.members.cache.get(mod || client.user?.id || "");
    const dbmr = await client.database?.getGuildSetting(target.guild, "mutedrole");
    const mutedRoleID = dbmr ? dbmr.value : "";
    // Check if the guild has the mutedRole
    let mutedRole = target.guild.roles.cache.find(r => r.id === mutedRoleID || r.name.toLowerCase() === 'muted' || r.name.toLowerCase() === 'mute');
    // If the guild does not have the muted role execute the following

    if (!mutedRole) {
        // Create a role called "Muted"
        mutedRole = await target.guild.roles.create({
            data: {
                name: 'Muted',
                color: '#708090',
                permissions: 0,
                position: 1
            }
        });

        client.database?.editGuildSetting(target.guild, "mutedrole", mutedRole.id);

        // Prevent the user from sending messages or reacting to messages
        target.guild.channels.cache.each(async (channel) => {
            if (mutedRole) {
                await channel.updateOverwrite(mutedRole, {
                    SEND_MESSAGES: false,
                    ADD_REACTIONS: false
                });
            }
        });
    } else {
        if (mutedRole.id !== mutedRoleID) {
            client.database?.editGuildSetting(target.guild, "mutedrole", mutedRole.id);
        }
    }
    if (mutedRole.position < target.roles.highest.position) {
        mutedRole.setPosition(target.roles.highest.position);
    }

    // If the mentioned user already has the "mutedRole" then that can not be muted again
    if (target.roles.cache.has(mutedRole.id)) {
        if (channel) {
            channel.send(`\`${target.user.tag}\` is already muted`);
        }
        return;
    }

    await target.roles.add(mutedRole, `muted by ${moderator?.user.tag || "me"}`).catch(e => console.log(e.stack));
    if (target.voice.connection && !target.voice.mute) {
        await target.voice.setMute(true);
    }
    let duration = "";
    let mendm = "";
    if (time) {
        duration = durationToString(time);
        mendm = ` for ${duration}`
    }

    if (channel) {
        channel.send(`<a:spinning_light00:680291499904073739>\\✅ Muted \`${target.user.tag}\`${mendm}`);
    }

    if (time) {
        /*setTimeout(async () => {
            if (mutedRole) {
                if (!toMute.roles.cache.has(mutedRole.id)) return;
                // Remove the mentioned users role "mutedRole", "muted.json", and notify command sender
                await toMute.roles.remove(mutedRole, `unmuting automatically after ${dur}`);
                if (toMute.voice.connection && toMute.voice.mute) {
                    toMute.voice.setMute(false);
                }
            }
        }, time)*/
        const data: UnmuteActionData = {
            guildid: target.guild.id,
            userid: target.id,
            roleid: mutedRole.id,
            duration: duration
        }

        if (client.database) {
            if (time) {
                const t = moment().add(time, "ms").toDate();
                await client.database.setAction(uniqid(), t, "unmute", data);
            }
        }
        //await set(data);
    }
}

/**
 * Ban a target permanently or for a period.
 */
export async function ban(client: XClient, target: GuildMember, time = 0, mod?: string, channel?: TextChannel): Promise<void> {
    if (!client.database) return;
    const moderator = target.guild.members.cache.get(mod || client.user?.id || "");
    await target.ban({
        reason: `banned by ${moderator?.user.tag || "me"}`
    });

    let duration = "";
    let mendm = "";
    if (time) {
        duration = durationToString(time);
        mendm = ` for ${duration}`
    }

    if (channel) {
        channel.send(`<a:spinning_light00:680291499904073739>\\✅ Banned \`${target.user.tag}\`${mendm}`);
    }

    if (time) {
        const data: UnbanActionData = {
            guildid: target.guild.id,
            userid: target.id,
            duration: duration
        }

        if (client.database) {
            if (time) {
                const t = moment().add(time, "ms").toDate();
                await client.database.setAction(uniqid(), t, "unban", data);
            }
        }
    }
    registerBan(client, target);
}

export async function registerBan(client: XClient, target: GuildMember): Promise<void> {
    if (!client.database) return;
    const pud = await client.database.getUserData(target.id);
    const gud = await client.database.getGuildUserData(target.guild.id, target.id);
    if (!pud.bans) {
        pud.bans = 1;
    } else {
        pud.bans++;
    }
    if (gud.bans) {
        gud.bans++;
    } else {
        gud.bans = 1;
    }
    await client.database.updateUserData(pud);
    await client.database.updateGuildUserData(gud);
}

export async function checkWarnings(client: XClient, target: GuildMember): Promise<void> {
    try {
        if (!client.database || !target.bannable || !target.kickable) return;
        const ud = await client.database.getGuildUserData(target.guild.id, target.id);
        const warnConfig = await client.database?.getGuildSetting(target.guild, "warnconfig");
        if (!warnConfig) return;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let conf: WarnConf = {};
        try {
            conf = JSON.parse(warnConfig.value);
        } catch (error) {
            //
        }
        if (!warnConfig) {
            return;
        }
        if (!conf.threshold || typeof conf.threshold !== "number" || !conf.punishment || typeof conf.punishment !== "string") {
            await client.database.editGuildSetting(target.guild, "warnconfig", undefined, true);
            return;
        }
        if (conf.threshold === -1) {
            return;
        }
        const overWarnLimit = 0 < (conf.threshold ? conf.threshold : -1) && (ud.warnings || 0) > (conf.threshold ? conf.threshold : -1);
        let ptime = 0;
        if (conf.time && typeof conf.time === "number") {
            ptime = conf.time;
        }
        // const warnPunishmentResult = await client.database.getGuildSetting(target.guild.id, "warnpunishment");
        // const warnPunishment = warnPunishmentResult ? warnPunishmentResult.value : "";
        if (overWarnLimit && target.bannable && target.kickable) {
            switch (conf.punishment) {
                case "ban": {
                    if (ud.bans) {
                        ud.bans++;
                    } else {
                        ud.bans = 1;
                    }
                    /*if (!pud.bans) {
                        pud.bans = 1;
                    } else {
                        pud.bans++;
                    }*/
                    await ban(client, target, 0, client.user?.id);
                    break;
                }
                case "kick": {
                    await target.kick();
                    break;
                }
                case "mute": {
                    await mute(client, target, 0, client.user?.id);
                    break;
                }
                case "tempban": {
                    if (ud.bans) {
                        ud.bans++;
                    } else {
                        ud.bans = 1;
                    }
                    /*if (!pud.bans) {
                        pud.bans = 1;
                    } else {
                        pud.bans++;
                    }*/
                    await ban(client, target, ptime * 1000, client.user?.id);
                    break;
                }
                case "tempmute": {
                    await mute(client, target, ptime * 1000, client.user?.id);
                    break;
                }
                default:
                    conf.punishment = undefined;
                    await client.database.editGuildSetting(target.guild, "warnconfig", JSON.stringify(conf));
                    break;
            }
        }
    } catch (error) {
        xlg.error(error);
    }
}