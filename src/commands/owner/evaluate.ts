import { permLevels } from '../../permissions';
import { Command } from "src/gm";
import moment from 'moment';
import Discord, { Util } from 'discord.js';

export const command: Command = {
    name: 'evaluate',
    aliases: ['eval'],
    description: 'eval',
    permLevel: permLevels.botMaster,
    async execute(client, message, args) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const m = moment;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const D = Discord;
        try {
            const evalRet = await eval(`(async () => {${args.join(" ")}})()`);
            const splut = Util.splitMessage(`🟢 Executed:\n\`\`\`\n${(typeof evalRet !== "undefined" ? evalRet.toString() : 'no return').escapeSpecialChars()}\n\`\`\``);
            for await (const s of splut) {
                await message.channel.send({
                    content: s,
                });
            }
            xlg.log("Executed `eval`: success");
        } catch (e) {
            //xlg.log(`EM: ${e.message} EStack: ${e.stack}`);
            xlg.error(`Executed \`eval\`: fail`);
            // console.error(`${m().format()}] Executed \`eval\`: fail`);
            await client.specials.sendError(message.channel, `🔴 Execution Error:\n\`\`\`${Util.cleanCodeBlockContent(`${e}`)}\`\`\``);
        }
    }
}
