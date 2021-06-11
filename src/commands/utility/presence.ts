import { ActivityType, PresenceStatusData } from 'discord.js';
import { Command } from 'src/gm';
import { permLevels } from '../../permissions';

export const command: Command = {
    name: 'presence',
    aliases: ['status'],
    permLevel: permLevels.botMaster,
    examples: [
        "--type=WATCHING",
        "--status=dnd",
    ],
    args: false,
    flags: [
        {
            f: `status`,
            d: `dnd, offline, etc`,
        },
        {
            f: `name`,
            d: `visible description`,
        },
        {
            f: `type`,
            d: `watching, listening, etc`,
        },
        {
            f: `afk`,
            d: `no idea what this does`,
        },
        {
            f: `default`,
            d: `ignore other values and use hardcoded default`,
        },
    ],
    async execute(client, message, args, flags) {
        const presence = await client.database.getStoredPresence(true);
        const a = args.join(" ");
        if (!flags.length) {
            await message.channel.send(`${JSON.stringify(presence, null, 2)}`, { code: true });
        }
        let f;
        if ((f = flags.find(x => x.name === "status")) && ['online', 'idle', 'dnd', 'invisible'].includes(f.value.toLowerCase())) {
            if (presence.status === f.value.toLowerCase()) {
                await message.channel.send({
                    embed: {
                        color: await client.database.getColor("fail"),
                        description: `Client Status is already **${presence.status}**`
                    }
                });
            } else {
                presence.status = f.value.toLowerCase() as PresenceStatusData;
                const editRes = await client.database.setStoredPresence(presence, message.author);
                if (editRes && editRes.affectedRows) {
                    await message.channel.send({
                        embed: {
                            color: await client.database.getColor("success"),
                            description: `**Client Status changed to:**\n${presence.status}`,
                        }
                    });
                }
            }
        }
        if ((f = flags.find(x => x.name === "type")) && ['PLAYING', 'STREAMING', 'WATCHING', 'LISTENING', 'COMPETING'].includes(f.value.toUpperCase())) {
            if (presence.type === f.value.toUpperCase()) {
                await message.channel.send({
                    embed: {
                        color: await client.database.getColor("fail"),
                        description: `**Type is already:**\n${f.value}`,
                    }
                });
            } else {
                presence.type = f.value.toUpperCase() as ActivityType;
                const editRes = await client.database.setStoredPresence(presence, message.author);
                if (editRes && editRes.affectedRows) {
                    await message.channel.send({
                        embed: {
                            color: await client.database.getColor("success"),
                            description: `**Type changed to:**\n${presence.type}`
                        }
                    });
                }
            }
        }
        if ((f = flags.find(x => x.name === "afk"))) {
            presence.afk = !presence.afk;
            const editRes = await client.database.setStoredPresence(presence, message.author);
            if (editRes && editRes.affectedRows) {
                await message.channel.send({
                    embed: {
                        color: await client.database.getColor("success"),
                        description: `AFK **${presence.afk ? "turned on" : "turned off"}**`,
                    }
                });
            }
        }
        if ((f = flags.find(x => x.name === "default"))) {
            console.log(presence)
            presence.useDefault = !presence.useDefault;
            const editRes = await client.database.setStoredPresence(presence, message.author);
            if (editRes && editRes.affectedRows) {
                await message.channel.send({
                    embed: {
                        color: await client.database.getColor("success"),
                        description: `Default **${presence.useDefault ? "activated" : "deactivated"}**`,
                    }
                });
            }
        }
        if ((f = flags.find(x => x.name === "name")) || a) {
            if ((f && f.value === presence.name) || a === presence.name) {
                await message.channel.send({
                    embed: {
                        color: await client.database.getColor("fail"),
                        description: `**Presence text is already:**\n${presence.name}`,
                    }
                });
            } else {
                presence.name = f ? f.value : a;
                const editRes = await client.database.setStoredPresence(presence, message.author);
                if (editRes && editRes.affectedRows) {
                    await message.channel.send({
                        embed: {
                            color: await client.database.getColor("success"),
                            description: `**Text changed to:**\n${presence.name}`,
                        }
                    });
                }
            }
        }
    }
}
