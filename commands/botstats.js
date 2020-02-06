const config = require("../auth.json");
// const d3 = require("d3");
// const jsdom = require("jsdom");
// const { JSDOM } = jsdom;
const fs = require('fs');
const plotly = require('plotly')("GalaxySH", "JcEDtj2qJRq4vrU7dUvH")
// const { saveSvgAsPng } = require("save-svg-as-png");
// const sharp = require('sharp');

// const document = jsdom.jsdom(), svg = d3.select(document.body).append("svg");
// const document = new JSDOM(), svg = d3.select(document.body).append("svg");

const Discord = require('discord.js');

module.exports = {
    name: 'botstats',
    aliases: ['bs'],
    description: 'An assortment of GreenMesa stats.',
    ownerOnly: true,
    async execute(client, message, args, conn) {
        // const statRows = await conn.query(`SELECT * FROM gmstatsBETA ORDER BY updateId DESC LIMIT 20`);
        conn.query(`SELECT * FROM gmstats ORDER BY updateId DESC LIMIT 24`, (err, rows) => {
            data = [{ x: [], y: [], type: 'line' }];
            conn.query(`SELECT * FROM gmstats ORDER BY updateId DESC LIMIT 24`, async (err, rows) => {
                var layout = { format: 'png' };
                rows.forEach((r, i) => {
                    data[0].x.push(r.logDate);
                    data[0].y.push(r.numUsers);
                });
                await plotly.getImage({ 'data': data }, layout, (err, imageData) => {
                    if (err) return console.log(err);
                    var fileStream = fs.createWriteStream('./media/usernumber-graph.png');
                    imageData.pipe(fileStream);
                });

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
                                value: chngPrefix + avgUserChange
                            },
                            {
                                name: "Words Defined",
                                value: config.wordsDefined.length
                            }
                        ],
                        footer: {
                            text: "Working on graphing"
                        }
                    },
                    // files: ['./media/usernumber-graph.png']
                })
                    .then(message.channel.send({ files: ["./media/usernumber-graph.png"] }))
                    .catch(console.error)
                
            });//second query
        });//first query
    }
}
