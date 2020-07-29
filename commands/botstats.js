const config = require("../auth.json");
// const d3 = require("d3");
// const jsdom = require("jsdom");
// const { JSDOM } = jsdom;
const fs = require('fs');
const plotly = require('plotly')(config.plotly.username, config.plotly.key)
const Discord = require("discord.js");

function generatePlot(rrows) {
    return new Promise((resolve, reject) => {
        var data = {
            type: 'line',
            x: [],
            y: []
        };
        rrows.forEach((r) => {
            data.x.push(r.logDate);
            data.y.push(r.numUsers);
        });
        var pngOpts = {
            format: 'png',
            height: 370,
            width: 520,
        };
        var layout = {
            plot_bgcolor: 'rgb(52, 54, 60)',
            paper_bgcolor: 'rgb(52, 54, 60)',
        };
        var chart = { 'data': [data], 'layout': layout }
        plotly.getImage(chart, pngOpts, (err, imageData) => {
            if (err) return console.log(err);
            var fileStream = fs.createWriteStream('./media/usernumber-graph.png');
            imageData.pipe(fileStream);
            fileStream.on('error', reject);
            fileStream.on('finish', resolve);
        });
    });
}

module.exports = {
    name: 'botstats',
    aliases: ['bs'],
    description: 'Some statistics for this bot.',
    async execute(client, message, args, conn) {
        conn.query(`SELECT * FROM gmstats ORDER BY updateId DESC LIMIT 24`, async (err, rows) => {
            await generatePlot(rows);
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
            const fileToAttach = new Discord.MessageAttachment('./media/usernumber-graph.png');
            message.channel.send({
                files: [fileToAttach],
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
                            name: "Avg. user change (24hr)",
                            value: chngPrefix + avgUserChange + "/hr"
                        },
                        {
                            name: "Unique Words Defined",
                            value: config.wordsDefined.length,
                            inline: true
                        },
                        {
                            name: "Total Commands Completed",
                            value: config.commandsExecutedCount,
                            inline: true
                        }
                    ],
                    image: {
                        url: "attachment://usernumber-graph.png"
                    },
                    footer: {
                        text: "Graphing in development"
                    }
                },
            }).catch(console.error)
            
        });//first query
    }
}
