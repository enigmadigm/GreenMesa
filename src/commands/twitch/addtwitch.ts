import { permLevels } from '../../permissions.js';
import { stringToChannel } from "../../utils/parsers.js";
import { addTwitchWebhook } from "../../website/routes/twitch.js";
import { MessageEmbed, Permissions } from "discord.js";
import { Command } from "src/gm";

function validateTwitchURL(str: string) {
    return /^((http|https):\/\/|)(www\.|)twitch\.tv\/[a-zA-Z0-9_]{1,}$/.test(str);
}

export const command: Command = {
    name: "addtwitch",
    aliases: ["atwitch", "twitchadd"],
    description: {
        short: "create a twitch notifier",
        long: "Create a Twitch Notifier. Using a Twitch username and channel that you provide, this will send notifications to the channel when your streamer goes live. Send the streamer channel as an argument, and a wizard will guide you through the rest of the steps.",
    },
    usage: "[streamer name]",
    examples: [
        "enigmadigm",
    ],
    args: false,
    permLevel: permLevels.admin,
    guildOnly: true,
    async execute(client, message, args) {
        try {
            if (!message.guild) return;
            const iec = await client.database.getColor("info");

            let targetUsername = args.join(" ") || "";
            if (!targetUsername) {
                await message.channel.send({
                    embeds: [{
                        color: iec,
                        title: `Twitch Notif Setup 1️⃣`,
                        description: `What is the username of your streamer? Send it in the chat. You will have to create a new notifier to change this.`,
                    }],
                });
                const streamerCollected = await message.channel.awaitMessages({
                    filter: (response) => response.author.id === message.author.id && response.content.length < 100,
                    time: 30000,
                    max: 1,
                });
                if (!streamerCollected || !streamerCollected.first()) {
                    await client.specials.sendError(message.channel, `No valid name was given within the time limit. This setup wizard has been cancelled.\nIf the streamer doesn't exist, you will be told after the last step.\n**Use the [dashboard](${client.specials.getDashboardLink(message.guild.id, "twitch")}) for an enhanced experience.**`);
                    return false;
                } else {
                    targetUsername = streamerCollected.first()?.content || "";
                }
            } else {
                await message.channel.send({
                    embeds: [{
                        color: iec,
                        title: `Twitch Notif Setup 1️⃣`,
                        description: `Username already provided, skipping step.`,
                    }],
                });
            }
            if (validateTwitchURL(targetUsername)) {
                const twitchURLParts = targetUsername.split("/") || [];
                targetUsername = twitchURLParts[twitchURLParts.length - 1] || "";
            }

            await message.channel.send({
                embeds: [{
                    color: iec,
                    title: `Twitch Notif Setup 2️⃣`,
                    description: `**What channel should the notifications be sent in?** Send the channel in the chat.\nTo change this later, use the [dashboard](${client.specials.getDashboardLink(message.guild.id, "twitch")}).`,
                }],
            });
            const channelCollected = await message.channel.awaitMessages({
                filter: (response) => response.author.id === message.author.id && response.content.length < 100,
                time: 20000,
                max: 1,
            });
            const targetChannel = channelCollected.size ? stringToChannel(message.guild, channelCollected.first()?.content || "") : undefined;
            if (!channelCollected.first() || !targetChannel || !targetChannel.id) {
                await client.specials.sendError(message.channel, `A valid channel was not given. This setup wizard has been cancelled.`);
                return false;
            }

            await message.channel.send({
                embeds: [{
                    color: iec,
                    title: `Twitch Notif Setup 3️⃣`,
                    description: `**You may use a custom message to announce your streamer, otherwise type \`no\`.**\nTo edit the message later, use the [dashboard](${client.specials.getDashboardLink(message.guild.id, "twitch")}).\n\n**Available placeholders:**\n*{name}\n{link}\n{game}\n{title}*`,
                }],
            });
            const msgCollected = await message.channel.awaitMessages({
                filter: (response) => response.author.id === message.author.id && response.content.length < 1800,
                time: 40000,
                max: 1,
            });
            let notifmsg = "";
            if (!msgCollected || !msgCollected.first()) {
                await client.specials.sendError(message.channel, `A response message was not received within the time limit, the setup wizard has been cancelled.`);
                return false;
            } else {
                if (msgCollected.first()?.content.toLowerCase() !== "no") {
                    notifmsg = msgCollected.first()?.content || "";
                }
            }

            const confMsg = await message.channel.send({
                embeds: [{
                    color: iec,
                    title: `Confirm`,
                    description: `React to confirm and proceed to complete the setup`,
                }],
            });
            await confMsg.react("🟢").catch(xlg.error);

            const collected = await confMsg.awaitReactions({
                filter: (r, u) => r.emoji.name === '🟢' && (message.guild?.members.cache.get(u.id)?.permissions.has(Permissions.FLAGS.ADMINISTRATOR) || u.id === message.author.id),
                max: 1,
                time: 60000,
            });
            if (!collected || !collected.size) {
                confMsg.embeds[0].color = await client.database.getColor("fail") || null;
                confMsg.embeds[0].title = null;
                confMsg.embeds[0].description = "Aborted setup";
                if (confMsg.editable) {
                    await confMsg.edit({ embeds: [new MessageEmbed(confMsg.embeds[0])] });
                }

                const reactsToRemove = confMsg.reactions.cache.filter(r => !!(client.user && r.users.cache.has(client.user.id)));
                try {
                    for (const reaction of reactsToRemove.values()) {
                        await reaction.users.remove(client.user?.id);
                    }
                } catch (error) {
                    xlg.error(error);
                }
            } else {
                const hookRes = await addTwitchWebhook(targetUsername, false, message.guild.id, targetChannel, notifmsg);
                if (!hookRes) {
                    confMsg.embeds[0].color = await client.database.getColor("fail") || null;
                    confMsg.embeds[0].title = null;
                    confMsg.embeds[0].description = "Error when creating subscription with Twitch";
                    if (confMsg.editable) {
                        await confMsg.edit({ embeds: [new MessageEmbed(confMsg.embeds[0])] });
                        await confMsg.reactions.removeAll();
                    }

                } else if (hookRes === "ID_NOT_FOUND") {
                    confMsg.embeds[0].color = await client.database.getColor("fail") || null;
                    confMsg.embeds[0].title = null;
                    confMsg.embeds[0].description = `Your streamer, \`${targetUsername}\`, could not be found\n\nUse the [dashboard](${client.specials.getDashboardLink(message.guild.id, "twitch")}) instead to avoid this`;
                    if (confMsg.editable) {
                        await confMsg.edit({ embeds: [new MessageEmbed(confMsg.embeds[0])] });
                        await confMsg.reactions.removeAll();
                    }

                } else if (hookRes === "ALREADY_EXISTS") {
                    confMsg.embeds[0].color = await client.database.getColor("fail") || null;
                    confMsg.embeds[0].title = null;
                    confMsg.embeds[0].description = `A subscription for \`${targetUsername}\` already exists\n\nView subscriptions from the [dashboard](${client.specials.getDashboardLink(message.guild.id, "twitch")})`;
                    confMsg.embeds[0].footer = {
                        text: "delete it with the rmtwitch command or from the dash"
                    };
                    if (confMsg.editable) {
                        await confMsg.edit({ embeds: [new MessageEmbed(confMsg.embeds[0])] });
                        await confMsg.reactions.removeAll();
                    }

                } else {
                    confMsg.embeds[0].color = await client.database.getColor("success") || null;
                    confMsg.embeds[0].title = "Subscribed";
                    confMsg.embeds[0].description = `You server is now subscribed to notifications in ${targetChannel} for when **${targetUsername}** goes live.\n\nEdit subscription from the [dashboard](${client.specials.getDashboardLink(message.guild.id, "twitch")})`;
                    if (confMsg.editable) {
                        await confMsg.edit({ embeds: [new MessageEmbed(confMsg.embeds[0])] });
                        const reactsToRemove = confMsg.reactions.cache.filter(r => !!(client.user && r.users.cache.has(client.user.id)));
                        for (const reaction of reactsToRemove.values()) {
                            if (client.user) {
                                await reaction.users.remove(client.user.id).catch(() => {/**/});
                            }
                        }    
                    }
                }
            }
        } catch (error) {
            xlg.error(error);
            await client.specials.sendError(message.channel);
            return false;
        }
    }
}
