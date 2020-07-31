// NOTE: This whole xp system is in long-term development and needs work. The updates will probably come with a web console if there ever is one.
const { getXP } = require("../dbmanager");
//const xlg = require("../xlogger");

module.exports = {
    name: 'xp',
    description: 'Get the current amount of xp for the person requested or the author of the message. This system is explained elsewhere, but it should be known that xp is earned by sending messages of any kind globally (on any server GreenMesa is in).',
    usage: "[other user]",
    async execute(client, message, args) {
        let target = message.mentions.users.first() || ((message.guild && message.guild.available) ? message.guild.members.cache.get(args[1]) : false) || message.author;

        let rows = await getXP(message, target);

        if (!rows[0]) return message.channel.send("This user has no XP on record.");
        let xp = rows[0].xp;
        message.channel.send(target.tag + " currently has " + xp + "xp");
    }
}
