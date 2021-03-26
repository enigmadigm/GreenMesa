import xlg from "../../xlogger";
import { permLevels } from '../../permissions';
import { Command } from "src/gm";
import { stringToMember } from "../../utils/parsers";
import { getFriendlyUptime } from "../../utils/time";

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

async function* delayedLoop(start: number, end: number, increment: number, delay: number) {
    for (let i = start; i < end; i += increment) {
        yield i
        await sleep(delay)
    }
}

function parseFriendlyUptime(t: { hours: number, minutes: number, seconds: number, days: number }) {
    const th = t.hours + (t.days * 24);
    const tm = t.minutes;
    const ts = t.seconds;
    const ttypes = ["hours", "minutes", "seconds"];
    if (!th)
        ttypes.splice(ttypes.indexOf("hours"), 1);
    if (!tm)
        ttypes.splice(ttypes.indexOf("minutes"), 1);
    if (!ts)
        ttypes.splice(ttypes.indexOf("seconds"), 1);
    const tt = [th, tm, ts].filter(x => x > 0).map((x, i, xt) => {
        return `${x} ${ttypes[i]}${i !== (xt.length - 1) ? (xt.length > 1 && xt.length - 2 === i ? `${xt.length > 2 ? "," : ""} and ` : ", ") : ""}`;
    });
    return tt.join("");
}

export const command: Command = {
    name: "strip",
    description: {
        short: "strip all roles from a member",
        long: "Strip all accessible roles from a member."
    },
    usage: "<member>",
    args: true,
    cooldown: 1,
    permLevel: permLevels.admin,
    guildOnly: true,
    moderation: true,
    async execute(client, message, args) {
        try {
            if (!message.guild || !message.member) return;

            const g = await message.guild.fetch();
            if (!g.me) {
                client.specials?.sendError(message.channel, "Something must be wrong with my configuration on this server", true)
                return;
            }
            const target = await stringToMember(g, args[0], false, false, false);
            if (!target) {
                await client.specials?.sendError(message.channel, "Invalid target", true);
                return;
            }

            if (g.me.roles.highest.position <= 1) {
                await client.specials?.sendError(message.channel, "I don't have a role above the bottom", true);
                return;
            }

            const roles = target.roles.cache.filter((x) => (x.position < (g.me?.roles.highest.position || 0)) && x.name !== "@everyone");

            if (!roles.size) {
                await client.specials?.sendError(message.channel, "No strippable roles. My highest role probably is not high enough, or the member has no roles.", true);
                return;
            }

            try {
                const loop = delayedLoop(0, roles.size, 1, 200);
                const t = getFriendlyUptime(roles.size * 200 + 500);
                const fu = parseFriendlyUptime(t);
                await message.channel.send({
                    embed: {
                        color: await client.database.getColor("info_embed_color"),
                        description: `**ETA:**\n${fu}`
                    }
                });

                const rolesArray = roles.array();

                for await (const i of loop) {
                    const r = rolesArray[i];
                    await target.roles.remove(r);
                }
            } catch (e) {
                xlg.error(e);
                client.specials?.sendError(message.channel, `Error stripping roles.`);
            }

            await message.channel.send({
                embed: {
                    color: await client.database.getColor("success_embed_color"),
                    description: `All roles successfully stripped from ${target} (${target.id})`
                }
            });
        } catch (error) {
            xlg.error(error);
            await client.specials?.sendError(message.channel);
            return false;
        }
    }
}
