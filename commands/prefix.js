const xlg = require("../xlogger");
const { permLevels, getPermLevel } = require("../permissions");
const { setPrefix } = require('../dbmanager')

module.exports = {
    name: "prefix",
    description: "set or view the prefix for your guild",
    guildOnly: true,
    category: 'utility',
    async execute(client, message, args) {
        if (!args.length) {
            return message.channel.send({
                embed: {
                    title: `${message.gprefix}`,
                    description: `guild prefix`
                }
            }).catch(xlg.error);
        }
        var permLevel = await getPermLevel(message.member);
        if (args.length > 0) {
            if (permLevel < permLevels.admin) return message.channel.send("Insufficient permissions.").catch(xlg.error);
            if (args.join(" ").length > 46) return message.channel.send(":frowning2: Prefix must be less than 47 characters.");
            await setPrefix(message.guild.id, args.join(" "));
            return message.channel.send("Prefix updated.");
        }
    }
}