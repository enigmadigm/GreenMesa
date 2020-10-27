const xlg = require("./xlogger");
//const { getGlobalSetting } = require("../dbmanager");

// if (!message.channel.permissionsFor(message.guild.me).has(["SEND_MESSAGES"]) || !message.channel.manageable)

async function potatoRoler(member) {
    try {
        if (!member.manageable) return xlg.log("potatoRoler: not manageable");
        await member.roles.add("754071177156100136");
    } catch (error) {
        xlg.error(error);
    }
}

exports.potatoRoler = potatoRoler;