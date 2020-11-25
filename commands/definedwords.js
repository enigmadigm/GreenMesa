const xlg = require("../xlogger");
const { getGlobalSetting } = require("../dbmanager");

module.exports = {
    name: "definedwords",
    description: {
        short: "list the words defined in the past",
        long: "This lists all of the words that have been defined using the define command in the past."
    },
    category: "utility",
    async execute(client, message) {
        try {
            const config = require("../auth.json");
            let totalDefined = await getGlobalSetting("definedcount");
            message.channel.send({
                embed: {
                    title: "`Define` Statistics",
                    fields: [
                        {
                            name: "Total Definitions Given",
                            value: `${totalDefined[0] ? totalDefined[0].value : "0"}`
                        },
                        {
                            name: "Unique Words Defined",
                            value: config.wordsDefined.length
                        }
                    ]
                }
            })
        } catch (error) {
            xlg.error(error);
        }
    }
}