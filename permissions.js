const xlg = require("./xlogger");
const { getGlobalSetting } = require("./dbmanager");

const permLevels = {
    member : 0,
    immune : 1,
    mod : 2,
    admin : 3,
    botMaster : 4,
}

async function getPermLevel(member) {
    if (member == null) {
        return permLevels.member;
    }
    let botmasters = await getGlobalSetting("botmasters").catch(xlg.error);
    botmasters = botmasters[0].value.split(',');
    if (botmasters.includes(member.user.id)) {
        return permLevels.botMaster;
    }
    if (member.hasPermission('ADMINISTRATOR')) { // if a user has admin rights he's automatically a admin
        return permLevels.admin;
    }
}

exports.permLevels = permLevels;
exports.getPermLevel = getPermLevel;
