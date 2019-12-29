module.exports = {
    name: 'xp',
    description: 'Get the current amount of xp for the person requested or the author of the message. This system is explained elsewhere, but it should be known that xp is earned by sending messages of any kind globally (on any server GreenMesa is in).',
    usage: "[other user]",
    execute(client, message, args, conn) {
        let target = message.mentions.users.first() || ((message.guild && message.guild.available) ? message.guild.members.get(args[1]) : false) || message.author;
        conn.query(`SELECT * FROM dgmxp WHERE id = '${target.id}'`, (err, rows) => {
            if (err) throw err;
            if (!rows[0]) return message.channel.send("This user has no XP on record.");
            let xp = rows[0].xp;
            message.channel.send(target.tag + " currently has " + xp + "xp");
        });
    }
}