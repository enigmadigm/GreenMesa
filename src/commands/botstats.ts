import config from "../../auth.json";
import fs from 'fs';
import Discord, { MessageEmbed } from "discord.js";
import { BSRow, Command } from "src/gm";
import p from 'plotly';
// const d3 = require("d3");
// const jsdom = require("jsdom");
// const { JSDOM } = jsdom;
const plotly = p(config.plotly.username, config.plotly.key)

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

export const command: Command = {
    name: 'botstats',
    aliases: ['bs'],
    description: {
        short: 'statistics for this bot',
        long: 'Some statistics for this bot.'
    },
    usage: "[limiter]",
    permissions: ["ATTACH_FILES"],
    async execute(client, message, args) {
        try {
            if (args.length && !(await client.specials.argsMustBeNum(message.channel, [args[0]]))) return;
            // const a = args.join(" ");
            const nForLimited = parseInt(args[0], 10)
            const limiter =  nForLimited > 3 && nForLimited < 1001 ? nForLimited : 24;
            const rows = await client.database.getGMStats(limiter);
            if (!rows.length) {
                await client.specials.sendError(message.channel, "Could not get statistical data from database");
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
            for (let i = 0; i < rows.length - 1; i++) {
                diffs.push(rows[i].numUsers - rows[i + 1].numUsers);
            }
            let totalUserChange = 0;
            diffs.forEach(e => {
                totalUserChange += e;
            });
            const avgUserChange = Math.floor(totalUserChange / diffs.length);
            let chngPrefix = '+';
            if (avgUserChange < 0) {
                chngPrefix = '';
            }
            const fileToAttach = new Discord.MessageAttachment('./media/usernumber-graph.png');

            const definedTotal = config.wordsDefined.length;

            const executionTotal = ((await client.database.getTotalCmdUsage()) || [{ used: 0 }])[0].used;

            const embed: MessageEmbed = new MessageEmbed({
                description: `**Caching:** Due to caching, data may show drops in counts`,
                title: `${client.user?.username} Stats`,
                fields: [
                    {
                        name: 'Servers',
                        value: `\`${rows[0].numGuilds}\``,
                        inline: true
                    },
                    {
                        name: 'Channels',
                        value: `\`${rows[0].numChannels}\``,
                        inline: true
                    },
                    {
                        name: 'Users',
                        value: `\`${rows[0].numUsers}\``,
                        inline: true
                    },
                    {
                        name: `User Movement (${rows.length || 24}hr)`,
                        value: `\`${chngPrefix}${avgUserChange}\`/hr`,
                        inline: true
                    },
                    {
                        name: "Defined Words",
                        value: `\`${definedTotal}\``,
                        inline: true
                    },
                    {
                        name: "Commands Executed",
                        value: `\`${executionTotal}\``,
                        inline: true
                    }
                ],
                image: {
                    url: "attachment://usernumber-graph.png"
                }
            })

            await message.channel.send({
                files: [fileToAttach],
                embed,
            });
        } catch (error) {
            xlg.error(error);
            await client.specials.sendError(message.channel);
            return false;
        }
    }
}
