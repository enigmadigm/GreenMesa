import { permLevels } from '../../permissions.js';
import { Command } from "src/gm";

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

async function* delayedLoop(start: number, end: number, increment: number, delay: number) {
    for (let i = start; i < end; i += increment) {
        yield i
        await sleep(delay)
    }
}

export const command: Command = {
    name: "lockprep",
    description: {
        short: "prepare the lock command",
        long: "Use to prepare usage of the `lock` and `lockall` commands. This tries to disable the Send Messages privilege for all roles in a server. Obviously, this will not work for roles outside of the access of the bot's permissions."
    },
    usage: "",
    cooldown: 1,
    permLevel: permLevels.admin,
    guildOnly: true,
    moderation: true,
    async execute(client, message) {
        try {
            const g = await message.guild.fetch();
            const roles = g.roles.cache.filter(x => (x.position < (message.guild?.me?.roles.highest.position || 0)) && x.position !== 0);

            try {
                const loop = delayedLoop(0, roles.size, 1, 200);

                const rolesArray = [...roles.values()];
                for await (const i of loop) {
                    const r = rolesArray[i];
                    /*const everyone = g.roles.cache.find(x => x.position === 0);
                    if (!everyone) {
                        client.specials?.sendError(message.channel, "unable to access @everyone role");
                        return;
                    }*/
                    r.setPermissions(r.permissions.remove(2048n));
                }
            } catch (e) {
                xlg.error(e);
                await client.specials.sendError(message.channel, `Error revoking message permissions.`);
            }

            await message.channel.send({
                embeds: [{
                    color: await client.database.getColor("success"),
                    description: `Updated permissions of ${roles.size} roles`,
                }],
            });
        } catch (error) {
            xlg.error(error);
            await client.specials.sendError(message.channel);
            return false;
        }
    }
}
