const { getGlobalSetting } = require('../dbmanager');
const xlg = require("../xlogger");

async function sendModerationDisabled(channel) {
    let fail_embed_color = parseInt((await getGlobalSetting("fail_embed_color"))[0].value, 10);
    channel.send({
        embed: {
            color: fail_embed_color,
            description: `Server moderation in ${channel.guild.name} is currently disabled. In order to use moderation commands, they must be enabled by admins with \`settings moderation enable\`.`
        }
    }).catch(xlg.error);
}

exports.sendModerationDisabled = sendModerationDisabled;