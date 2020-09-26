const { getGlobalSetting } = require('../dbmanager');
const xlg = require("../xlogger");
const moment = require('moment');

async function sendModerationDisabled(channel) {
    let fail_embed_color = parseInt((await getGlobalSetting("fail_embed_color"))[0].value, 10);
    channel.send({
        embed: {
            color: fail_embed_color,
            description: `Server moderation in ${channel.guild.name} is currently disabled. In order to use moderation commands, they must be enabled by admins with \`settings moderation enable\`.`
        }
    }).catch(xlg.error);
}

async function timedMessagesHandler(client) {
    setInterval(async () => {
        if (moment().utcOffset(-5).format('M/D HH:mm') == "9/26 21:30") {
            (await client.channels.fetch((await getGlobalSetting('primchan'))[0].value)).send('happy birthday');
        }
    }, 60000);
}

exports.sendModerationDisabled = sendModerationDisabled;
exports.timedMessagesHandler = timedMessagesHandler;