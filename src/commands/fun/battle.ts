import { Command } from "src/gm";
import { stringToMember } from '../../utils/parsers';

const actions = ['shoot', 'punch', 'kick', 'drop', 'choke', 'torture', 'shoot', 'superhero battle', 'cleave', 'cgi fight', 'electrocute', 'nuke', 'SCP-3125', 'clobber', 'decimate', 'humiliate'];

export const command: Command = {//TODO: make a play-by-play visualization of each contest
    name: 'battle',
    aliases: ['fight'],
    description: {
        short: 'throw hands with another member',
        long: 'Contest with another user. There\'s a chance you\'ll get caught!! THIS COMMAND WILL BE DEVELOPED IN THE FUTURE.'
    },
    guildOnly: true,
    cooldown: 1,
    args: true,
    usage: '<person to fight with>',
    async execute(client, message, args) {
        try {
            const target = await stringToMember(message.guild, args.join(" ")) || message.mentions.members?.first();
            const action = actions[Math.floor(Math.random() * actions.length)];
            const outcome = [true, false][Math.floor(Math.random() * 2)];

            if (!target) {
                await message.channel.send({
                    embeds: [{
                        color: await client.database.getColor("info"),
                        description: `Pick a contestant, will you?`,
                    }],
                });
                return;
            }

            if (target.id === message.author.id) {
                await message.channel.send({
                    embeds: [{
                        color: await client.database.getColor("fail"),
                        description: `whilst trying to fight with itself, ${target} passes out after ${[message.guild.me, await message.guild.fetchOwner()][Math.floor(Math.random() * 2)]} ${action}s it`,
                    }],
                });
                return;
            }

            await message.channel.send({
                embeds: [{
                    color: outcome ? await client.database.getColor("success") : await client.database.getColor("fail"),
                    description: `You ${!outcome ? 'die' : 'win'} after you, ${message.author}, ${outcome ? 'successfully' : 'completely fail to'} ${action} ${target}${outcome ? ` ${Math.floor(Math.random() * 500)} times` : ''}.`,
                }],
            });
        } catch (error) {
            xlg.error(error);
            await client.specials.sendError(message.channel);
            return false;
        }
    }
}
