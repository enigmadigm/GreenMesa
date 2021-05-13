
import { permLevels } from '../../permissions';
import { Command } from "src/gm";
import { parseFriendlyUptime, stringToMember } from "../../utils/parsers";
import { getFriendlyUptime } from "../../utils/time";

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

async function* delayedLoop(start: number, end: number, increment: number, delay: number) {
    for (let i = start; i < end; i += increment) {
        yield i
        await sleep(delay)
    }
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
                        color: await client.database.getColor("info"),
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
                    color: await client.database.getColor("success"),
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
