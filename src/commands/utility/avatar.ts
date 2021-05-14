import { Command } from 'src/gm';
import { stringToMember } from '../../utils/parsers';

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
            const darkblue_embed_color = await client.database.getColor("darkblue_embed_color");
            message.channel.send({
                embed: {
                    color: darkblue_embed_color,
                    author: {
                        name: target.tag.escapeDiscord(),
                        iconURL: target.displayAvatarURL(),
                    },
                    title: 'Avatar',
                    url: target.displayAvatarURL({ format: 'png', dynamic: true, size: 512 }),
                    image: {
                        url: target.displayAvatarURL({ format: 'png', dynamic: true, size: 256 })
                    }
                }
            });
        } catch (error) {
            xlg.error(error);
            await client.specials?.sendError(message.channel);
            return false;
        }
    }
}

