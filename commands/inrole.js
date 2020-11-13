const { getGlobalSetting } = require('../dbmanager')
const xlg = require('../xlogger');
const { stringToRole } = require("../utils/parsers");
const { permLevels } = require('../permissions');

module.exports = {
    name: 'inrole',
    description: 'get the members that have a role',
    usage: '<role>',
    category: 'utility',
    args: true,
    permLevel: permLevels.trustedMember,
    async execute(client, message, args) {
        let target = stringToRole(message.guild, args.join(" "), true, true);
        if (!target) {
            message.channel.send({
                embed: {
                    color: parseInt((await getGlobalSetting('fail_embed_color'))[0].value),
                    description: "that role could not be found"
                }
            }).catch(xlg.error);
            return;
        }
        if (target === "@everyone" || target === "@here") {
            message.channel.send({
                embed: {
                    color: parseInt((await getGlobalSetting('fail_embed_color'))[0].value),
                    description: "no @everyone or @here!"
                }
            }).catch(xlg.error);
            return;
        }
        let userList = target.members.array().map(x => `${x.user.tag || "not identifiable"}`);
        if (userList.join("\n").length > 1024) {
            while (userList.join("\n").length > 1018) {
                userList.pop();
            }
        }
        message.channel.send({
            embed: {
                color: parseInt((await getGlobalSetting('info_embed_color'))[0].value),
                title: `List of users with role \`${target.name}\``,
                description: `***[${userList.length}/${target.members.size}]** =>*\n${userList.join("\n")}`
            }
        }).catch(xlg.error);
    }
}