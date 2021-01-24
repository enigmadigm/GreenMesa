const Discord = require("discord.js");
const fetch = require('node-fetch');
const xlg = require('../xlogger')
const { getGlobalSetting } = require("../dbmanager");
const deftime = 15;
const games = [];
class TGame {
	public cid: any;
	public msg: any;
	public round: any;
	public scores: any;

    constructor(channelid, messageid, initround = 1) {
        this.cid = channelid;
        this.msg = messageid;
        this.round = initround;
        this.scores = [];
    }

    displayScores(message, ignoreround = false) {
        const round = this.round - 1;
        if (((round) % 5) === 0 || ignoreround) {
            // Need to review this one for understanding \\\ Supposed to sort scores in descending order \\\ makes sense now
            this.scores.sort((a, b) => b.score - a.score);
            let newScoreList = this.scores.map((ela) => `${ela.score} ⁞ ${ela.user.displayName}`)
            if (!newScoreList.length) newScoreList[0] = 'nobody scored';
            message.channel.send({
                embed: {
                    color: 0xffa500,
                    description: `\`\`\`\nRound ${round}\n${newScoreList.join("\n")}\n\`\`\``
                }
            }).catch(xlg.error)
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

module.exports = {
    name: 'trivia',
    description: {
        short: 'starts a trivia game to play solo or with friends',
        long: 'Starts a trivia game that can be played alone or with any number of people. Let it ask you grueling questions and embarass you in front of your friends because you won\'t know the answer!\nThis command has been well used, more features to come! Beware: sometimes questions pop up again, do not get angry, it is something about how the trivia pool is pulled from.'
    },
    aliases:['tr'],
    cooldown: 3,
    category: "fun",
    async execute(client, message/*, args*/) {
        return fetch(`https://opentdb.com/api.php?amount=1&difficulty=easy&type=multiple&encode=url3986`)
            .then(res => res.json())
            .then(async j => {
                if (j.response_code != 0 && j.response_code != "0") return message.channel.send('There\'s been an error, we will address this issue as soon as possible. Until we do, you will continue to receive this message upon execution.').then(xlg.log('Error in `trivia`'));
                //Setting up for message
                var correctIndex = Math.floor(Math.random() * j.results[0].incorrect_answers.length);

                let triviaQuestion = decodeURIComponent(j.results[0].question);
                let triviaCategory = decodeURIComponent(j.results[0].category);
                let triviaChoices = j.results[0].incorrect_answers;
                let triviaChoiceLetters = ['🇦', '🇧', '🇨', '🇩'];
                let triviaChoiceASCII = ['a', 'b', 'c', 'd'];
                // let triviaTFChoice = ['✅', '❌'];

                const triviaCommand = client.commands.get('trivia')
                let game = games.find(g => g.cid === message.channel.id);
                if (!game) {
                    game = new TGame(message.channel.id, message.id);
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
                const filter = response => {
                    return triviaChoiceASCII.includes(response.content.toLowerCase());
                }
                if (Math.floor(Math.random() * 100) >= 92 && game.round == 1) {
                    await message.channel.send('*This command is currently under development, any feedback is appreciated. Features like Questions by Category, Continuous Game, and Difficulty Options can be expected in the future.*').catch(console.error);
                }
                const triviaMessage = await message.channel.send({
                    embed: {
                        "title": triviaQuestion,
                        "description": triviaChoices.join('\n'),
                        "footer": {
                            "text": 'Trivia | '+triviaCategory+' | Round ' + game.round
                        }
                    }
                }).catch(console.error);
                let allowedTime = deftime;
                const countDownMessage = await message.channel.send(`Enter the ***letter*** for the correct answer in \` < ${allowedTime} \` seconds`);
                setInterval(function () {
                    if (allowedTime <= 0) return clearInterval();
                    allowedTime -= 5;
                    countDownMessage.edit(`Enter the ***letter*** for the correct answer in \` < ${allowedTime} \` seconds`).catch(xlg.error);
                }, 5000);
                const collector = message.channel.createMessageCollector(filter, {
                    time: allowedTime * 1000
                });
                
                let usersResponded = [];
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
                    if (reason == 'time') {
                        triviaMessage.embeds[0].color = parseInt((await getGlobalSetting('fail_embed_color'))[0].value, 10);
                        triviaMessage.embeds[0].description = triviaChoices.map((e, i) => {
                            if (i != correctIndex) return `🟥${e}`;
                            return `✅${e}`;
                        }).join('\n');
                        await triviaMessage.edit(new Discord.MessageEmbed(triviaMessage.embeds[0])).catch(xlg.error);
                        allowedTime = -100;
                        await countDownMessage.edit(`Game ended.`).catch(console.error);
                        const gameEndCallout = await message.channel.send('**Looks like nobody got the answer this time.** *Respond with ` tr ` in 10 sec to continue game.*').catch(console.error);
                        gameEndCallout.channel.awaitMessages(r => r.content.toLowerCase() == 'tr', {
                            max: 1,
                            time: 10000,
                            errors: ['time']
                            })
                            .then(() => {
                                gameEndCallout.edit(`**Looks like nobody got the answer this time.**`).catch(xlg.error);
                                //displayScores(message, game.round, game.scores);
                                game.displayScores(message);
                                triviaCommand.execute(client, message);
                            })
                            .catch(() => {
                                gameEndCallout.edit('**Looks like nobody got the answer this time.** Scores deleted.').catch(xlg.error);
                                //displayScores(message, round, scores, true);
                                game.displayScores(message, true);
                            games.splice(games.indexOf(game), 1);
                            });
                        return;
                    }
                    let collectedLast = collected.last().member.displayName;
                    triviaMessage.embeds[0].color = parseInt((await getGlobalSetting('success_embed_color'))[0].value, 10);
                    triviaMessage.embeds[0].description = triviaChoices.map((e, i) => {
                        if (i != correctIndex) return `🟥${e}`;
                        return `✅${e}`;
                    }).join('\n');
                    await triviaMessage.edit(new Discord.MessageEmbed(triviaMessage.embeds[0])).catch(xlg.error);
                    allowedTime = -100;

                    if (game.scores.length == 0) {
                        game.scores = [
                            {
                                user: collected.last().member,
                                score: 1
                            }
                        ]
                    } else {
                        let existsIndex;
                        for (let i = 0; i < game.scores.length; i++) {
                            const elem = game.scores[i];
                            if (elem.user && elem.user.user.id == collected.last().author.id) {
                                existsIndex = i;
                            }
                        }
                        if (!isNaN(existsIndex)) {
                            game.scores[existsIndex].score += 1;
                        } else {
                            game.scores.push({ user: collected.last().member, score: 1})
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
                            triviaCommand.execute(client, message);
                        })
                        .catch(() => {
                            gameEndCallout.edit(`**${collectedLast} got the correct answer!** Scores deleted.`).catch(xlg.error);
                            //displayScores(message, round, scores, true);
                            game.displayScores(message, true);
                            games.splice(games.indexOf(game), 1);
                        });
                });
        });
    }
}
