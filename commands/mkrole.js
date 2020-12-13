const xlg = require("../xlogger");
const { getGlobalSetting } = require("../dbmanager");
const { permLevels } = require('../permissions');

module.exports = {
    name: "mkrole",
    description: {
        short: "create a role",
        long: "Creates a role with the given data. This does not take permissions, and by default will give no permissions to the role. NOTE that this command takes arguments separated by commas, do not include them in the name."
    },
    usage: "<role name>,[role color]",
    args: true,
    permLevel: permLevels.admin,
    category: "moderation",
    async execute(client, message, args) {
        try {
            let param = args.join(" ").split(",");
            if (param[0] && param[0].length > 100) {// if the provided name is longer than the 100 character limit
                await client.specials.sendError(message.channel, "Role name cannot exceed 100 characters");
                return;
            }
            let roleData = { name: param[0] };
            if (args[1] && parseInt(param[1], 16)) {
                roleData.color = parseInt(param[1], 16);
            }
            const nrole = await message.guild.roles.create({ data: roleData, reason: "with mkrole command" });

            message.channel.send({
                embed: {
                    color: parseInt((await getGlobalSetting('success_embed_color'))[0].value),
                    description: `Role ${nrole} created successfully`
                }
            });
        } catch (error) {
            xlg.error(error);
            await client.specials.sendError(message.channel, "Failure while creating role");
            return false;
        }
    }
}