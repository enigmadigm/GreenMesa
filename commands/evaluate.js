const xlg = require("../xlogger");
const { permLevels } = require('../permissions');

module.exports = {
    name: 'evaluate',
    aliases: ['eval'],
    description: 'eval',
    permLevel: permLevels.botMaster,
    async execute(client, message, args) {
        try {
            let evalRet = await eval(args.join(" "));
            message.channel.send(`🟢 Executed:\n\`\`\`${evalRet ? evalRet : 'no return'}\`\`\``, {
                split: true
            });
            xlg.log("Executed `eval`: success");
        } catch (e) {
            //xlg.log(`EM: ${e.message} EStack: ${e.stack}`);
            xlg.log("Executed `eval`: fail");
            message.channel.send(`🔴 Execution Error:\n\`\`\`${e}\`\`\``);
        }
    }
}