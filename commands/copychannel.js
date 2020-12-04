const xlg = require("../xlogger");
const { permLevels } = require('../permissions');
const { getGlobalSetting, getGuildSetting } = require("../dbmanager");
const { stringToChannel } = require('../utils/parsers');

module.exports = {
    name: "copychannel",
    aliases: ["cpchan"],
    description: {
        short: "copy a channel",
        long: "Send this command with the channel to copy as an argument and almost every part of that channel, including the name and position, will be copied to a new channel."
    },
    category: "moderation",
    usage: "<#channel>",
    args: true,
    specialArgs: undefined,
    permLevel: permLevels.admin,
    guildOnly: true,
    async execute(client, message, args) {
        try {
            let moderationEnabled = await getGuildSetting(message.guild, 'all_moderation');
            if (!moderationEnabled[0] || moderationEnabled[0].value === 'disabled') {
                return client.specials.sendModerationDisabled(message.channel);
            }
            
            let target = stringToChannel(message.guild, args.join(" "), true, true);
            if (!target) {
                xlg.log(target)
                await client.specials.sendError(message.channel, "Invalid channel");
                return;
            }
            try {
                await message.guild.channels.create(target.name, { type: target.type, parent: target.parent, permissionOverwrites: target.permissionOverwrites, position: target.position });
            } catch (error) {
                xlg.error(error);
                client.specials.sendError(message.channel, "Could not copy the channel. Do I lack permissions?");
                return false;
            }
            
            await message.channel.send({
                embed: {
                    color: parseInt((await getGlobalSetting('info_embed_color'))[0].value),
                    description: `Channel copied`
                }
            });
        } catch (error) {
            xlg.error(error);
            await client.specials.sendError(message.channel);
            return false;
        }
    }
}