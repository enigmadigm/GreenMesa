import config from "../../auth.json";
// const d3 = require("d3");
// const jsdom = require("jsdom");
// const { JSDOM } = jsdom;
import fs from 'fs';
import p from 'plotly';
const plotly = p(config.plotly.username, config.plotly.key)
import Discord from "discord.js";
import { BSRow, Command } from "src/gm";
import xlg from "src/xlogger";
//import { getGMStats, getTotalCmdUsage } from "../dbmanager";

interface BotStatsLineData {
    type: string;
    x: Date[];
    y: number[];
}

function generatePlot(rrows: BSRow[]) {
    return new Promise((resolve, reject) => {
        const data: BotStatsLineData = {
            type: 'line',
            x: [],
            y: []
        };
        rrows.forEach((r) => {
            data.x.push(r.logDate);
            data.y.push(r.numUsers);
        });
        const pngOpts = {
            format: 'png',
            height: 370,
            width: 520,
        };
        const layout = {
            plot_bgcolor: 'rgb(47,49,54)',
            paper_bgcolor: 'rgb(47,49,54)',
            title: 'Users',
            font: {
                color: '#FFFFFF'
            },
        };
        const chart = { 'data': [data], 'layout': layout }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        plotly.getImage(chart, pngOpts, (err: any, imageData: { pipe: (arg0: fs.WriteStream) => void; }) => {
            if (err) return console.log(err);
            const fileStream = fs.createWriteStream('./media/usernumber-graph.png');
            imageData.pipe(fileStream);
            fileStream.on('error', reject);
            fileStream.on('finish', resolve);
        });
    });
}

const command: Command = {
    name: 'botstats',
    aliases: ['bs'],
    description: {
        short: 'statistics for this bot',
        long: 'Some statistics for this bot.'
    },
    usage: "[limiter]",
    async execute(client, message, args) {
        try {
            let limiter: number | undefined = undefined;
            const a = args.join("");
            if (args.length && !isNaN(parseInt(a, 10)) && parseInt(a, 10) > 3 && parseInt(a, 10) < 1000) {
                limiter = parseInt(a, 10);
            }
            const rows = await client.database?.getGMStats(limiter);
            if (!rows) {
                client.specials?.sendError(message.channel, "Could not get statistical data from database");
                return;
            }
            if (!rows.length) {
                rows.push({
                    updateId: 0,
                    logDate: new Date(),
                    numUsers: 0,
                    numGuilds: 0,
                    numChannels: 5
                });
            }
            await generatePlot(rows);
            const diffs = [];
            for (let i = 0; i < rows.length; i++) {
                if (i != rows.length - 1) {
                    diffs.push(rows[i].numUsers - rows[i + 1].numUsers);
                }
            }
            let totalUserChange = 0;
            diffs.forEach(e => {
                totalUserChange += e;
            });
            const avgUserChange = Math.floor(totalUserChange / diffs.length);
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
                            name: "Caching",
                            value: "Due to caching, data may show drops in counts",
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
                            value: chngPrefix + avgUserChange + "/hr",
                            inline: true
                        },
                        {
                            name: "Unique Words Defined",
                            value: config.wordsDefined.length,
                            inline: true
                        },
                        {
                            name: "Total Commands Completed",
                            value: ((await client.database?.getTotalCmdUsage()) || [{ used: 0 }])[0].used,
                            inline: true
                        }
                    ],
                    image: {
                        url: "attachment://usernumber-graph.png"
                    }
                },
            });
        } catch (error) {
            xlg.error(error);
            await client.specials?.sendError(message.channel);
            return false;
        }
    }
}

export default command;