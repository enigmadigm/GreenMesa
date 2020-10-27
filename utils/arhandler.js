const xlg = require("../xlogger");
//const { getGlobalSetting } = require("../dbmanager");

// if (!message.channel.permissionsFor(message.guild.me).has(["SEND_MESSAGES"]) || !message.channel.manageable)

async function potatoRoler(member) {
    try {
        if (member.guild.id !== "725784760366006353") return;
        await member.roles.add("754071177156100136");
    } catch (error) {
        xlg.error(error);
    }
}

exports.potatoRoler = potatoRoler;