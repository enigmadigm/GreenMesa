import Discord, { CollectorFilter, GuildMember, Message, User } from "discord.js";
import fetch from 'node-fetch';
import { Command, TriviaResponse } from "src/gm";

interface TriviaScoreboard {
    user: GuildMember;
    score: number;
}

interface TriviaCategory {
    id: number;
    name: string;
}

const deftime = 15;
export const games: TGame[] = [];
class TGame {
	public cid: string;
	public msg: string;
    public manager: string;
	public round: number;
	public scores: TriviaScoreboard[];

    constructor(channelid: string, message: Message, initround = 1) {
        this.cid = channelid;
        this.msg = message.id;
        this.manager = message.author.id;
        this.round = initround;
        this.scores = [];
    }

    displayScores(message: Message, ignoreround = false) {
        try {
            const round = this.round - 1;
            if (((round) % 5) === 0 || ignoreround) {
                // Need to review this one for understanding \\\ Supposed to sort scores in descending order \\\ makes sense now
                this.scores.sort((a, b) => b.score - a.score);
                const newScoreList = this.scores.map((ela) => `${ela.score} ⁞ ${ela.user.displayName}`)
                if (!newScoreList.length) newScoreList[0] = 'nobody scored';
                message.channel.send({
                    embed: {
                        color: 0xffa500,
                        description: `\`\`\`\nRound ${round}\n${newScoreList.join("\n")}\n\`\`\``,
                        footer: {
                            text: `ID: ${this.msg}`,
                        },
                    }
                });
            }
        } catch (error) {
            xlg.error(error);
        }
    }

    setRound(r: number): void {
        this.round = r;
    }

    killGame(): void {
        this.cid = "~";
    }

    increaseScore(scorer: GuildMember): void {
        const scorecard = this.scores.find(x => x.user.id === scorer.id);
        if (scorecard) {
            scorecard.score += 1;
        } else {
            this.scores.push({ user: scorer, score: 1 })
        }
    }
}

const categories: TriviaCategory[] = [];

/*async function aResponded(message) {
    const alreadyRespondedCallout = await message.channel.send('You already responded!');
    setTimeout(function () {
        alreadyRespondedCallout.delete().catch(O_o => {O_o});
    }, 2500);
}*/

/*function displayScores(message, round = 0, scores = [], ignoreround = false) {
    round--;
    if (((round) % 5) === 0 || ignoreround) {
        // Need to review this one for understanding \\\ Supposed to sort scores in descending order \\\ makes sense now
        scores.sort((a, b) => b.score - a.score);
        let newScoreList = scores.map((ela) => `${ela.score} ⁞ ${ela.user.displayName}`)
        if (!newScoreList.length) newScoreList[0] = 'nobody scored';
        message.channel.send({
            embed: {
                color: 0xffa500,
                description: `\`\`\`\nRound ${round}\n${newScoreList.join("\n")}\n\`\`\``
            }
        }).catch(xlg.error)
    }
}*/

