const xlg = require("../xlogger");
const { permLevels } = require('../permissions');
const { getGlobalSetting, getGuildSetting, editGuildSetting } = require("../dbmanager");
const moment = require("moment");
const fetch = require("node-fetch");
const lbdat = [
    {
        data: [],
        lastFetched: null
    }
];

module.exports = {
    name: "adventofcode",
    aliases: ["aoc"],
    description: {
        short: "get your AoC leaderboard",
        long: "Use to first setup and then view your Advent of Code leaderboard. You will have to provide your private leaderboard number (e.g. `[number]-fsy8676sf`) as well as your session token. Because AoC doesn't provide a convenient API, you will have to access your cookies (you can search for how to do that in your browser) and copy the value of the cookie named `session`. YOU MUST be on the leaderboard you wish to set the command to already, the only way to access the leaderboard is by providing your credentials after adding the leaderboard on the website."
    },
    category: "fun",
    usage: "[reset]",
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
            const resetting = args.join(" ").toLowerCase() === "reset";
            
            if (!lb[0] || !session[0] || !year[0] || resetting) {
                
                if (!session[0] || [0].value || resetting) {
                    await message.channel.send({
                        embed: {
                            color: iec,
                            title: "AoC Setup | 1️⃣",
                            description: "**Enter your `session` cookie token.** Using your preferred browser, go to the [AoC website](https://adventofcode.com) and make sure you are logged in, then access your cookies for the site ([Firefox](https://support.mozilla.org/en-US/questions/1219653), [Chrome + Others](https://kb.iu.edu/d/ajfi#CHROME)). The cookie you are looking for is called `session`, it may look like `session=[token]`."
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
            } else {
                session = session[0].value;
                lb = lb[0].value;
                year = year[0].value;
            }

            //const now = new Date();
            if (!lbdat.lastFetched || moment().diff(lbdat.lastFetched) > 1000 * 60 * 15) {
                try {
                    let res = await fetch(`https://adventofcode.com/${year}/leaderboard/private/view/${lb}.json`, {
                        headers: {
                            cookie: `session=${session}`
                        }
                    });
                    if (res.url === `https://adventofcode.com/${year}/leaderboard/private`) {
                        client.specials.sendError(message.channel, "Could not access the leaderboard, the session variable may be bad.");
                        return false;
                    }
                    if (res.status !== 200) {
                        client.specials.sendError(message.channel, "The service is unavailable.");
                        return false;
                    }
                    res = await res.json();
                    lbdat.data = Object.keys(res.members).map((mid) => {
                        const mdat = res.members[mid];
                        if (mdat && mdat.id) {
                            if (mdat.name) {
                                mdat.name = mdat.name.replace("_", "˾");
                            }
                            return mdat;
                        }
                    });
                    lbdat.lastFetched = new Date();
                } catch (error) {
                    xlg.error(error);
                    client.specials.sendError(message.channel, "Could not retrieve leaderboard information. Wrong details may have been entered.");
                    return false;
                }
            }

            lbdat.data.sort((a, b) => (a.local_score > b.local_score) ? -1 : 1)
            let mapDat = lbdat.data.map((x, i) => ` .${i + 1} | ${x.local_score}/${x.global_score}⭐ | ${x.name || x.id}`).slice(0, 9);
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
            mapDat.unshift(" Ra | Score");

            let embed = {
                color: iec,
                description: `\`\`\`md\n${mapDat.join("\n")}\\n\`\`\``
            };
            message.channel.send({ embed });

        } catch (error) {
            xlg.error(error);
            await client.specials.sendError(message.channel);
            return false;
        }
    }
}