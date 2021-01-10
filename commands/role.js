const xlg = require("../xlogger");
const { permLevels } = require('../permissions');
const { stringToMember, stringToRole } = require("../utils/parsers");
const { getGlobalSetting, getGuildSetting } = require("../dbmanager");

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
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
            if (!targetRole) {
                client.specials.sendError(message.channel, "Role-to-toggle not specified/valid.");
                return false;
            }
            if (target === "all") {
                const targets = g.members.cache;
                let errored = false;
                await targets.each(async (m) => {
                    try {
                        if (m.roles.cache.has(targetRole.id)) {
                            await m.roles.remove(targetRole);
                            await sleep(500);
                        } else {
                            await m.roles.add(targetRole);
                            await sleep(500);
                        }
                    } catch (error) {
                        if (!errored) {
                            xlg.error(error);
                            client.specials.sendError(message.channel, `Error toggling ${targetRole} en mass.`);
                            errored = true;
                        }
                    }
                });
            } else {
                const targets = g.members.cache.filter((m) => m.id === target.id || (m.roles && m.roles.cache.get(target.id) && !m.roles.cache.get(targetRole.id)));
                let errored = false;
                await targets.each(async (m) => {
                    try {
                        if (m.roles.cache.has(targetRole.id)) {
                            await m.roles.remove(targetRole);
                            await sleep(500);
                        } else {
                            await m.roles.add(targetRole);
                            await sleep(500);
                        }
                    } catch (error) {
                        if (!errored) {
                            xlg.error(error);
                            client.specials.sendError(message.channel, `Error toggling ${targetRole} en mass to ${target}`);
                            errored = true;
                        }
                    }
                });
            }
            await message.channel.send({
                embed: {
                    color: parseInt((await getGlobalSetting("success_embed_color"))[0].value, 10),
                    description: `Role toggled on ${(target === "all") ? g.members.cache.size : g.members.cache.filter((m) => m.id === target.id || (m.roles && m.roles.cache.get(target.id) && !m.roles.cache.get(targetRole.id))).size} member(s)`
                }
            })

        } catch (error) {
            xlg.error(error);
            await client.specials.sendError(message.channel);
            return false;
        }
    }
}