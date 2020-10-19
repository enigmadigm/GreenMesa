const xlg = require("../xlogger");
const { getGlobalSetting } = require("../dbmanager");
const { argsMustBeNum, argsNumRequire } = require('../utils/specialmsgs');

module.exports = {
    name: "triangle",
    description: "find the area of a triangle",
    usage: "<base> <height>",
    args: true,
    async execute(client, message, args) {
        if (!(await argsNumRequire(message.channel, args, 2))) return false;
        if (!(await argsMustBeNum(message.channel, args))) return false;

        let x = args[0];
        let y = args[1];

        message.channel.send({
            embed: {
                color: parseInt((await getGlobalSetting('darkgreen_embed_color'))[0].value),
                title: "Area of Triangle",
                description: `The area of a triangle with \`BASExHEIGHT\` \`${x}x${y}\` is \`${(x * y) / 2}\``
            }
        }).catch(xlg.error);
    }
}