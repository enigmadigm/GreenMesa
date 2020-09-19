const xlg = require("../xlogger");
const { permLevels } = require('../permissions');
const { getGlobalSetting } = require("../dbmanager");

module.exports = {
    name: 'listroles',
    aliases: ['lsroles'],
    description: 'list all of the roles in a server',
    guildOnly: true,
    permLevel: permLevels.trustedMember,
    async execute(client, message) {
        message.channel.send({
            embed: {
                color: parseInt((await getGlobalSetting("info_embed_color") || ['7322774'])[0].value, 10),
                author: {
                    name: `${message.guild.name} Roles`,
                    icon_url: message.guild.iconURL()
                },
                description: `${message.guild.roles.cache.sort((roleA, roleB) => roleB.position - roleA.position).array().map(r => `\`${r.name}\``).join("\n") || '*none*'}`,
                footer: {
                    text: `Roles: ${message.guild.roles.cache.array().length}`
                }
            }
        }).catch(xlg.error);
    }
}