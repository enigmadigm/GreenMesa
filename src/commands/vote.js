const xlg = require("../xlogger");
const { getGlobalSetting } = require("../dbmanager");

module.exports = {
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
                return message.react('❌')
                    .catch(console.error);
            }
            message.delete().catch();
            let iec_gs = await getGlobalSetting("info_embed_color");
            let info_embed_color = parseInt(iec_gs[0].value);
            let voteEmbed = await message.channel.send({
                embed: {
                    color: info_embed_color,
                    title: "Vote",
                    description: args.join(" "),
                    footer: {
                        text: `by ${message.author.tag}`
                    }
                }
            }).catch(xlg.error);
            await voteEmbed.react('✅')
                .catch(console.error);
            voteEmbed.react('❌')
                .catch(console.error);

        } catch (error) {
            xlg.error(error);
            await client.specials.sendError(message.channel);
            return false;
        }
    }
}
