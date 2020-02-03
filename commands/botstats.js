const config = require("../auth.json")

module.exports = {
    name: 'botstats',
    aliases: ['bs'],
    description: 'An assortment of GreenMesa stats.',
    ownerOnly: true,
    async execute(client, message, args, conn) {
        // const statRows = await conn.query(`SELECT * FROM gmstatsBETA ORDER BY updateId DESC LIMIT 20`);
        conn.query(`SELECT * FROM gmstats ORDER BY updateId DESC LIMIT 24`, (err, rows) => {
            let diffs = [];
            for (let i = 0; i < rows.length; i++) {
                if (i != rows.length - 1) {
                    diffs.push(rows[i].numUsers - rows[i + 1].numUsers);
                    // console.log(`${rows[i].numUsers} - ${rows[i + 1].numUsers}`);
                }
            }
            let totalUserChange = 0;
            diffs.forEach(e => {
                totalUserChange += e;
            });
            avgUserChange = Math.floor(totalUserChange / diffs.length);
            let chngPrefix = '+';
            if (avgUserChange <= 0) {
                chngPrefix = '';
            }
            message.channel.send({
                embed: {
                    title: "GreenMesa Stats",
                    // "description": "Current statistics for this bot."
                    fields: [
                        {
                            name: 'Total Servers',
                            value: rows[0].numGuilds,
                            inline: true
                        },
                        {
                            name: 'Total Channels',
                            value: rows[0].numChannels,
                            inline: true
                        },
                        {
                            name: 'Total Users',
                            value: rows[0].numUsers,
                            inline: true
                        },
                        {
                            name: "Avg. user change over last 24 hr",
                            value: chngPrefix+avgUserChange
                        },
                        {
                            name: "Words Defined",
                            value: config.wordsDefined.length
                        }
                    ],
                    footer: {
                        text: "Working on graphing"
                    }
                }
            })
        });
        // if (queryStatus == "NO ROWS") {
        //     return message.channel.send("The stats database must populate more before the stats command can be used, sorry.");
        // }
    }
}
