import config from '../../../auth.json' assert {type: "json"};
import NaturalLanguageUnderstandingV1 from 'ibm-watson/natural-language-understanding/v1.js';
import { IamAuthenticator } from 'ibm-watson/auth/index.js';
import { Command } from 'src/gm';
import { isSnowflake } from '../../utils/specials.js';

const naturalLanguageUnderstanding = new NaturalLanguageUnderstandingV1({
    version: '2019-07-12',
    authenticator: new IamAuthenticator({
        apikey: config.IBM.NLPAPIKEY,
    }),
    url: config.IBM.NLPINSTANCE,
});

//For the future: There's more coming. In the future I may move to another Language Processor, or offer more to choose from by user preference. AYLIEN, Google Cloud, Twinword.

export const command: Command = {
    name: 'sentiment',
    description: {
        short: 'get the sentiment of provided text or a message',
        long: 'Get the analyzed sentiment of a message using machine learning. More features may come (besides sentiment analysis), and allowing URLs to be entered for HTML processing'
    },
    aliases: ['sm', 'emotion', 'saltiness'],
    usage: "<message id to process / text content to process>",
    args: true,
    cooldown: 3,
    async execute(client, message, args) {
        try {
            let msgContent: string;
            const a = args.join(" ");
            if (args.length == 1 && isSnowflake(a) && a.length == 18) {
                const msg = await message.channel.messages.fetch(a);
                msgContent = msg.content;
            } else {
                msgContent = a;
            }

            const analyzeParams = {
                text: `${msgContent}`,
                language: 'en',
                features: {
                    sentiment: {},
                    emotion: {}
                }
            }

            const wMsg = await message.channel.send({ content: "Analyzing..." });

            try {
                const analysisResults = await naturalLanguageUnderstanding.analyze(analyzeParams)
                const emotionsResults = analysisResults.result.emotion?.document?.emotion;
                if (!emotionsResults) {
                    await wMsg.edit("No analysis result.");
                    return;
                }
                const emotions = [];
                for (const emotionKey in emotionsResults) {
                    emotions.push(`**${emotionKey[0].toUpperCase() + emotionKey.slice(1)}:** ${(emotionsResults[<keyof typeof emotionsResults>emotionKey] || 0) * 100}%`)
                }

                await wMsg.edit({
                    content: null,
                    embeds: [{
                        description: "Use an AI to tell you all about your text.",
                        color: 9860623,
                        fields: [{
                            name: "Sentiment Analysis",
                            value: "Sentiment is the overall emotion/tone of a message.",
                            inline: false,
                        },
                        {
                            name: "Sentiment",
                            value: `${analysisResults.result.sentiment?.document?.label}`,
                            inline: true,
                        },
                        {
                            name: "Score",
                            value: ((analysisResults.result.sentiment?.document?.score || 0) * 100).toString() + "%",
                            inline: true,
                        },
                        {
                            name: "Emotion Analysis",
                            value: `Detected emotion probability.\n${emotions.join('\n')}`,
                            inline: false,
                        }
                        ],
                        footer: {
                            text: "Watson Natural Language Processing",
                        },
                    }],
                });
            } catch (err) {
                xlg.error('Sentiment File Error:', err);
                await wMsg.edit('**FAILED** *please note* that you cannot send an id of an embed, they are not compatible.');
            }
        } catch (error) {
            xlg.error(error);
            await client.specials.sendError(message.channel);
            return false;
        }
    }
}
