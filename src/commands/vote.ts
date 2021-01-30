import { Command } from "src/gm";
import xlg from "../xlogger";
//import { getGlobalSetting } from "../dbmanager";

const command: Command = {
    name: 'vote',
    description: 'Call a quick vote on the message the command was in',
    usage: "[the content of the vote]",
    guildOnly: true,
    category: 'utility',
    async execute(client, message, args) {
        try {
            if (!args.length) {
                await message.react('✅')
                    .catch(console.error);
                message.react('❌')
                    .catch(console.error);
                return;
            }
            message.delete().catch();
            const info_embed_color = await client.database?.getColor("info_embed_color");
            const voteEmbed = await message.channel.send({
                embed: {
                    color: info_embed_color,
                    title: "Vote",
                    description: args.join(" "),
                    footer: {
                        text: `by ${message.author.tag}`
                    }
                }
            });
            await voteEmbed.react('✅')
                .catch(console.error);
            voteEmbed.react('❌')
                .catch(console.error);

        } catch (error) {
            xlg.error(error);
            await client.specials?.sendError(message.channel);
            return false;
        }
    }
}

export default command;