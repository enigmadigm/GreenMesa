const NaturalLanguageUnderstandingV1 = require('ibm-watson/natural-language-understanding/v1');
const { IamAuthenticator } = require('ibm-watson/auth');

const naturalLanguageUnderstanding = new NaturalLanguageUnderstandingV1({
    version: '2019-07-12',
    authenticator: new IamAuthenticator({
        apikey: '***REMOVED***',
    }),
    url: 'https://api.us-south.natural-language-understanding.watson.cloud.ibm.com/instances/c3583068-a860-4dea-b3b3-d417250e51bc',
});

//For the future: There's more coming. In the future I may move to another Language Processor, or offer more to choose from by user preference. AYLIEN, Google Cloud, Twinword.

module.exports = {
    name: 'sentiment',
    description: 'Get the sentiment of a message using IBM\'s Watson. Plans for this command involve adding more features (besides sentiment analysis), and allowing URLs to be entered for HTML processing.',
    aliases:['sm','emotion'],
    usage:"<message id to process, text content to process>",
    args:true,
    cooldown: 5,
    ownerOnly: false,
    async execute(client, message, args) {
        var msgContent;
        if (args.length == 1 && !isNaN(args.toString()) && args.toString().length == 18) {
            await message.channel.fetchMessage(args[0])
                .then(msg => {
                    msgContent = msg.content;
                }).catch(console.error);
        } else {
            msgContent = args.join(" ");
        }

        const analyzeParams = {
            'text': `${msgContent}`,
            'language': 'en',
            'features': {
                'sentiment': {},
                'emotion': {}
            }
        }

        const wMsg = await message.channel.send('Analyzing...');

        naturalLanguageUnderstanding.analyze(analyzeParams)
            .then(analysisResults => {
                let emotionsResults = analysisResults.result.emotion.document.emotion;
                let emotions = [];
                for (const emotionKey in emotionsResults) {
                    emotions.push(`**${emotionKey[0].toUpperCase() + emotionKey.slice(1)}:** ${emotionsResults[emotionKey] * 100}%`)
                }

                wMsg.edit({
                    embed: {
                        "description": "Use an AI to tell you all about your text.",
                        "color": 9860623,
                        "fields": [
                            {
                                "name": "Sentiment Analysis",
                                "value": "Sentiment is the overall emotion/tone of a message."
                            },
                            {
                                "name": "Sentiment",
                                "value": analysisResults.result.sentiment.document.label,
                                "inline": true
                            },
                            {
                                "name": "Score",
                                "value": (analysisResults.result.sentiment.document.score * 100).toString() + "%",
                                "inline": true
                            },
                            {
                                "name": "Emotion Analysis",
                                "value": 'Detected emotion probability.\n'+emotions.join('\n')
                            }
                        ],
                        "footer": {
                            "text": "Watson Natural Language Processing | In Development"
                        }
                    }
                }).catch(console.error);
            })
            .catch(err => {
                wMsg.edit('**FAILED** *please note* that you cannot send an id of an embed, they are not compatible.');
                console.log('Sentiment File Error:', err);
            });
    }
}
