const Discord = require("discord.js");
const fetch = require('node-fetch');

module.exports = {
    name: 'trivia',
    description: 'Super duper fun trivia command for your buddy GreenMesa. Let it ask you grueling questions and embarass you in front of your friends because you won\'t know the answer! Command just released and still in development, more features should be expected soon.',
    aliases:['tr'],
    cooldown: 20,
    async execute(client, message, args, conn) {
        return fetch(`https://opentdb.com/api.php?amount=1&difficulty=easy&type=multiple&encode=url3986`)
            .then(res => res.json())
            .then(async j => {
                if (j.response_code != 0 && j.response_code != "0") return message.channel.send('There\'s been an error, we will address this issue as soon as possible. Until we do, you will continue to receive this message upon execution.').then(console.log('Error in `trivia`'));
                //Setting up for message
                var correctIndex = Math.floor(Math.random() * j.results[0].incorrect_answers.length);

                // let triviaQuestion = decodeURI(j.results[0].question).replace(/\%2C|\%3F/gi, "");
                let triviaQuestion = decodeURIComponent(j.results[0].question);
                let triviaCategory = decodeURIComponent(j.results[0].category);

                // let triviaAnswers = [decodeURI(j.results[0].correct_answer)];
                let triviaChoices = j.results[0].incorrect_answers;
                // let triviaChoices = [];
                let triviaChoiceLetters = ['🇦', '🇧', '🇨', '🇩', '🇪', '🇫', '🇬', '🇭'];
                let triviaChoiceASCII = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
                // let triviaTFChoice = ['✅', '❌'];

                const triviaCommand = client.commands.get('trivia')

                // making array of all answers (right answer, wrong answer, wrong answer, wrong anwer)
                // for (let i = 0; i < j.results[0].incorrect_answers.length; i++) {
                //     triviaAnswers.push(decodeURI(j.results[0].incorrect_answers[i]));
                // }
                // making new array of how the answers will be displayed (randomizes the array in previous loop)
                // ::NOTE:: an alternative method is using the .splice() function to insert the right answer at a random spot :: triviaChoices.splice(j.results[0].incorrect_answers[i], 0, j.results[0].correct_answer)
                // for (let tae = 0; tae < triviaAnswers.length; tae++) {
                //     const nxtAnsIndx = Math.floor(Math.random() * triviaAnswers.length);
                //     const nextAnswer = triviaAnswers[nxtAnsIndx];
                //     triviaChoices.push(`${triviaChoiceLetters[tae]} : ${nextAnswer}`);
                //     if (nextAnswer == triviaAnswers[0]) {
                //         correctIndex = tae;
                //     }
                //     triviaAnswers.splice(nxtAnsIndx, 1);
                //     // or const nextAnswer = triviaAnswers.splice(Math.floor(Math.random() * triviaAnswers.length), 1) because splice returns an array of the deleted items
                // }
                // went with alternative
                triviaChoices.splice(correctIndex, 0, `${j.results[0].correct_answer}`);
                triviaChoices = triviaChoices.map((e, i) => `${triviaChoiceLetters[i]} : ${decodeURIComponent(e)}`);


                // Send the message that users will respond to
                const filter = response => {
                    return triviaChoiceASCII.includes(response.content.toLowerCase());
                }
                if (Math.floor(Math.random() * 10) >= 9) {
                    const inDevMsg = await message.channel.send('*This command is currently under development, any feedback is appreciated. Features like Questions by Category, Continuous Game, and Difficulty Options can be expected in the future.*').catch(console.error);
                    setTimeout(function () {
                        inDevMsg.delete().catch(O_o => {});
                    }, 3000);
                }
                const triviaMessage = await message.channel.send({
                    embed: {
                        "title": triviaQuestion,
                        "description": triviaChoices.join('\n'),
                        "timestamp": new Date(),
                        "footer": {
                            "text": 'Trivia | '+triviaCategory
                        }
                    }
                }).catch(console.error); // .then(triviaMessage => {
                //     message.channel.awaitMessages(filter, {
                //             max: 1,
                //             time: 30000,
                //             errors: ['time']
                //         })
                //         .then(collected => {
                //             triviaMessage.embeds[0].color = 65280;
                //             triviaMessage.edit(new Discord.RichEmbed(triviaMessage.embeds[0])).then(triviaMessage.clearReactions()).then(triviaMessage.react(triviaChoiceLetters[correctIndex]));
                //             message.channel.send(`${collected.first().author.username} got the correct answer!`);
                //         })
                //         .catch(collected => {
                //             triviaMessage.embeds[0].color = 16711680;
                //             triviaMessage.edit(new Discord.RichEmbed(triviaMessage.embeds[0])).then(triviaMessage.clearReactions()).then(triviaMessage.react(triviaChoiceLetters[correctIndex]));
                //             message.channel.send('Looks like nobody got the answer this time.');
                //         });
                // });
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
                        return message.channel.send('You already responded!');
                    } else {
                        usersResponded.push(m.author);
                    }
                    if (triviaChoiceASCII[correctIndex].toLowerCase() === m.content.toLowerCase()) {
                        return collector.stop();
                    }
                });
                
                collector.on('end', async (collected, reason) => {
                    if (reason == 'time') {
                        triviaMessage.embeds[0].color = 16711680;
                        triviaMessage.embeds[0].description = triviaChoices.map((e, i) => {
                            if (i != correctIndex) return `🟥${e}`;
                            return `✅${e}`;
                        }).join('\n');
                        await triviaMessage.edit(new Discord.RichEmbed(triviaMessage.embeds[0])).catch(console.error);
                        //await triviaMessage.clearReactions();
                        //await triviaMessage.react(triviaChoiceLetters[correctIndex]);
                        cdTime = -100;
                        await countDownMessage.edit(`Game ended.`).catch(console.error);
                        const gameEndCallout = await message.channel.send('**Looks like nobody got the answer this time.** *Respond with \` tr \` in 10 sec to start a new game quickly.*').catch(console.error);
                        gameEndCallout.channel.awaitMessages(r => r.content.toLowerCase() == 'tr', {
                                maxMatches: 1,
                                time: 10000,
                                errors: ['time']
                            })
                            .then(() => {
                                gameEndCallout.edit(`**${collected.last().author.username} got the correct answer!**`).catch(console.error);
                                triviaCommand.execute(client, message);
                            })
                            .catch(O_o => {gameEndCallout.edit('**Looks like nobody got the answer this time.**').catch(console.error)});
                        return;
                    }
                    triviaMessage.embeds[0].color = 65280;
                    triviaMessage.embeds[0].description = triviaChoices.map((e, i) => {
                        if (i != correctIndex) return `🟥${e}`;
                        return `✅${e}`;
                    }).join('\n');
                    await triviaMessage.edit(new Discord.RichEmbed(triviaMessage.embeds[0])).catch(console.error);
                    //await triviaMessage.clearReactions()
                    //await triviaMessage.react(triviaChoiceLetters[correctIndex]);
                    cdTime = -100;
                    await countDownMessage.edit(`Game ended.`).catch(console.error);
                    const gameEndCallout = await message.channel.send(`**${collected.last().author.username} got the correct answer!** *Respond with \` tr \` in 10 sec to start a new game quickly.*`);
                    gameEndCallout.channel.awaitMessages(r => r.content.toLowerCase() == 'tr', {
                            maxMatches: 1,
                            time: 10000,
                            errors: ['time']
                        })
                        .then(() => {
                            gameEndCallout.edit(`**${collected.last().author.username} got the correct answer!**`).catch(console.error);
                            triviaCommand.execute(client, message);
                        })
                        .catch(O_o => {gameEndCallout.edit(`**${collected.last().author.username} got the correct answer!**`).catch(console.error)});
                    // return {
                        //     noWait: true,
                        //     user: collected.last().author
                        // }
                    });
                    
                    
                    
                    
                    // function retry(maxRetries, tas) {
                        //     return triviaMessage.react(triviaChoiceLetters[tas]).catch(function (err) {
                            //         if (maxRetries <= 0) {
                                //             return triviaMessage.edit('Sorry, there has been an error. Please retry the command.').then(collector.stop);
                                //         }
                //         return retry(maxRetries - 1);
                //     });
                // }

                // //Adding reactions to message
                // for (let tas = 0; tas < triviaChoices.length; tas++) {
                //     await retry(1, tas).catch(console.error);
                // }
                
                // Answer reaction collector
                // const collector = triviaMessage.createReactionCollector((reaction, user) => triviaChoiceLetters.includes(reaction.emoji.name) && user.id === message.author.id, {
                //     time: 15000,
                //     maxEmojis: 1
                // });

                // collector.on('collect', (reaction, reactionCollector) => {
                //     message.channel.send(`Collected ${reaction.emoji.name}`);
                //     if (reaction.emoji.name == triviaChoiceLetters[correctIndex]) {
                //         triviaMessage.embeds[0].color = 65280;
                //         triviaMessage.edit(new Discord.RichEmbed(triviaMessage.embeds[0])).then(triviaMessage.clearReactions()).then(triviaMessage.react(triviaChoiceLetters[correctIndex]));
                //         reactionCollector.stop();
                //     } else {
                //         triviaMessage.embeds[0].color = 16711680;
                //         triviaMessage.edit(new Discord.RichEmbed(triviaMessage.embeds[0])).then(triviaMessage.clearReactions()).then(triviaMessage.react(triviaChoiceLetters[correctIndex]));
                //         reactionCollector.stop();
                //     }
                // });

                // collector.on('end', (collected, reason) => {
                //     console.log(`Collected ${collected.size} items`);
                //     console.log(collector.users.get());
                //     console.log(reason);
                //     if (collected.size) return console.log("Collected");
                //     if (!collected.size) return console.log('No Reactions');

                // });
            });
    }
}