export const command: Command = {
    name: 'trivia',
    description: {
        short: 'starts a trivia game to play solo or with friends',
        long: 'Starts a trivia game that can be played alone or with any number of people. Let it ask you grueling questions and embarass you in front of your friends because you won\'t know the answer while it keeps track of the score for you!\n\nYou can start the game with a specified category and/or difficulty, if you wish. View all categories and their ids by adding "cats" to this command. The available difficulties are easy, medium, and hard.\n\nThis command has been well used, more features to come!'
    },
    usage: "[cats]",
    examples: [
        "cats",
        "c:9",
        "d:easy",
        "c:9 d:easy",
    ],
    aliases:['tr'],
    cooldown: 3,
    async execute(client, message, args, flags) {
        try {
            const a = args.join(" ");
            if (a === "cats") {
                const r = await fetch(`https://opentdb.com/api_category.php`);
                if (!r.ok) {
                    client.specials.sendError(message.channel, `Categories cannot be retrieved at the moment.`, true);
                    return;
                }
                const j: { trivia_categories: TriviaCategory[] } = await r.json();
                await message.channel.send({
                    embed: {
                        color: await client.database.getColor("info"),
                        title: `Trivia Categories (${j.trivia_categories.length})`,
                        description: `To use a category, use the option format: \`c:n\`. \`n\` is the category number.\n\n${j.trivia_categories.map((c) => `\`${c.id}\` - ${c.name}`).join("\n")}`,
                        footer: {
                            text: `Trivia`,
                        },
                    }
                });
                for (const cat of j.trivia_categories) {
                    if (typeof cat.id === "number" && typeof cat.name === "string" && !categories.find(x => x.id === cat.id)) {
                        categories.push(cat);
                    }
                }
                return;
            }
            const triviaCommand = client.commands.get(this.name);
            if (!triviaCommand) {
                client.specials.sendError(message.channel, "Apparently this command no longer exists in the bot, sorry.");
                return;
            }
            if (!process.env.TRIVIA_SESSION) {
                process.env.TRIVIA_SESSION = "~";
                const r = await fetch(`https://opentdb.com/api_token.php?command=request`);
                const j = await r.json();
                if (j.response_code === 0 && j.token && typeof j.token === "string") {
                    process.env.TRIVIA_SESSION = j.token;
                }
            }

            /* Option parsing */
            let category: number | null = null;
            let difficulty = "easy";
            if (args.length) {
                if (!categories.length) {
                    const r = await fetch(`https://opentdb.com/api_category.php`);
                    if (!r.ok) {
                        client.specials.sendError(message.channel, `Categories cannot be retrieved at the moment.`, true);
                        return;
                    }
                    const j: { trivia_categories: TriviaCategory[] } = await r.json();
                    for (const cat of j.trivia_categories) {
                        if (typeof cat.id === "number" && typeof cat.name === "string" && !categories.find(x => x.id === cat.id)) {
                            categories.push(cat);
                        }
                    }
                }
                for (const arg of args.map(x => x.toLowerCase())) {
                    const e = /c:([0-9]{1,3})/g.exec(arg);
                    if (e && e[1].length) {
                        const cid = parseInt(e[1], 10);
                        if (!isNaN(cid) && categories.find(x => x.id === cid)) {
                            category = cid;
                        } else {
                            client.specials.sendError(message.channel, `\`${cid}\` is not an available category. See all categories with \`${message.gprefix} ${this.name} cats\``);
                            break;
                        }
                        continue;
                    }
                    const d = /d:([a-z]{1,10})/g.exec(arg);
                    if (d && d[1].length) {
                        if (!["easy", "medium", "hard"].includes(d[1])) {
                            client.specials.sendError(message.channel, `\`${d[1]}\` is not one of easy, medium, or hard.`);
                            break;
                        }
                        difficulty = d[1];
                        continue;
                    }
                }
            }

            const r = await fetch(`https://opentdb.com/api.php?amount=1&difficulty=${difficulty}${category ? `&category=${category}` : ""}&type=multiple&encode=url3986&token=${process.env.TRIVIA_SESSION}`);
            const j = <TriviaResponse>await r.json();
            if (j.response_code !== 0) {
                if (j.response_code === 3 || j.response_code === 4) {
                    process.env.TRIVIA_SESSION = undefined;
                    triviaCommand.execute(client, message, args, flags);
                    return;
                }
                if (j.response_code === 1) {
                    client.specials.sendError(message.channel, `No results available. Try another category.`);
                } else {
                    client.specials.sendError(message.channel, 'There\'s been an error, we will address this issue as soon as possible. Until we do, you will continue to receive this message upon execution.');
                }
                return;
            }
            //Setting up for message
            const correctIndex = Math.floor(Math.random() * j.results[0].incorrect_answers.length);

            const triviaQuestion = decodeURIComponent(j.results[0].question);
            const triviaCategory = decodeURIComponent(j.results[0].category);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            let triviaChoices: string[] = j.results[0].incorrect_answers;
            const triviaChoiceLetters = ['🇦', '🇧', '🇨', '🇩'];
            const triviaChoiceASCII = ['a', 'b', 'c', 'd'];
            // let triviaTFChoice = ['✅', '❌'];

            const game = games.find(g => g.cid === message.channel.id) || new TGame(message.channel.id, message);
            if (!games.find(g => g.cid === message.channel.id)) {
                games.push(game);
            } else {
                if (game.msg !== message.id) {
                    return client.specials.sendError(message.channel, "A game is already in progress");
                }
            }

            // *went with alternative
            triviaChoices.splice(correctIndex, 0, `${j.results[0].correct_answer}`);
            triviaChoices = triviaChoices.map((e, i) => `${triviaChoiceLetters[i]} : ${decodeURIComponent(e)}`);

            // Send the message that users will respond to
            const filter: CollectorFilter = (response) => {
                return triviaChoiceASCII.includes(response.content.toLowerCase());
            }
            if (Math.floor(Math.random() * 100) >= 92 && game.round == 1) {
                await message.channel.send('*This command is currently under development, any feedback is appreciated. Features like Questions by Category, Continuous Game, and Difficulty Options can be expected in the future.* (last updated January 2020)');
            }
            const triviaMessage = await message.channel.send({
                embed: {
                    color: 0x36393F,
                    title: triviaQuestion,
                    description: triviaChoices.join('\n'),
                    footer: {
                        text: `Trivia | ${triviaCategory} | Round ${game.round}`,
                    },
                }
            });
            let allowedTime = deftime;
            const countDownMessage = await message.channel.send(`Enter the ***letter*** for the correct answer in \` < ${allowedTime} \` seconds`);
            const i1 = setInterval(() => {
                if (allowedTime <= 0) return clearInterval(i1);
                allowedTime -= 5;
                countDownMessage.edit(`Enter the ***letter*** for the correct answer in \` < ${allowedTime} \` seconds`).catch(xlg.error);
            }, 5000);
            const collector = message.channel.createMessageCollector(filter, {
                time: allowedTime * 1000
            });

            const usersResponded: User[] = [];
            collector.on('collect', m => {
                if (usersResponded.includes(m.author)) {
                    //return aResponded(message); // stopping for ratelimit and load reasons for now
                    return;
                } else {
                    usersResponded.push(m.author);
                }
                if (triviaChoiceASCII[correctIndex].toLowerCase() === m.content.toLowerCase()) {
                    return collector.stop();
                }
            });

            collector.on('end', async (collected, reason) => {
                game.setRound(game.round + 1);
                if (reason == 'time' || !collected.last()) {
                    triviaMessage.embeds[0].color = await client.database.getColor("fail") || null;
                    triviaMessage.embeds[0].description = triviaChoices.map((e, i) => {
                        if (i != correctIndex) return `🟥${e}`;
                        return `✅${e}`;
                    }).join('\n');
                    await triviaMessage.edit(new Discord.MessageEmbed(triviaMessage.embeds[0])).catch(xlg.error);
                    allowedTime = -100;
                    await countDownMessage.edit(`Game ended.`).catch(console.error);
                    const gameEndCallout = await message.channel.send('**Looks like nobody got the answer this time.** *Respond with ` tr ` in 10 sec to continue game.*').catch(console.error);
                    if (!gameEndCallout) return;
                    gameEndCallout.channel.awaitMessages(r => r.content.toLowerCase() == 'tr', {
                        max: 1,
                        time: 10000,
                        errors: ['time']
                        })
                        .then(() => {
                            gameEndCallout.edit(`**Looks like nobody got the answer this time.**`).catch(xlg.error);
                            //displayScores(message, game.round, game.scores);
                            game.displayScores(message);
                            triviaCommand.execute(client, message, args, flags);
                        })  
                        .catch(() => {
                            gameEndCallout.edit('**Looks like nobody got the answer this time.** Scores deleted.').catch(xlg.error);
                            //displayScores(message, round, scores, true);
                            game.displayScores(message, true);
                            games.splice(games.indexOf(game), 1);
                        });
                    return;
                }
                const last = <Discord.Message>collected.last();
                if (!last.member) return;
                const collectedLast = last.member.displayName;
                triviaMessage.embeds[0].color = await client.database.getColor("success") || null;
                triviaMessage.embeds[0].description = triviaChoices.map((e, i) => {
                    if (i != correctIndex) return `🟥${e}`;
                    return `✅${e}`;
                }).join('\n');
                await triviaMessage.edit(new Discord.MessageEmbed(triviaMessage.embeds[0])).catch(xlg.error);
                allowedTime = -100;

                game.increaseScore(last.member);

                await countDownMessage.edit(`Game ended.`).catch(xlg.error);
                const gameEndCallout = await message.channel.send(`**${collectedLast} got the correct answer!** *Respond with \` tr \` in 10 sec to start a new game quickly.*`);
                gameEndCallout.channel.awaitMessages(r => r.content.toLowerCase() == 'tr', {
                        max: 1,
                        time: 10000,
                        errors: ['time']
                    })
                    .then(() => {
                        gameEndCallout.edit(`**${collectedLast} got the correct answer!**`).catch(xlg.error);
                        //displayScores(message, round, scores);
                        game.displayScores(message);
                        triviaCommand.execute(client, message, args, flags);
                    })
                    .catch(() => {
                        gameEndCallout.edit(`**${collectedLast} got the correct answer!** Scores deleted.`).catch(xlg.error);
                        //displayScores(message, round, scores, true);
                        game.displayScores(message, true);
                        game.killGame();
                        //games.splice(games.indexOf(game), 1);
                    });
            });
        } catch (error) {
            xlg.error(error);
            await client.specials.sendError(message.channel);
            return false;
        }
    }
}

