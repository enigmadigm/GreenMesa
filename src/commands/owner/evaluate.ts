import xlg from "../../xlogger";
import { permLevels } from '../../permissions';
import { Command } from "src/gm";
import moment from 'moment';
import Discord from 'discord.js';

export const command: Command = {
    name: 'evaluate',
    aliases: ['eval'],
    description: 'eval',
    permLevel: permLevels.botMaster,
    async execute(client, message, args) {
        const m = moment;
        const D = Discord;
        try {
            const evalRet = await eval(`(async () => {${args.join(" ")}})()`);
            await message.channel.send(`🟢 Executed:\n\`\`\`\n${(typeof evalRet !== "undefined" ? evalRet.toString() : 'no return').escapeSpecialChars()}\n\`\`\``, {
                split: true
            });
            xlg.log("Executed `eval`: success");
        } catch (e) {
            //xlg.log(`EM: ${e.message} EStack: ${e.stack}`);
            console.error(`${m().format()}] Executed \`eval\`: fail`);
            client.specials?.sendError(message.channel, `🔴 Execution Error:\n\`\`\`${e}\`\`\``);
        }
    }
}
