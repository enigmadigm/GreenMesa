const xlg = require("../xlogger");
const { permLevels } = require('../permissions');
const { stringToMember, stringToRole } = require("../utils/parsers");
const { getGlobalSetting, getGuildSetting } = require("../dbmanager");
const { getFriendlyUptime } = require("../utils/time");
const { Role, GuildMember } = require("discord.js");
const roleDelay = 1000;
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function* delayedLoop(start, end, increment, delay) {
    for (let i = start; i < end; i += increment) {
        yield i
        await sleep(delay)
    }
}

function parseFriendlyUptime(t) {
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

module.exports = {
    name: "role",
    description: {
        short: "toggles a role on a member",
        long: "Toggles a role on a member or all members."
    },
    usage: "<@member|@role> <@role to toggle>",
    args: true,
    permLevel: permLevels.admin,
    guildOnly: true,
    async execute(client, message, args) {
        try {
            if (!message || !message.guild) return;
            const g = await message.guild.fetch();

            let moderationEnabled = await getGuildSetting(g, 'all_moderation');
            if (!moderationEnabled[0] || moderationEnabled[0].value === 'disabled') {
                return client.specials.sendModerationDisabled(message.channel);
            }

            let target = await stringToMember(g, args[0], true, false, false) || stringToRole(g, args[0], true, true, false);
            if (!target) {
                if (args[0] === "all" || args[0] === "everyone" || args[0] === "@everyone") {
                    target = "all";
                } else {
                    client.specials.sendError(message.channel, "Member/role target not specified/valid.");
                    return false;
                }
            }
            args.shift();
            const targetRole = await stringToRole(g, args.join(" "), true, true, false);
            if (!targetRole || !(targetRole instanceof Role)) {
                client.specials.sendError(message.channel, "Role-to-toggle not specified/valid.");
                return false;
            }
            if (target === "all") {
                const targets = g.members.cache.array();
                if (!targets.length) return;

                const loop = delayedLoop(0, targets.length, 1, roleDelay);
                const t = getFriendlyUptime(targets.length * roleDelay + 500);
                const fu = parseFriendlyUptime(t);
                await message.channel.send({
                    embed: {
                        color: parseInt((await getGlobalSetting("info_embed_color"))[0].value, 10),
                        description: `**ETA:**\n${fu}`
                    }
                });

                let errored = false;
                for await (const i of loop) {
                    try {
                        const m = targets[i];
                        if (m.roles.cache.has(targetRole.id)) {
                            await m.roles.remove(targetRole);
                            //await sleep(500);
                        } else {
                            await m.roles.add(targetRole);
                            //await sleep(500);
                        }
                    } catch (error) {
                        if (!errored) {
                            xlg.error(error);
                            client.specials.sendError(message.channel, `Error toggling ${targetRole} en mass.`);
                            errored = true;
                        }
                    }
                }

                await message.channel.send({
                    embed: {
                        color: parseInt((await getGlobalSetting("success_embed_color"))[0].value, 10),
                        description: `${targetRole || "Role"} toggled on ${targets.length} member(s)`
                    }
                });
            } else if (target instanceof Role) {
                const targets = g.members.cache.filter((m) => m.roles && m.roles.cache.get(target.id)).array();
                let errored = false;

                const loop = delayedLoop(0, targets.length, 1, roleDelay);
                const t = getFriendlyUptime(targets.length * roleDelay + 500);
                const fu = parseFriendlyUptime(t);
                await message.channel.send({
                    embed: {
                        color: parseInt((await getGlobalSetting("info_embed_color"))[0].value, 10),
                        description: `**ETA:**\n${fu}`
                    }
                });

                for await (const i of loop) {
                    try {
                        const m = targets[i];
                        if (m.roles.cache.has(targetRole.id)) {
                            await m.roles.remove(targetRole);
                            //await sleep(500);
                        } else {
                            await m.roles.add(targetRole);
                            //await sleep(500);
                        }
                    } catch (error) {
                        if (!errored) {
                            xlg.error(error);
                            client.specials.sendError(message.channel, `Error toggling ${targetRole} en mass to ${target}`);
                            errored = true;
                        }
                    }
                }

                await message.channel.send({
                    embed: {
                        color: parseInt((await getGlobalSetting("success_embed_color"))[0].value, 10),
                        description: `${targetRole || "Role"} toggled on ${targets.length} member(s)`
                    }
                });
            } else if (target instanceof GuildMember) {
                if (target.roles.cache.has(targetRole.id)) {
                    await target.roles.remove(targetRole);
                    //await sleep(500);
                    await message.channel.send({
                        embed: {
                            color: parseInt((await getGlobalSetting("success_embed_color"))[0].value, 10),
                            description: `${targetRole || "Role"} removed from ${target}`
                        }
                    });
                } else {
                    await target.roles.add(targetRole);
                    //await sleep(500);
                    await message.channel.send({
                        embed: {
                            color: parseInt((await getGlobalSetting("success_embed_color"))[0].value, 10),
                            description: `${targetRole || "Role"} given to ${target}`
                        }
                    });
                }
            } else {
                client.specials.sendError(message.channel, "No target to assign", true)
            }

        } catch (error) {
            xlg.error(error);
            await client.specials.sendError(message.channel);
            return false;
        }
    }
}