const config = require("../auth.json");
// const d3 = require("d3");
// const jsdom = require("jsdom");
// const { JSDOM } = jsdom;
const fs = require('fs');
const plotly = require('plotly')(config.plotly.username, config.plotly.key)
// const Plotly = require('plotly.js-basic-dist');
// const { saveSvgAsPng } = require("save-svg-as-png");
// const sharp = require('sharp');

// const document = jsdom.jsdom(), svg = d3.select(document.body).append("svg");
// const document = new JSDOM(), svg = d3.select(document.body).append("svg");

const Discord = require('discord.js');

module.exports = {
    name: 'botstats',
    aliases: ['bs'],
    description: 'An assortment of GreenMesa stats. **In development**',
    async execute(client, message, args, conn) {
        // const statRows = await conn.query(`SELECT * FROM gmstatsBETA ORDER BY updateId DESC LIMIT 20`);
        data = [{
            type: 'line',
            x: [],
            y: []
        }];
        conn.query(`SELECT * FROM gmstats ORDER BY updateId DESC LIMIT 24`, async (err, rows) => {
            rows.forEach((r, i) => {
                data[0].x.push(r.logDate);
                data[0].y.push(r.numUsers);
            });
            var layout = {
                format: 'png',
                height: 370,
                width: 520,
                // paper_bgcolor: "rgba(0,0,0,0)",
                // plot_bgcolor: "rgba(0,0,0,0)"
                // paper_bgcolor: "#001f3f",
                // plot_bgcolor: "#001f3f"
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

            /*==+==+==+==+==+==*+*==*+*==+==+==+==+==*+*==*+*==+==+==+==+==*+*==*+*==+==+==+==+==+==*/

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
                // files: ['./media/usernumber-graph.png']
            })
                .then(message.channel.send({ files: ["./media/usernumber-graph.png"] }))
                .catch(console.error)
            
        });//first query
    }
}
