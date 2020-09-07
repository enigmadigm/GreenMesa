const Leeter = require('../utils/leeter');
var leeter = new Leeter(1, false);

module.exports = {
    name: 'leeter',
    args: true,
    aliases: ['leetspeaker', 'leetify', 'leetspeakify', 'leet'],
    guildonly: true,
    execute(client, message, args) {
        message.channel.send(leeter.tol33t(args.join(" ")));
    }
}