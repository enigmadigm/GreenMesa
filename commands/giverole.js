const xlg = require("../xlogger");
const { permLevels } = require('../permissions');
const { stringToMember, stringToRole } = require("../utils/parsers");
const { getGlobalSetting } = require("../dbmanager");

module.exports = {
    name: "giverole",
    aliases: ["role"],
    description: {
        short: "assigns a member a role",
        long: "Assign a member or all members a role."
    },
    usage: "<member|@role> <role>",
    args: true,
    permLevel: permLevels.trustedMember,
    guildOnly: true,
    ownerOnly: false,
    async execute(client, message, args) {
        try {
            let target = await stringToMember(message.guild, args[0], true, false, false) || stringToRole(message.guild, args[0], true, true, false);
            if (!target) {
                if (args[0] === "all" || args[0] === "everyone" || args[0] === "@everyone") {
                    target = "all";
                } else {
                    client.specials.sendError(message.channel, "Member/role target not specified/valid.");
                    return false;
                }
            }
            args.shift();
            const targetRole = await stringToRole(message.guild, args.join(" "), true, true, false);
            if (!targetRole) {
                client.specials.sendError(message.channel, "Role-to-give not specified/valid.");
                return false;
            }
            if (target === "all") {
                const targets = await message.guild.members.fetch();
                let errored = false;
                await targets.each(async (m) => {
                    try {
                        await m.roles.add(targetRole);
                    } catch (error) {
                        if (!errored) {
                            xlg.error(error);
                            client.specials.sendError(message.channel, `Error giving ${targetRole} en mass`);
                            errored = true;
                        }
                    }
                });
            } else {
                const targets = message.guild.members.cache.filter((m) => m.id === target.id || (m.roles && m.roles.cache.get(target.id) && !m.roles.cache.get(targetRole.id)));
                let errored = false;
                await targets.each(async (m) => {
                    try {
                        await m.roles.add(targetRole);
                    } catch (error) {
                        if (!errored) {
                            xlg.error(error);
                            client.specials.sendError(message.channel, `Error giving ${targetRole} en mass to ${target}`);
                            errored = true;
                        }
                    }
                });
            }
            await message.channel.send({
                embed: {
                    color: parseInt((await getGlobalSetting("success_embed_color"))[0].value, 10),
                    description: `Role given to ${(target === "all") ? message.guild.members.cache.size : message.guild.members.cache.filter((m) => m.id === target.id || (m.roles && m.roles.cache.get(target.id) && !m.roles.cache.get(targetRole.id))).size} member(s)`
                }
            })

        } catch (error) {
            xlg.error(error);
            await client.specials.sendError(message.channel);
            return false;
        }
    }
}