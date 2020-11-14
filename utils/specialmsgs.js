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

async function sendError(channel, message) {
    channel.send({
        embed: {
            color: parseInt((await getGlobalSetting('fail_embed_color'))[0].value) || 16711680,
            description: (message && message.length) ? message : "Something went wrong. ¯\\_(ツ)_/¯"
        }
    }).catch(xlg.error)
    return;
}

async function argsNumRequire(channel, args, num) {
    if (args.length == num) return true;
    let fail_embed_color = parseInt((await getGlobalSetting("fail_embed_color"))[0].value, 10);
    channel.send({
        embed: {
            color: fail_embed_color,
            description: `The wrong number of arguments was provided.\nThis command requires \` ${num} \` arguments.`
        }
    }).catch(xlg.error);
    return false;
}

async function argsMustBeNum(channel, args) {
    if (!args || !args.length) return false;
    let forResult = true;
    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        if (isNaN(arg)) {
            forResult = false;
        }
    }
    if (!forResult) {
        channel.send({
            embed: {
                color: parseInt((await getGlobalSetting('fail_embed_color'))[0].value),
                title: "invalid arguments",
                description: "all arguments must be numbers (floating or integer)"
            }
        }).catch(xlg.error);
        return false;
    }
    return true;
}

async function timedMessagesHandler(client) {
    setInterval(async () => {
        if (moment().utcOffset(-5).format('M/D HH:mm') == "9/26 21:30") {
            (await client.channels.fetch((await getGlobalSetting('primchan'))[0].value)).send('happy birthday');
        }
    }, 60000);
}

exports.sendModerationDisabled = sendModerationDisabled;
exports.sendError = sendError;
exports.timedMessagesHandler = timedMessagesHandler;
exports.argsNumRequire = argsNumRequire;
exports.argsMustBeNum = argsMustBeNum;