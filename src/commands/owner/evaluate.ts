import xlg from "../../xlogger";
import { permLevels } from '../../permissions';
import { Command } from "src/gm";

export const command: Command = {
    name: 'evaluate',
    aliases: ['eval'],
    description: 'eval',
    permLevel: permLevels.botMaster,
    async execute(client, message, args) {
        try {
            const evalRet = await eval(`(async () => {${args.join(" ")}})()`);
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

