const xlg = require('../xlogger');
const { getGlobalSetting } = require('../dbmanager')
const { stringToMember } = require('../utils/parsers');

const actions = ['shoot', 'punch', 'kick', 'drop', 'choke', 'torture', 'shoot', 'superhero battle', 'cleave', 'big cgi fight'];

module.exports = {
    name: 'battle',
    aliases: ['fight'],
    description: {
        short: 'fight with another user',
        long: 'Fight with another user. There\'s a chance you\'ll get caught!! THIS COMMAND WILL BE DEVELOPED IN THE FUTURE'
    },
    guildOnly: true,
    cooldown: 1,
    args: true,
    category: 'fun',
    usage: '<person to fight with>',
    async execute(client, message, args) {
        try {
            let fec_gs = await getGlobalSetting("fail_embed_color");
            let fail_embed_color = parseInt(fec_gs[0].value);
            let iec_gs = await getGlobalSetting("info_embed_color");
            let info_embed_color = parseInt(iec_gs[0].value);
            let sec_gs = await getGlobalSetting("success_embed_color");
            let success_embed_color = parseInt(sec_gs[0].value);

            let target = await stringToMember(message.guild, args.join(" ")) || message.mentions.members.first();
            let action = actions[Math.floor(Math.random() * actions.length)];
            let outcome = [true, false][Math.floor(Math.random() * 2)];

            if (!target) {
                await message.channel.send({
                    embed: {
                        color: info_embed_color,
                        description: 'Pick a contestant, won\'t you?'
                    }
                });
                return;
            }
            if (target.id === message.author.id) {
                await message.channel.send({
                    embed: {
                        color: fail_embed_color,
                        description: `whilst trying to fight with itself, ${target} passes out after ${[message.guild.me, message.guild.owner][Math.floor(Math.random() * 2)]} ${action}s it`
                    }
                });
                return;
            }
            await message.channel.send({
                embed: {
                    color: outcome ? success_embed_color : fail_embed_color,
                    description: `You ${!outcome ? 'die' : 'win'} after you, ${message.author}, ${outcome ? 'successfully' : 'completely fail to'} ${action} ${target}${outcome ? ' ' + Math.floor(Math.random() * 500) + ' times' : ''}.`
                }
            });
        } catch (error) {
            xlg.error(error);
            await client.specials.sendError(message.channel, "Failure removing role");
            return false;
        }
    }
}