import xlg from "../../xlogger";
import { permLevels } from '../../permissions';
import { Command } from "src/gm";
import { TextChannel } from "discord.js";

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

async function* delayedLoop(start: number, end: number, increment: number, delay: number) {
    for (let i = start; i < end; i += increment) {
        yield i
        await sleep(delay)
    }
}

export const command: Command = {
    name: "lockall",
    description: {
        short: "stop users from sending messages in all channels",
        long: "Refer to the help of the `lock` command. It works the same way."
    },
    usage: "",
    args: false,
    cooldown: 1,
    permLevel: permLevels.admin,
    moderation: true,
    guildOnly: true,
    ownerOnly: false,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async execute(client, message, args) {
        try {
            if (!message.guild || !message.member) return;

            const g = await message.guild.fetch();
            const channels = g.channels.cache;
            const everyone = g.roles.cache.find(x => x.position === 0);
            if (!everyone) {
                client.specials?.sendError(message.channel, "Unable to access @everyone role");
                return;
            }

            try {
                const loop = delayedLoop(0, channels.size, 1, 200);
                const channelArray = channels.array();

                for await (const i of loop) {
                    const channel = channelArray[i];
                    if (!(channel instanceof TextChannel)) {
                        continue;
                    }
                    const p = channel.permissionsFor(everyone);
                    if (p?.serialize().SEND_MESSAGES) {
                        await channel.updateOverwrite(everyone, {
                            'SEND_MESSAGES': false
                        });
                    }
                    const overwrites = channel.permissionOverwrites.array();
                    
                    for (const o of overwrites) {
                        try {
                            const p = channel.permissionsFor(o.id);
                            if (o.type !== "role") continue;
                            const r2 = g.roles.cache.get(o.id);
                            if (r2 && g.me && r2.position > g.me.roles.highest.position) {
                                continue;
                            }
                            
                            if (p?.serialize().SEND_MESSAGES) {
                                await o.update({
                                    'SEND_MESSAGES': false
                                });
                            }
                        } catch (e) {
                            //
                        }
                    }
                    channel.send("This channel has been locked");
                }
            } catch (e) {
                xlg.error(e);
                client.specials?.sendError(message.channel, `Error revoking message permissions.`);
            }
        } catch (error) {
            xlg.error("lockall", error);
            await client.specials?.sendError(message.channel);
            return false;
        }
    }
}
