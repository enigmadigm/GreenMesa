const Discord = require("discord.js");
const fetch = require('node-fetch');

async function aResponded(message) {
    const alreadyRespondedCallout = await message.channel.send('You already responded!');
    setTimeout(function () {
        alreadyRespondedCallout.delete().catch(O_o => {O_o});
    }, 2500);
}

module.exports = {
    name: 'trivia',
    description: 'Super duper fun trivia command for your buddy GreenMesa. Let it ask you grueling questions and embarass you in front of your friends because you won\'t know the answer! Command just released and still in development, more features should be expected soon.',
    aliases:['tr'],
    cooldown: 20,
    async execute(client, message, args, conn, scores = [], round = 1) {
        if ((round % 5) == 0) {
            // Need to review this one for understanding \\\ Supposed to sort scores in descending order \\\ makes sense now
            scores.sort((a, b) => b.score - a.score);
            let newScoreList = scores.map((ela) => `${ela.score} ⁞ ${ela.user.displayName}`)
            message.channel.send({
                embed: {
                    color: 0xffa500,
                    description: `\`\`\`\nRound ${round}\n${newScoreList.join("\n")}\n\`\`\``
                }
            })
        }

        return fetch(`https://opentdb.com/api.php?amount=1&difficulty=easy&type=multiple&encode=url3986`)
            .then(res => res.json())
            .then(async j => {
                if (j.response_code != 0 && j.response_code != "0") return message.channel.send('There\'s been an error, we will address this issue as soon as possible. Until we do, you will continue to receive this message upon execution.').then(console.log('Error in `trivia`'));
                //Setting up for message
                var correctIndex = Math.floor(Math.random() * j.results[0].incorrect_answers.length);

                let triviaQuestion = decodeURIComponent(j.results[0].question);
                let triviaCategory = decodeURIComponent(j.results[0].category);

                let triviaChoices = j.results[0].incorrect_answers;
                let triviaChoiceLetters = ['🇦', '🇧', '🇨', '🇩'];
                let triviaChoiceASCII = ['a', 'b', 'c', 'd'];
                // let triviaTFChoice = ['✅', '❌'];

                const triviaCommand = client.commands.get('trivia')

                // *went with alternative
                triviaChoices.splice(correctIndex, 0, `${j.results[0].correct_answer}`);
                triviaChoices = triviaChoices.map((e, i) => `${triviaChoiceLetters[i]} : ${decodeURIComponent(e)}`);


                // Send the message that users will respond to
                const filter = response => {
                    return triviaChoiceASCII.includes(response.content.toLowerCase());
                }
                if (Math.floor(Math.random() * 10) >= 9) {
                    const inDevMsg = await message.channel.send('*This command is currently under development, any feedback is appreciated. Features like Questions by Category, Continuous Game, and Difficulty Options can be expected in the future.*').catch(console.error);
                    setTimeout(function () {
                        inDevMsg.delete().catch(O_o => {O_o});
                    }, 3000);
                }
                const triviaMessage = await message.channel.send({
                    embed: {
                        "title": triviaQuestion,
                        "description": triviaChoices.join('\n'),
                        "timestamp": new Date(),
                        "footer": {
                            "text": 'Trivia | '+triviaCategory+' | Round '+round
                        }
                    }
                }).catch(console.error);
                let cdTime = 20;
                const countDownMessage = await message.channel.send(`Enter the ***letter*** for the correct answer in \` < ${cdTime} \` seconds`);
                setInterval(function () {
                    if (cdTime <= 0) return clearInterval();
                    cdTime -= 5;
                    countDownMessage.edit(`Enter the ***letter*** for the correct answer in \` < ${cdTime} \` seconds`)
                }, 5000);
                const collector = message.channel.createMessageCollector(filter, {
                    time: 20000
                });
                
                let usersResponded = [];
                collector.on('collect', m => {
                    if (usersResponded.includes(m.author)) {
                        return aResponded(message);
                    } else {
                        usersResponded.push(m.author);
                    }
                    if (triviaChoiceASCII[correctIndex].toLowerCase() === m.content.toLowerCase()) {
                        return collector.stop();
                    }
                });
                
                collector.on('end', async (collected, reason) => {
                    round += 1;
                    if (reason == 'time') {
                        triviaMessage.embeds[0].color = 16711680;
                        triviaMessage.embeds[0].description = triviaChoices.map((e, i) => {
                            if (i != correctIndex) return `🟥${e}`;
                            return `✅${e}`;
                        }).join('\n');
                        await triviaMessage.edit(new Discord.RichEmbed(triviaMessage.embeds[0])).catch(console.error);
                        cdTime = -100;
                        await countDownMessage.edit(`Game ended.`).catch(console.error);
                        const gameEndCallout = await message.channel.send('**Looks like nobody got the answer this time.** *Respond with ` tr ` in 10 sec to start a new game quickly.*').catch(console.error);
                        gameEndCallout.channel.awaitMessages(r => r.content.toLowerCase() == 'tr', {
                            maxMatches: 1,
                            time: 10000,
                            errors: ['time']
                            })
                            .then(() => {
                                gameEndCallout.edit(`**Looks like nobody got the answer this time.**`).catch(console.error);
                                triviaCommand.execute(client, message, null, null, scores, round);
                            })
                            .catch(() => {gameEndCallout.edit('**Looks like nobody got the answer this time.** Scores deleted.').catch(console.error)});
                        return;
                    }
                    let collectedLast = collected.last().member.displayName;
                    triviaMessage.embeds[0].color = 65280;
                    triviaMessage.embeds[0].description = triviaChoices.map((e, i) => {
                        if (i != correctIndex) return `🟥${e}`;
                        return `✅${e}`;
                    }).join('\n');
                    await triviaMessage.edit(new Discord.RichEmbed(triviaMessage.embeds[0])).catch(console.error);
                    cdTime = -100;

                    if (scores.length == 0) {
                        scores = [
                            {
                                user: collected.last().member,
                                score: 1
                            }
                        ]
                    } else {
                        let existsIndex;
                        for (let i = 0; i < scores.length; i++) {
                            const elem = scores[i];
                            if (elem.user && elem.user.user.id == collected.last().author.id) {
                                existsIndex = i;
                            }
                        }
                        if (!isNaN(existsIndex)) {
                            scores[existsIndex].score += 1;
                        } else {
                            scores.push({ user: collected.last().member, score: 1})
                        }
                    }

                    await countDownMessage.edit(`Game ended.`).catch(console.error);
                    const gameEndCallout = await message.channel.send(`**${collectedLast} got the correct answer!** *Respond with \` tr \` in 10 sec to start a new game quickly.*`);
                    gameEndCallout.channel.awaitMessages(r => r.content.toLowerCase() == 'tr', {
                            maxMatches: 1,
                            time: 10000,
                            errors: ['time']
                        })
                        .then(() => {
                            gameEndCallout.edit(`**${collectedLast} got the correct answer!**`).catch(console.error);
                            triviaCommand.execute(client, message, null, null, scores, round);
                        })
                        .catch(() => {
                            gameEndCallout.edit(`**${collectedLast} got the correct answer!** Scores deleted.`).catch(console.error);
                        });
                    });
            });
    }
}
