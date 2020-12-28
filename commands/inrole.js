const { getGlobalSetting } = require('../dbmanager')
const xlg = require('../xlogger');
const { stringToRole } = require("../utils/parsers");
const { permLevels } = require('../permissions');

module.exports = {
    name: 'inrole',
    description: 'get the members that have a role',
    aliases: ['ir'],
    usage: '<role>',
    category: 'utility',
    args: true,
    permLevel: permLevels.trustedMember,
    async execute(client, message, args) {
        try {
            let target = stringToRole(await message.guild.fetch(), args.join(" "), true, true);
            if (!target) {
                message.channel.send({
                    embed: {
                        color: parseInt((await getGlobalSetting('fail_embed_color'))[0].value),
                        description: "that role could not be found"
                    }
                });
                return;
            }
            if (target === "@everyone" || target === "@here") {
                message.channel.send({
                    embed: {
                        color: parseInt((await getGlobalSetting('fail_embed_color'))[0].value),
                        description: "no @everyone or @here!"
                    }
                });
                return;
            }
            let list = [];
            const userList = target.members.array().map(x => {//˾
                const tag = `${x.user.tag || "not identifiable"}`.split("").map((x) => {
                    return x.replace("*", "⁎").replace("_", "\\_").replace("`", "\\`");
                })
                return tag.join("");
            });
            list = userList.slice();
            list.unshift(`***[${userList.length}/${target.members.size}]** =>*`);
            if (list.join("\n").length > 1024) {
                while (list.join("\n").length > 1018) {
                    list.pop();
                }
            }
            list[0] = `***[${list.length - 1}/${target.members.size}]** =>*`;
            message.channel.send({
                embed: {
                    color: parseInt((await getGlobalSetting('info_embed_color'))[0].value),
                    title: `List of users with role \`${target.name}\``,
                    description: `${list.join("\n")}`
                }
            });
        } catch (error) {
            xlg.error(error);
            await client.specials.sendError(message.channel);
            return false;
        }
    }
}