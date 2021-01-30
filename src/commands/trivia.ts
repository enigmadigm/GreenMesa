import Discord, { CollectorFilter, GuildMember, Message, User } from "discord.js";
import fetch from 'node-fetch';
import { Command } from "src/gm";
import xlg from '../xlogger';
//import { getGlobalSetting } from "../dbmanager";

interface TriviaScoreboard {
    user: GuildMember;
    score: number;
}

const deftime = 15;
const games: TGame[] = [];
class TGame {
	public cid: string;
	public msg: string;
	public round: number;
	public scores: TriviaScoreboard[];

    constructor(channelid: string, messageid: string, initround = 1) {
        this.cid = channelid;
        this.msg = messageid;
        this.round = initround;
        this.scores = [];
    }

    displayScores(message: Message, ignoreround = false) {
        const round = this.round - 1;
        if (((round) % 5) === 0 || ignoreround) {
            // Need to review this one for understanding \\\ Supposed to sort scores in descending order \\\ makes sense now
            this.scores.sort((a, b) => b.score - a.score);
            const newScoreList = this.scores.map((ela) => `${ela.score} ⁞ ${ela.user.displayName}`)
            if (!newScoreList.length) newScoreList[0] = 'nobody scored';
            message.channel.send({
                embed: {
                    color: 0xffa500,
                    description: `\`\`\`\nRound ${round}\n${newScoreList.join("\n")}\n\`\`\``
                }
            }).catch(xlg.error);
        }
    }
}

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

const command: Command = {
    name: 'trivia',
    description: {
        short: 'starts a trivia game to play solo or with friends',
        long: 'Starts a trivia game that can be played alone or with any number of people. Let it ask you grueling questions and embarass you in front of your friends because you won\'t know the answer!\nThis command has been well used, more features to come! Beware: sometimes questions pop up again, do not get angry, it is something about how the trivia pool is pulled from.'
    },
    aliases:['tr'],
    cooldown: 3,
    category: "fun",
    async execute(client, message, args) {
        try {
            const r = await fetch(`https://opentdb.com/api.php?amount=1&difficulty=easy&type=multiple&encode=url3986`)
            const j = await r.json();
            if (j.response_code != 0 && j.response_code != "0") {
                client.specials?.sendError(message.channel, 'There\'s been an error, we will address this issue as soon as possible. Until we do, you will continue to receive this message upon execution.');
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
    
            const triviaCommand = client.commands?.get('trivia');
            if (!triviaCommand) {
                client.specials?.sendError(message.channel, "Apparently this command no longer exists in the bot, sorry.");
                return;
            }
            const game = games.find(g => g.cid === message.channel.id) || new TGame(message.channel.id, message.id);
            if (!games.find(g => g.cid === message.channel.id)) {
                games.push(game);
            } else {
                if (game.msg !== message.id) {
                    return client.specials?.sendError(message.channel, "A game is already in progress");
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
                    "title": triviaQuestion,
                    "description": triviaChoices.join('\n'),
                    "footer": {
                        "text": 'Trivia | ' + triviaCategory + ' | Round ' + game.round
                    }
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
                game.round += 1;
                if (reason == 'time' || !collected.last()) {
                    triviaMessage.embeds[0].color = await client.database?.getColor("fail_embed_color") || null;
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
                            triviaCommand.execute(client, message, args);
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
                triviaMessage.embeds[0].color = await client.database?.getColor("success_embed_color") || null;
                triviaMessage.embeds[0].description = triviaChoices.map((e, i) => {
                    if (i != correctIndex) return `🟥${e}`;
                    return `✅${e}`;
                }).join('\n');
                await triviaMessage.edit(new Discord.MessageEmbed(triviaMessage.embeds[0])).catch(xlg.error);
                allowedTime = -100;
    
                if (game.scores.length == 0) {
                    game.scores = [
                        {
                            user: last.member,
                            score: 1
                        }
                    ]
                } else {
                    let existsIndex;
                    for (let i = 0; i < game.scores.length; i++) {
                        const elem = game.scores[i];
                        if (elem.user && elem.user.user.id == collected.last()?.author.id) {
                            existsIndex = i;
                        }
                    }
                    if (existsIndex) {
                        game.scores[existsIndex].score += 1;
                    } else {
                        game.scores.push({ user: last.member, score: 1})
                    }
                }
    
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
                        triviaCommand.execute(client, message, args);
                    })
                    .catch(() => {
                        gameEndCallout.edit(`**${collectedLast} got the correct answer!** Scores deleted.`).catch(xlg.error);
                        //displayScores(message, round, scores, true);
                        game.displayScores(message, true);
                        games.splice(games.indexOf(game), 1);
                    });
            });
        } catch (error) {
            xlg.error(error);
            await client.specials?.sendError(message.channel);
            return false;
        }
    }
}

export default command;