import { Command } from "src/gm";

//import { getGlobalSetting } from "../dbmanager";

export const command: Command = {
    name: "definedwords",
    description: {
        short: "list the words defined in the past",
        long: "This lists all of the words that have been defined using the define command in the past."
    },
    async execute(client, message) {
        try {
            const config = await import("../../../auth.json");
            const totalDefined = await client.database.getGlobalSetting("definedcount");
            message.channel.send({
                embed: {
                    title: "`Define` Statistics",
                    fields: [
                        {
                            name: "Total Definitions Given",
                            value: `${totalDefined ? totalDefined.value : "0"}`
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

