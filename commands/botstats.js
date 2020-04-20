const config = require("../auth.json");
// const d3 = require("d3");
// const jsdom = require("jsdom");
// const { JSDOM } = jsdom;
const fs = require('fs');
const plotly = require('plotly')(config.plotly.username, config.plotly.key)

module.exports = {
    name: 'botstats',
    aliases: ['bs'],
    description: 'An assortment of GreenMesa stats. **In development**',
    async execute(client, message, args, conn) {
        var data = [{
            type: 'line',
            x: [],
            y: []
        }];
        conn.query(`SELECT * FROM gmstats ORDER BY updateId DESC LIMIT 24`, async (err, rows) => {
            rows.forEach((r) => {
                data[0].x.push(r.logDate);
                data[0].y.push(r.numUsers);
            });
            var layout = {
                format: 'png',
                height: 370,
                width: 520,
            };
            try {
                await plotly.getImage({ 'data': data }, layout, (err, imageData) => {
                    if (err) return console.log(err);
                    var fileStream = fs.createWriteStream('./media/usernumber-graph.png');
                    imageData.pipe(fileStream);
                });
            } catch (error) {
                console.log(error);
                message.channel.send('There was an error in the graphing process');
            }
            let diffs = [];
            for (let i = 0; i < rows.length; i++) {
                if (i != rows.length - 1) {
                    diffs.push(rows[i].numUsers - rows[i + 1].numUsers);
                }
            }
            let totalUserChange = 0;
            diffs.forEach(e => {
                totalUserChange += e;
            });
            let avgUserChange = Math.floor(totalUserChange / diffs.length);
            let chngPrefix = '+';
            if (avgUserChange <= 0) {
                chngPrefix = '';
            }
            message.channel.send({
                embed: {
                    title: "GreenMesa Stats",
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
                            value: chngPrefix + avgUserChange + "/hr"
                        },
                        {
                            name: "Unique Words Defined",
                            value: config.wordsDefined.length,
                            inline: true
                        },
                        {
                            name: "Total Commands Executed (- trivia quickstart)",
                            value: config.commandsExecutedCount,
                            inline: true
                        }
                    ],
                    footer: {
                        text: "Graphing in development"
                    }
                },
            })
                .then(message.channel.send({ files: ["./media/usernumber-graph.png"] }))
                .catch(console.error)
            
        });//first query
    }
}
