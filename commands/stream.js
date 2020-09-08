const xlg = require('../xlogger');
const { getGlobalSetting } = require("../dbmanager");
const ytdl = require('ytdl-core');

module.exports = {
    name: 'stream',
    aliases: ['p', 'play'],
    description: {
        short: '***PREVIEW COMMAND*** play audio from YouTube',
        long: '***PREVIEW COMMAND*** Play audio in a voice channel using this bot. This command currently takes only YouTube URLs. This is a preview command, there is more to come.'
    },
    cooldown: 5,
    guildOnly: true,
    usage: '<YouTube URL available in the United States>',
    async execute(client, message, args) {
        //let darkred_embed_color = parseInt((await getGlobalSetting('darkred_embed_color'))[0].value);
        let fec_gs = await getGlobalSetting("fail_embed_color");
        let fail_embed_color = parseInt(fec_gs[0].value);
        let iec_gs = await getGlobalSetting("info_embed_color");
        let info_embed_color = parseInt(iec_gs[0].value);

        if (!args.length) return message.channel.send({
            embed: {
                color: fail_embed_color,
                description: 'You must specify something to play.'
            }
        });

        const voiceChannel = message.member.voice.channel;
        if (!voiceChannel) {
            return message.channel.send({
                embed: {
                    color: fail_embed_color,
                    description: 'You must join a voice channel first.'
                }
            }).catch(xlg.error);
        }
        if (!ytdl.validateURL(args.join(" "))) return message.channel.send({
            embed: {
                color: fail_embed_color,
                description: 'That is not a valid YouTube video url.'
            }
        }).catch(xlg.error);
        if (!voiceChannel.joinable) return message.channel.send({
            embed: {
                color: fail_embed_color,
                description: 'I am unable to join that voice channel.'
            }
        }).catch(xlg.error);
        if (!voiceChannel.speakable) return message.channel.send({
            embed: {
                color: fail_embed_color,
                description: 'I am unable to speak in that voice channel.'
            }
        }).catch(xlg.error);
        if (voiceChannel.full) return message.channel.send({
            embed: {
                color: fail_embed_color,
                description: 'I am unable to join that voice channel because it is full.'
            }
        }).catch(xlg.error);


        voiceChannel.join().then(connection => {
            const stream = ytdl(args.join(" ") || 'https://www.youtube.com/watch?v=9AMYVgtmkoM', {
                filter: 'audioonly'
            });
            const dispatcher = connection.play(stream);

            let info;
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
                }).catch(xlg.error);
            });

            dispatcher.on('finish', () => voiceChannel.leave());
        }).catch(e => {
            xlg.log(e);
            message.channel.send({
                embed: {
                    color: fail_embed_color,
                    description: 'Could not join channel!'
                }
            })
        });
    }
}