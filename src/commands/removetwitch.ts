import xlg from "../xlogger";
import { permLevels } from '../permissions';
import { unsubscribeTwitchWebhook } from "../website/routes/twitch";
import Discord, { CollectorFilter } from "discord.js";
import { Command } from "src/gm";

const command: Command = {
    name: "removetwitch",
    aliases: ["rmtwitch"],
    description: {
        short: "remove the existing twitch notifier",
        long: "Remove a Twitch Notifier. When you send this command, you will be prompted to destroy the current notifier that exists for your guild."
    },
    usage: "<streamer>",
    args: true,
    permLevel: permLevels.admin,
    guildOnly: true,
    async execute(client, message, args) {
        try {
            if (!message.guild) return;
            const confMsg = await message.channel.send({
                embed: {
                    color: await client.database?.getColor("info_embed_color"),
                    title: "Confirm",
                    description: `This will completely remove your Twitch notifier, continue?`
                }
            });
            await confMsg.react("🟢").catch(xlg.error);
            await confMsg.react("🚫").catch(xlg.error);

            const filter: CollectorFilter = (r, u) => (r.emoji.name === '🟢' || r.emoji.name === '🚫') && (message.guild?.members.cache.get(u.id)?.permissions.has(["ADMINISTRATOR"]) || u.id === message.author.id);
            const collected = await confMsg.awaitReactions(filter, {
                max: 1,
                time: 60000
            });
            if (!collected || !collected.size || collected.first()?.emoji.name === "🚫") {
                confMsg.embeds[0].color = parseInt((await getGlobalSetting("fail_embed_color"))[0].value, 10);
                confMsg.embeds[0].title = null;
                confMsg.embeds[0].description = "Aborted deletion process.";
                await confMsg.edit(new Discord.MessageEmbed(confMsg.embeds[0])).catch(xlg.error);

                const reactsToRemove = confMsg.reactions.cache.filter(r => r.users.cache.has(client.user?.id || ""));
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
                    confMsg.embeds[0].color = await client.database?.getColor("success_embed_color") || null;
                    confMsg.embeds[0].title = null;
                    confMsg.embeds[0].description = `Your notifier has been removed.`;
                    await confMsg.edit(new Discord.MessageEmbed(confMsg.embeds[0]));
                } else if (unsubres === "NO_DATA") {
                    confMsg.embeds[0].color = await client.database?.getColor("fail_embed_color") || null;
                    confMsg.embeds[0].title = "Error";
                    confMsg.embeds[0].description = `Twitch is not responding, please try again later.`;
                    await confMsg.edit(new Discord.MessageEmbed(confMsg.embeds[0]));
                } else if (unsubres === "NO_USER") {
                    confMsg.embeds[0].color = await client.database?.getColor("fail_embed_color") || null;
                    confMsg.embeds[0].title = "Error";
                    confMsg.embeds[0].description = `That streamer does not exist.`;
                    await confMsg.edit(new Discord.MessageEmbed(confMsg.embeds[0]));
                } else if (unsubres === "INVALID") {
                    confMsg.embeds[0].color = await client.database?.getColor("fail_embed_color") || null;
                    confMsg.embeds[0].title = "Error";
                    confMsg.embeds[0].description = `Invalid input.`;
                    await confMsg.edit(new Discord.MessageEmbed(confMsg.embeds[0]));
                } else if (unsubres === "NO_SUBSCRIPTION") {
                    confMsg.embeds[0].color = await client.database?.getColor("fail_embed_color") || null;
                    confMsg.embeds[0].title = "Error";
                    confMsg.embeds[0].description = `Your notifier could not be removed, it may not exist.`;
                    await confMsg.edit(new Discord.MessageEmbed(confMsg.embeds[0]));
                } else {
                    confMsg.embeds[0].color = await client.database?.getColor("fail_embed_color") || null;
                    confMsg.embeds[0].title = "Error";
                    confMsg.embeds[0].description = `Your notifier could not be removed.`;
                    await confMsg.edit(new Discord.MessageEmbed(confMsg.embeds[0]));
                }


                const reactsToRemove = confMsg.reactions.cache.filter(r => r.users.cache.has(client.user?.id || ""));
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

export default command;