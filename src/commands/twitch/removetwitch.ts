import { permLevels } from '../../permissions';
import { unsubscribeTwitchWebhook } from "../../website/routes/twitch";
import Discord, { CollectorFilter, MessageReaction, Permissions, User } from "discord.js";
import { Command, GuildMessageProps } from "src/gm";

export const command: Command<GuildMessageProps> = {
    name: "removetwitch",
    aliases: ["rmtwitch"],
    description: {
        short: "remove an existing twitch notifier",
        long: "Remove a Twitch Notifier subscription. You will be prompted to destroy the notifier.",
    },
    usage: "<streamer>",
    args: true,
    permLevel: permLevels.admin,
    guildOnly: true,
    async execute(client, message, args) {
        try {
            const confMsg = await message.channel.send({
                embed: {
                    color: await client.database.getColor("info"),
                    title: "Confirm",
                    description: `This will completely remove your Twitch notifier, continue?`
                }
            });
            await confMsg.react("🟢").catch(xlg.error);
            await confMsg.react("🚫").catch(xlg.error);

            const filter: CollectorFilter<[MessageReaction, User]> = (r, u) => (r.emoji.name === '🟢' || r.emoji.name === '🚫') && (message.guild?.members.cache.get(u.id)?.permissions.has(Permissions.FLAGS.ADMINISTRATOR) || u.id === message.author.id);
            const collected = await confMsg.awaitReactions(filter, {
                max: 1,
                time: 60000
            });
            if (!collected || !collected.size || collected.first()?.emoji.name === "🚫") {
                confMsg.embeds[0].color = await client.database.getColor("fail") || null;
                confMsg.embeds[0].title = null;
                confMsg.embeds[0].description = "Aborted deletion process.";
                await confMsg.edit(new Discord.MessageEmbed(confMsg.embeds[0])).catch(xlg.error);

                const reactsToRemove = confMsg.reactions.cache.filter(r => !!(client.user && r.users.cache.has(client.user.id)));
                try {
                    for (const reaction of reactsToRemove.values()) {
                        await reaction.users.remove(client.user?.id);
                    }
                } catch (error) {
                    xlg.error("could not remove my reactions");
                }
            } else {
                const unsubres = await unsubscribeTwitchWebhook(args.join(" "), message.guild.id);
                if (unsubres === true) {
                    confMsg.embeds[0].color = await client.database.getColor("success") || null;
                    confMsg.embeds[0].title = null;
                    confMsg.embeds[0].description = `Your notifier has been removed.`;
                    await confMsg.edit(new Discord.MessageEmbed(confMsg.embeds[0]));
                } else if (unsubres === "NO_DATA") {
                    confMsg.embeds[0].color = await client.database.getColor("fail") || null;
                    confMsg.embeds[0].title = "Error";
                    confMsg.embeds[0].description = `Twitch is not responding, please try again later.`;
                    await confMsg.edit(new Discord.MessageEmbed(confMsg.embeds[0]));
                } else if (unsubres === "NO_USER") {
                    confMsg.embeds[0].color = await client.database.getColor("fail") || null;
                    confMsg.embeds[0].title = "Error";
                    confMsg.embeds[0].description = `That streamer does not exist.\nQuickly remove streamer with the [dashboard](${client.specials.getDashboardLink(message.guild.id, "twitch")}).`;
                    await confMsg.edit(new Discord.MessageEmbed(confMsg.embeds[0]));
                } else if (unsubres === "INVALID") {
                    confMsg.embeds[0].color = await client.database.getColor("fail") || null;
                    confMsg.embeds[0].title = "Error";
                    confMsg.embeds[0].description = `Invalid input.`;
                    await confMsg.edit(new Discord.MessageEmbed(confMsg.embeds[0]));
                } else if (unsubres === "NO_SUBSCRIPTION") {
                    confMsg.embeds[0].color = await client.database.getColor("fail") || null;
                    confMsg.embeds[0].title = "Error";
                    confMsg.embeds[0].description = `Your notifier could not be removed, it may not exist.\nView subscriptions from the [dashboard](${client.specials.getDashboardLink(message.guild.id, "twitch")}).`;
                    await confMsg.edit(new Discord.MessageEmbed(confMsg.embeds[0]));
                } else {
                    confMsg.content = `Try using the dashboard instead: https://stratum.hauge.rocks`;
                    confMsg.embeds[0].color = await client.database.getColor("fail") || null;
                    confMsg.embeds[0].title = "Error";
                    confMsg.embeds[0].description = `Your notifier could not be removed.`;
                    await confMsg.edit(new Discord.MessageEmbed(confMsg.embeds[0]));
                }

                const reactsToRemove = confMsg.reactions.cache.filter(r => !!(client.user && r.users.cache.has(client.user.id)));
                try {
                    for (const reaction of reactsToRemove.values()) {
                        await reaction.users.remove(client.user?.id);
                    }
                } catch (error) {
                    xlg.error("could not remove my reactions");
                }
            }
        } catch (error) {
            xlg.error(error);
            await client.specials?.sendError(message.channel);
            return false;
        }
    }
}
