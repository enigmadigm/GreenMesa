import { Command, GuildMessageProps } from "src/gm";

export const command: Command<GuildMessageProps> = {
    name: 'vote',
    description: {
        short: "call a quick vote",
        long: "Call a quick vote on the message the command was in.",
    },
    usage: "[the content of the vote]",
    guildOnly: true,
    async execute(client, message, args) {
        try {
            if (!args.length) {
                await message.react('✅')
                    .catch(console.error);
                await message.react('❌')
                    .catch(console.error);
                return;
            }
            try {
                message.delete();
            } catch (error) {
                //
            }
            const info_embed_color = await client.database.getColor("info");
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
            try {
                await voteEmbed.react('✅');
                await voteEmbed.react('❌');
            } catch (error) {
                //
            }
        } catch (error) {
            xlg.error(error);
            await client.specials?.sendError(message.channel);
            return false;
        }
    }
}
