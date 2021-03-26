import xlg from '../../xlogger';
//import { getGlobalSetting } from "../dbmanager";
import ytdl from 'ytdl-core';
import { Command } from 'src/gm';

export const command: Command = {
    name: 'stream',
    aliases: ['play'],
    description: {
        short: '***PREVIEW COMMAND*** play audio from YouTube',
        long: '***PREVIEW COMMAND*** Play audio in a voice channel using this bot. This command currently takes only YouTube URLs. This is a preview command, there is more to come.'
    },
    cooldown: 5,
    guildOnly: true,
    usage: '<YouTube URL available in the United States>',
    async execute(client, message, args) {
        try {
            if (!message.member) return;
            //let darkred_embed_color = parseInt((await getGlobalSetting('darkred_embed_color'))[0].value);
            // const fail_embed_color = await client.database.getColor("fail_embed_color");
            const info_embed_color = await client.database.getColor("info_embed_color");
    
            if (!args.length) {
                client.specials?.sendError(message.channel, 'You must specify something to play.');
                return;
            }
    
            const voiceChannel = message.member.voice.channel;
            if (!voiceChannel) {
                client.specials?.sendError(message.channel, "You must join a voice channel first.");
                return;
            }
            if (!ytdl.validateURL(args.join(" "))) {
                client.specials?.sendError(message.channel, "That is not a valid YouTube video url.");
                return;
            }
            if (!voiceChannel.joinable) {
                client.specials?.sendError(message.channel, "I am unable to join that voice channel.");
                return;
            }
            if (!voiceChannel.speakable) {
                client.specials?.sendError(message.channel, "I am unable to speak in that voice channel.");
                return;
            }
            if (voiceChannel.full) {
                client.specials?.sendError(message.channel, "I am unable to join that voice channel because it is full.");
                return;
            }

            try {
                await voiceChannel.join().then(connection => {
                    const stream = ytdl(args.join(" ") || 'https://www.youtube.com/watch?v=9AMYVgtmkoM', {
                        filter: 'audioonly'
                    });
                    const dispatcher = connection.play(stream);

                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    let info: any;
                    stream.on('info', (videoInfo) => {
                        info = videoInfo;
                    });

                    connection.on('disconnect', () => stream.destroy());

                    dispatcher.on('start', () => {
                        message.channel.send({
                            embed: {
                                color: info_embed_color,
                                title: 'Playing',
                                description: `Started playing **${info && info.videoDetails && info.videoDetails.title ? info.videoDetails.title : ''}** in ${voiceChannel}`,
                                footer: {
                                    text: 'Voice'
                                }
                            }
                        });
                    });

                    dispatcher.on('finish', () => voiceChannel.leave());
                })
            } catch (error) {
                xlg.error(error);
                client.specials?.sendError(message.channel, "Could not join or play channel!");
            }
        } catch (error) {
            xlg.error(error);
            await client.specials?.sendError(message.channel);
            return false;
        }
    }
}

