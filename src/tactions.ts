import moment from "moment";
import { Bot } from "./bot";
import { TimedAction, UnbanActionData, UnmuteActionData } from "./gm";
import { Contraventions } from "./utils/contraventions";
import xlg from "./xlogger";

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
            const r = await Bot.client.database.getActions(1);
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
            const a = this.scheduled.slice(0, 1)[0];
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
                    const d = <UnmuteActionData>action.data;
                    if (!d.guildid || !d.userid || !d.roleid) return;

                    const g = await Bot.client.guilds.fetch(d.guildid);
                    if (!g) break;
                    const m = g.members.cache.get(d.userid);
                    if (!m) break;
                    if (!m.roles.cache.has(d.roleid)) break;

                    // Remove the mentioned users role and make notation in audit log
                    await m.roles.remove(d.roleid, `unmuting automatically after ${d.duration}`);
                    if (m.voice.connection && m.voice.mute) {
                        m.voice.setMute(false);
                    }
                    Contraventions.logUnmute(m, m.guild.me || "", `Automatic unmute after ${d.duration}`);//Automic
                    break;
                }
                case "unban": {
                    const d = <UnbanActionData>action.data;
                    if (!d.guildid || !d.userid) return;

                    try {
                        const g = await Bot.client.guilds.fetch(d.guildid);
                        if (!g) break;
    
                        await g.members.unban(d.userid, `unbanning automatically after ${d.duration}`);
                        Contraventions.logUnban(g.id, d.userid, Bot.client.user?.id || "", `Automatic unban after ${d.duration}`);
                    } catch (error) {
                        //
                    }
                    break;
                }
                default:
                    break;
            }

            await Bot.client.database.deleteAction(action.id);
        } catch (error) {
            xlg.error(error);
        }
    }

    stopPolling(): void {
        clearInterval(this.timer);
    }
}