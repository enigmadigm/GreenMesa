const xlg = require("../xlogger");
const { permLevels } = require('../permissions');
const { getGlobalSetting, getGuildSetting, editGuildSetting } = require("../dbmanager");
const moment = require("moment");
const fetch = require("node-fetch");
const lbdat = [
    {
        guildID: "",
        data: [],
        lastFetched: null
    }
];

module.exports = {
    name: "adventofcode",
    aliases: ["aoc"],
    description: {
        short: "get your AoC leaderboard",
        long: "Use to first setup and then view your Advent of Code leaderboard.\nYou will have to provide your private leaderboard number (the number at the end of the LB's URL) as well as your session token. Because AoC doesn't allow automatic auth, you will have to access your cookies ([Chrome + Others](https://kb.iu.edu/d/ajfi#CHROME)) and copy the value of the cookie named `session`. YOU MUST already be on the leaderboard you wish to assign this command, the only way to access the leaderboard is by providing your credentials after joining the leaderboard on the website.\nThe credentials can be reset with the `reset` subcommand. The leaderboard alone can be reconfigured with the `reselect` subcommand."
    },
    category: "fun",
    usage: "[reset | reselect]",
    args: false,
    specialArgs: undefined,
    permLevel: permLevels.member,
    guildOnly: true,
    ownerOnly: false,
    async execute(client, message, args) {
        try {
            let session = await getGuildSetting(message.guild, "aoc_session");
            let lb = await getGuildSetting(message.guild, "aoc_leaderboard");
            let year = await getGuildSetting(message.guild, "aoc_year")
            const iec = parseInt((await getGlobalSetting("info_embed_color"))[0].value, 10);
            let resetting = false;
            if (args.join(" ").toLowerCase() === "reset" || args.join(" ").toLowerCase() === "reselect") {
                resetting = args.join(" ");
            }
            let refetching = false;
            let guildlbdat = lbdat.find(d => d.guildID === message.guild.id);
            if (!guildlbdat) {
                lbdat.push({ guildID: message.guild.id });
                guildlbdat = lbdat.find(d => d.guildID === message.guild.id);
            }

            if (!lb[0] || !session[0] || !year[0] || resetting) {
                
                if (!session[0] || !session[0].value || resetting === "reset") {
                    await message.channel.send({
                        embed: {
                            color: iec,
                            title: "AoC Setup | 1️⃣",
                            description: "**Enter your `session` cookie token.**\nUsing your preferred browser, go to the [AoC website](https://adventofcode.com) and make sure you are logged in, then access your cookies for the site ([Firefox](https://support.mozilla.org/en-US/questions/1219653), [Chrome + Others](https://kb.iu.edu/d/ajfi#CHROME)). The cookie you are looking for is called `session`, it may look like `session=[token]`."
                        }
                    });
                    const sessionCollected = await message.channel.awaitMessages((response) => response.author.id === message.author.id && response.content.length < 100, { time: 60000, max: 1 });
                    if (!sessionCollected || !sessionCollected.first()) {
                        client.specials.sendError(message.channel, "No session token provided. Setup cancelled.");
                        return false;
                    } else {
                        session = sessionCollected.first().content;
                    }
                    await editGuildSetting(message.guild, "aoc_session", session);
                } else {
                    await message.channel.send({
                        embed: {
                            color: iec,
                            title: "AoC Setup | 1️⃣",
                            description: "Session already set, skipping step."
                        }
                    });
                    session = session[0].value;
                }

                await message.channel.send({
                    embed: {
                        color: iec,
                        title: "AoC Setup | 2️⃣",
                        description: "Enter the desired event year."
                    }
                });
                const yearCollected = await message.channel.awaitMessages((response) => response.author.id === message.author.id && response.content.length < 100, { time: 20000, max: 1 });
                if (!yearCollected || !yearCollected.first() || !parseInt(yearCollected.first().content, 10)) {
                    client.specials.sendError(message.channel, "No valid year provided. The setup has been cancelled.");
                    return false;
                } else {
                    year = yearCollected.first().content;
                    await editGuildSetting(message.guild, "aoc_year", year);
                }

                await message.channel.send({
                    embed: {
                        color: iec,
                        title: "AoC Setup | 3️⃣",
                        description: "Enter your **Private Leaderboard** number. This is the part before the dash in the leaderboard code. The number can also be found at the end of URLs for the leaderboard."
                    }
                });
                const numCollected = await message.channel.awaitMessages((response) => response.author.id === message.author.id && response.content.length < 1800, { time: 40000, max: 1 });
                if (!numCollected || !numCollected.first()) {
                    client.specials.sendError(message.channel, "A response message was not received within the time limit, the setup wizard has been cancelled.");
                    return false;
                } else {
                    if (numCollected.first().content.toLowerCase() !== "no") {
                        lb = numCollected.first().content;
                        await editGuildSetting(message.guild, "aoc_leaderboard", lb);
                    }
                }
                refetching = true;
            } else {
                session = session[0].value;
                lb = lb[0].value;
                year = year[0].value;
            }
            // xlg.log(session)// logging session to see how it is maintained after going through the setup and skipping that step

            //const now = new Date();
            const url = `https://adventofcode.com/${year}/leaderboard/private/view/${lb}.json`;
            if (!guildlbdat || !guildlbdat.lastFetched || moment().diff(guildlbdat.lastFetched) > 1000 * 60 * 5 || refetching) {
                try {
                    let res = await fetch(url, {
                        headers: {
                            cookie: `session=${session}`
                        }
                    });
                    if (res.url === `https://adventofcode.com/${year}/leaderboard/private`) {
                        client.specials.sendError(message.channel, "Could not access the leaderboard, the session variable may be expired.\nSend `aoc reset` to set the session again, or send `aoc reselect` to set the lb options again.");
                        //await editGuildSetting(message.guild, "aoc_session", "", true);
                        return false;
                    }
                    if (res.status >= 500 && res.status < 600) {
                        client.specials.sendError(message.channel, "Received a bad response from [AOC](https://adventofcode.com). It is likely that the session cookie is invalid.\nResend the command to set it again.");
                        await editGuildSetting(message.guild, "aoc_session", "", true);
                        return false;
                    }
                    if (res.status === 404) {
                        client.specials.sendError(message.channel, `[Your leaderboard](${url}) could not be found.\nResend the command to set it again.`);
                        await editGuildSetting(message.guild, "aoc_leaderboard", "", true);
                        await editGuildSetting(message.guild, "aoc_year", "", true);
                        return false;
                    }
                    res = await res.json();
                    guildlbdat.data = Object.keys(res.members).map((mid) => {
                        const mdat = res.members[mid];
                        if (mdat && mdat.id) {
                            if (mdat.name) {
                                mdat.name = mdat.name.replace("_", "˾");
                            }
                            return mdat;
                        }
                    });
                    guildlbdat.lastFetched = new Date();
                } catch (error) {
                    xlg.error(error);
                    client.specials.sendError(message.channel, "Could not retrieve leaderboard information. Wrong details may have been entered.");
                    return false;
                }
            }

            //let hasTopScorer = false;
            guildlbdat.data.sort((a, b) => (a.local_score > b.local_score) ? -1 : 1)
            let longestScore = 0
            for (let i = 0; i < guildlbdat.data.length; i++) {
                const x = guildlbdat.data[i];
                const scr = ` ${x.local_score}${x.global_score ? "+" : ""}${x.global_score ? x.global_score : ""} `;
                if (scr.length > longestScore) longestScore = scr.length;
            }
            let scoreSpaces = "";
            for (let s = 0; s < longestScore; s++) {
                scoreSpaces += " ";
            }
            let longestStar = 0
            for (let i = 0; i < guildlbdat.data.length; i++) {
                const x = guildlbdat.data[i];
                const scr = ` ${x.stars || "0"} `;
                if (scr.length > longestStar) longestStar = scr.length;
            }
            let starSpaces = "";
            for (let s = 0; s < longestStar; s++) {
                starSpaces += " ";
            }
            let mapDat = guildlbdat.data.map((x, i) => {
                //if (x.global_score) hasTopScorer = true;
                const len1 = starSpaces.length - ` ${x.stars || "0"} `.length;
                const spaces1 = starSpaces.slice(0, len1 < 0 ? 0 : len1);
                const len2 = scoreSpaces.length - ` ${x.local_score}${x.global_score ? "+" : ""}${x.global_score ? x.global_score : ""} `.length;
                const spaces2 = scoreSpaces.slice(0, len2 < 0 ? 0 : len2);
                return `${i + 1 < 10 ? " " : ""}${i + 1}. │ ${x.stars || "0"}${spaces1} │ ${x.local_score || "0"}${x.global_score ? "+" : ""}${x.global_score ? x.global_score : ""}${spaces2} │ ${x.name || x.id}`
            }).slice(0, 20);
            let longest = 0;
            for (let i = 0; i < mapDat.length; i++) {
                const dat = mapDat[i];
                if (dat.length > longest) longest = dat.length;
            }
            let headerBar = "";
            for (let i = 0; i < longest + 1; i++) {
                headerBar += "=";
            }
            mapDat.unshift(headerBar);
            //mapDat.unshift(` Ra | ⭐ | Score${hasTopScorer ? "[+Top 100]" : ""}`);
            mapDat.unshift(` Ra │ ⭐ │ Score`);

            let embed = {
                color: iec,
                description: `[Advent of Code Leaderboard](${url})\n\`\`\`md\n${mapDat.join("\n")}\n\`\`\``
            };
            message.channel.send({ embed });

        } catch (error) {
            xlg.error(error);
            await client.specials.sendError(message.channel);
            return false;
        }
    }
}