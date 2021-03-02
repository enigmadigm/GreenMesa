import { GuildMember } from "discord.js";
import moment from "moment";
import { UnmuteActionData, XClient } from "../gm";
import { durationToString } from "./parsers";
import uniqid from 'uniqid';

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

export async function mute(client: XClient, target: GuildMember, time = 0, mod?: string): Promise<void> {

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
    }
    if (mutedRole.position < target.roles.highest.position) {
        mutedRole.setPosition(target.roles.highest.position);
    }

    // If the mentioned user already has the "mutedRole" then that can not be muted again
    if (target.roles.cache.has(mutedRole.id)) {
        //message.channel.send(`\`${target.user.tag}\` is already muted`);
        return;
    }

    await target.roles.add(mutedRole, `muted by ${mod}`).catch(e => console.log(e.stack));
    if (target.voice.connection && !target.voice.mute) {
        await target.voice.setMute(true);
    }

    //message.channel.send(`<a:spinning_light00:680291499904073739>\\✅ Muted \`${toMute.user.tag}\`${mendm}`);
    let duration = "";
    if (time) {
        duration = durationToString(time);
        //mendm = ` for ${dur}`
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