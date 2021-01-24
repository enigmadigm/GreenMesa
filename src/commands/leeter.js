const Leeter = require('../utils/leeter');
const xlg = require('../xlogger');
var leeter = new Leeter(1, false);

module.exports = {
    name: 'leeter',
    args: true,
    aliases: ['leetspeaker', 'leetify', 'leetspeakify', 'leet'],
    guildonly: true,
    category: 'utility',
    execute(client, message, args) {
        message.channel.send({
            embed: {
                description: `\`${leeter.tol33t(args.join(" "))}\``
            }
        }).catch(xlg.error);
    }
}