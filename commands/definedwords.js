const xlg = require("../xlogger");
const { getGlobalSetting } = require("../dbmanager");

module.exports = {
    name: "definedwords",
    description: {
        short: "list the words defined in the past",
        long: "This lists all of the words that have been defined using the define command in the past."
    },
    async execute(client, message) {
        try {
            let totalDefined = await getGlobalSetting("definedcount");
            message.channel.send({
                embed: {
                    title: "`Define` Statistics",
                    description: `${totalDefined}`
                }
            })
        } catch (error) {
            xlg.error(error);
        }
    }
}