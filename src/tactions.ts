import { Permissions } from "discord.js";
import moment from "moment";
import { Bot } from "./bot.js";
import { TimedAction, TimedActionPayload } from "./gm";
import { unmute } from "./utils/modactions.js";

export class TimedActionsSubsystem {
    private scheduled: TimedAction[];
    private running: boolean;
    private timer: NodeJS.Timeout;

    constructor() {
        this.scheduled = [];
        this.running = false;
        this.timer = setInterval(async () => {
            await this.poll();
        }, 1000);
    }

    async poll(): Promise<void> {
        try {
            const r = await Bot.client.database.getTimedActionsRange(1);
            if (!r || !r.length) return;
            for (const action of r) {
                if (!this.scheduled.find(x => x.id === action.id)) {
                    this.scheduled.push(action);
                }
            }
            this.run();
        } catch (error) {
            xlg.error(error);
        }
    }

    private async run() {
        if (this.running) {
            return;
        } else {
            this.running = true;
        }

        while (this.scheduled.length) {
            const a = this.scheduled.splice(0, 1)[0];// remove the first scheduled action and execute
            // so it will not execute repeateduly when it is already running
            const t = moment(a.time).diff(moment(), "s");
            if (t <= 1) {
                this.execute(a);
            }
        }
        this.running = false;
    }

    private async execute(action: TimedAction) {
        try {
            this.scheduled.shift();
            if (!action.type) return;
            switch (action.type) {
                case "unmute": {
                    const d = action.data;
                    if (!d.guildid || !d.userid || !d.roleid) break;

                    const g = Bot.client.guilds.cache.find(x => x.id === d.guildid);
                    if (!g || !g.me?.permissions.has(Permissions.FLAGS.MANAGE_ROLES)) break;
                    let m = g.members.cache.get(d.userid);
                    if (!m) {
                        m = await g.members.fetch(d.userid);
                        if (!m) {
                            await this.resolveAction(action);
                            break;
                        }
                    }
                    // if (!m.roles.cache.has(d.roleid)) {
                    //     await this.resolveAction(action);
                    //     break;
                    // }

                    // Remove the mentioned users role and make notation in audit log
                    // await m.roles.remove(d.roleid, `unmuting automatically after ${d.duration}`);
                    // if (m.voice.serverMute) {
                    //     try {
                    //         await m.voice.setMute(false);
                    //     } catch (error) {
                    //         xlg.error("tactions error removing voice mute", error)
                    //     }
                    // }
                    // await Contraventions.logUnmute(m, m.guild.me || "", `Automatic unmute after ${d.duration}`);//Automic
                    // await Bot.client.database.deleteAction(action.id);
                    await unmute(Bot.client, m, m.guild.me || "", `Automatic unmute after ${d.duration}`, `unmuting automatically after ${d.duration}`, d.roleid);
                    await this.resolveAction(action);
                    break;
                }
                case "unban": {
                    const d = action.data;
                    if (!d.guildid || !d.userid) break;

                    try {
                        const g = Bot.client.guilds.cache.find(x => x.id === d.guildid);
                        if (!g || !g.me?.permissions.has(Permissions.FLAGS.BAN_MEMBERS)) break;

                        // await g.members.unban(d.userid, `unbanning automatically after ${d.duration}`);
                        // await Contraventions.logUnban(g.id, d.userid, Bot.client.user?.id || "", `Automatic unban after ${d.duration}`);
                        // await Bot.client.database.deleteAction(action.id);
                        await this.resolveAction(action);
                    } catch (error) {
                        //
                    }
                    break;
                }
                default:
                    break;
            }
        } catch (error) {
            if (Bot.client.specials.isNodeError(error)) {
                if (error.message === "Unknown Member" || error.message === "Unknown User") {
                    await this.resolveAction(action, "munknown");
                } else {
                    xlg.error(error);
                }
            }
        }
    }

    private async resolveAction(action: TimedActionPayload, errorReason?: "munknown"): Promise<void> {
        await Bot.client.database.deleteAction(action.id);// remove completed action from database
        this.scheduled.splice(this.scheduled.findIndex(x => x.id === action.id), 1);// in case it wasn't already removed from class schedule
        if (errorReason) {
            if (errorReason === "munknown") {
                xlg.error(`Unable to complete taction:`, `Unknown member/user for action: ${JSON.stringify(action.data)}`)
            }
        }
    }

    public stopPolling(): void {
        clearInterval(this.timer);
    }
}
