import { Command } from "src/gm";

export const command: Command = {
    name: "definedwords",
    description: {
        short: "list the words defined in the past",
        long: "This lists all of the words that have been defined using the define command in the past.",
    },
    async execute(client, message) {
        const config = await import("../../../auth.json", {assert: {type: "json"}});
        const totalDefined = await client.database.getGlobalSetting("definedcount");

        await message.channel.send({
            embeds: [{
                title: "`Define` Statistics",
                fields: [
                    {
                        name: "Total Definitions Given",
                        value: `${totalDefined ? totalDefined.value : "0"}`,
                    },
                    {
                        name: "Unique Words Defined",
                        value: config.wordsDefined.length,
                    },
                ],
            }],
        });
    }
}
