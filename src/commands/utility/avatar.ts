import { Command } from 'src/gm';
import getColors from 'get-image-colors';
import { stringToMember } from '../../utils/parsers';
import chroma from 'chroma-js';
import { MessageEmbedOptions } from 'discord.js';
// import FileType from 'file-type';
// import fetch from 'node-fetch';

export const command: Command = {
    name: 'avatar',
    description: 'see the avatar of you or someone else',
    aliases: ['av'],
    usage: '[member]',
    async execute(client, message, args) {
        try {
            const mtarget = message.guild ? await stringToMember(message.guild, args.join(" "), true, true, true) : undefined;
            const target = mtarget ? mtarget.user : message.mentions.users.first() || message.author;
            //const target = message.mentions.users.first() || ((message.guild && message.guild.available && args.length && message.guild.members.cache.get(args[0])) ? message.guild.members.cache.get(args[0]).user || false : false) || message.author;
            let col;
            const aURL = target.avatarURL({ format: "png", dynamic: true });
            let unsupported = false;
            if (aURL) {
                // console.time("t1")
                // const i = await fetch(aURL);
                // const b = await i.buffer();
                // const file = await FileType.fromBuffer(b);
                // console.timeLog("t1") // averaged 133 milliseconds just to verify the file type
                // if (file && ["gif","jpg","jpeg","png","svg"].includes(file.ext.toLowerCase())) {
                const cres = await getColors(aURL);
                if (cres[0]) {
                    col = cres[0].num();
                } else {
                    unsupported = true;
                    col = await client.database.getColor("info");
                }
                // } else {
                //     unsupported = true;
                //     col = await client.database.getColor("info");
                // }
            } else {
                unsupported = true;
                col = await client.database.getColor("info");
            }
            const embed: MessageEmbedOptions = {
                color: col,
                author: {
                    name: target.tag.escapeDiscord(),
                    iconURL: target.displayAvatarURL(),
                },
                title: 'Avatar',
                url: target.displayAvatarURL({ format: 'png', dynamic: true, size: 512 }),
                image: {
                    url: target.displayAvatarURL({ format: 'png', dynamic: true, size: 256 }),
                },
                footer: {
                    text: `Primary Color: ${unsupported ? `Unsupported avatar type` : chroma(col).hex()}`,
                }
            };
            message.channel.send({
                embed
            });
        } catch (error) {
            xlg.error(error);
            await client.specials?.sendError(message.channel);
            return false;
        }
    }
}

