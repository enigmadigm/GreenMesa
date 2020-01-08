const NaturalLanguageUnderstandingV1 = require('ibm-watson/natural-language-understanding/v1');
const { IamAuthenticator } = require('ibm-watson/auth');

const naturalLanguageUnderstanding = new NaturalLanguageUnderstandingV1({
    version: '2019-07-12',
    authenticator: new IamAuthenticator({
        apikey: '***REMOVED***',
    }),
    url: 'https://api.us-south.natural-language-understanding.watson.cloud.ibm.com/instances/c3583068-a860-4dea-b3b3-d417250e51bc',
});

module.exports = {
    name: 'sentiment',
    description: 'Get the sentiment of a message using IBM\'s Watson. Plans for this command involve adding more features (besides sentiment analysis), and allowing URLs to be entered for HTML processing.',
    aliases:['sm'],
    usage:"<message id to process, text content to process>",
    args:true,
    cooldown: 5,
    ownerOnly: false,
    async execute(client, message, args, conn) {
        // if (!args.length || args.length != 1 || args.toString().length != 18) return message.channel.send('Invalid arguments').catch(console.error);

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
                'sentiment': {}
            }
        }

        naturalLanguageUnderstanding.analyze(analyzeParams)
            .then(analysisResults => {
                //const results = JSON.stringify(analysisResults, null, 2);
                message.channel.send({
                    embed: {
                        "title": "Sentiment Analysis",
                        "description": "Using IBM's Watson: Natural Language Processing resource we can retrieve various features like Sentiment.",
                        //"color": Math.floor(Math.random() * 16777215),
                        "color": 9860623,
                        "fields": [
                            {
                                "name": "Label",
                                "value": analysisResults.result.sentiment.document.label,
                                "inline": true
                            },
                            {
                                "name": "Score",
                                "value": analysisResults.result.sentiment.document.score.toString(),
                                "inline": true
                            },
                            {
                                "name": "Future Enhancement",
                                "value": "There's more coming. In the future I may move to another Language Processor, or offer more to choose from (note to self: Google Cloud)."
                            }
                        ],
                        "footer": {
                            "text": "Watson Sentiment | In Development"
                        }
                    }
                }).catch(console.error);
            })
            .catch(err => {
                console.log('error:', err);
            });
    }
}