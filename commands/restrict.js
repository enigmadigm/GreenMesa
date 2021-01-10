const xlg = require("../xlogger");
const { permLevels } = require('../permissions');
const { getGuildSetting } = require("../dbmanager");

module.exports = {
    name: "restrict",
    description: {
        short: "restrict command usage to a certain role",
        long: "Use to restrict the usage of all commands for this bot to a certain specified role in the server"
    },
    usage: "<command> <role>",
    args: true,
    permLevel: permLevels.admin,
    guildOnly: true,
    ownerOnly: true,
    async execute(client, message, args) {
        try {
            let moderationEnabled = await getGuildSetting(message.guild, 'all_moderation');
            if (!moderationEnabled[0] || moderationEnabled[0].value === 'disabled') {
                return client.specials.sendModerationDisabled(message.channel);
            }
            
            client.specials.sendError(message.channel, "Command currently in development");
        } catch (error) {
            xlg.error(error);
            client.specials.sendError(message.channel);
            return false;
        }
    }
}