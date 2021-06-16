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
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const D = Discord;
        try {
            const evalRet = await eval(`(async () => {${args.join(" ")}})()`);
            await message.channel.send({
                split: true,
                content: `🟢 Executed:\n\`\`\`\n${(typeof evalRet !== "undefined" ? evalRet.toString() : 'no return').escapeSpecialChars()}\n\`\`\``,
            });
            xlg.log("Executed `eval`: success");
        } catch (e) {
            //xlg.log(`EM: ${e.message} EStack: ${e.stack}`);
            console.error(`${m().format()}] Executed \`eval\`: fail`);
            await client.specials.sendError(message.channel, `🔴 Execution Error:\n\`\`\`${e}\`\`\``);
        }
    }
}
