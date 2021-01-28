import xlg from "../xlogger";
import { permLevels } from '../permissions';
import { stringToChannel } from "../utils/parsers";
import { addTwitchWebhook } from "../website/routes/twitch";
import Discord, { CollectorFilter } from "discord.js";
import { Command } from "src/gm";

/*function validURL(str) {
  const pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
    '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
    '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
    '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
  return pattern.test(str);
}*/

function validateTwitchURL(str: string) {
    return /^((http|https):\/\/|)(www\.|)twitch\.tv\/[a-zA-Z0-9_]{1,}$/.test(str);
}

const command: Command = {
    name: "addtwitch",
    aliases: ["atwitch"],
    description: {
        short: "create a twitch notifier",
        long: "Create a Twitch Notifier. Using a Twitch username and channel that you provide, this will send notifications to the channel when your streamer goes live. Send the notification channel as an argument, and a wizard will guide you through the rest of the steps."
    },
    usage: "[streamer name]",
    args: false,
    permLevel: permLevels.admin,
    guildOnly: true,
    async execute(client, message, args) {
        try {
            if (!message.guild) return;
            const iec = await client.database?.getColor("info_embed_color");
            
            let targetUsername = args.join(" ") || "";
            if (!targetUsername) {
                await message.channel.send({
                    embed: {
                        color: iec,
                        title: "Twitch Notif Setup 1️⃣",
                        description: "What is the username of your streamer? Send it in the chat. To change this later you must delete this notifier and start over."
                    }
                });
                const streamerCollected = await message.channel.awaitMessages((response) => response.author.id === message.author.id && response.content.length < 100, { time: 30000, max: 1 });
                if (!streamerCollected || !streamerCollected.first()) {
                    client.specials?.sendError(message.channel, "No valid name was given within the time limit. This setup wizard has been cancelled.\nYou will be notified if the name was incorrect at the end of the process.");
                    return false;
                } else {
                    targetUsername = streamerCollected.first()?.content || "";
                }
            } else {
                await message.channel.send({
                    embed: {
                        color: iec,
                        title: "Twitch Notif Setup 1️⃣",
                        description: "Username already provided, skipping step."
                    }
                });
            }
            if (validateTwitchURL(targetUsername)) {
                const twitchURLParts = targetUsername.split("/") || [];
                targetUsername = twitchURLParts[twitchURLParts.length - 1] || "";
            }

            await message.channel.send({
                embed: {
                    color: iec,
                    title: "Twitch Notif Setup 2️⃣",
                    description: "What channel should the notifications be sent in? Send the channel in the chat. To change this later you must delete this notifier and start over."
                }
            });
            const channelCollected = await message.channel.awaitMessages((response) => response.author.id === message.author.id && response.content.length < 100, { time: 20000, max: 1 });
            const targetChannel = channelCollected.size ? stringToChannel(message.guild, channelCollected.first()?.content || "") : undefined;
            if (!channelCollected || !channelCollected.first() || !targetChannel || !targetChannel.id) {
                client.specials?.sendError(message.channel, "A valid channel was not given. This setup wizard has been cancelled.");
                return false;
            }

            await message.channel.send({
                embed: {
                    color: iec,
                    title: "Twitch Notif Setup 3️⃣",
                    description: "Would you like to send a customized message when your streamer goes live? **If no, type `no`, otherwise type your message.**\nThis cannot be customized later and will require you to delete the notifier and start over."
                }
            });
            const msgCollected = await message.channel.awaitMessages((response) => response.author.id === message.author.id && response.content.length < 1800, { time: 40000, max: 1 });
            let notifmsg = "";
            if (!msgCollected || !msgCollected.first()) {
                client.specials?.sendError(message.channel, "A response message was not received within the time limit, the setup wizard has been cancelled.");
                return false;
            } else {
                if (msgCollected.first()?.content.toLowerCase() !== "no") {
                    notifmsg = msgCollected.first()?.content || "";
                }
            }

            const confMsg = await message.channel.send({
                embed: {
                    color: iec,
                    title: "Confirm",
                    description: `React to confirm and proceed to complete the setup`
                }
            });
            await confMsg.react("🟢").catch(xlg.error);

            const filter: CollectorFilter = (r, u) => r.emoji.name === '🟢' && (message.guild?.members.cache.get(u.id)?.permissions.has(["ADMINISTRATOR"]) || u.id === message.author.id);
            const collected = await confMsg.awaitReactions(filter, { max: 1, time: 60000 });
            if (!collected || !collected.size) {
                confMsg.embeds[0].color = parseInt((await getGlobalSetting("fail_embed_color"))[0].value, 10);
                confMsg.embeds[0].title = null;
                confMsg.embeds[0].description = "Aborted setup";
                await confMsg.edit(new Discord.MessageEmbed(confMsg.embeds[0])).catch(xlg.error);

                const reactsToRemove = confMsg.reactions.cache.filter(r => r.users.cache.has(client.user?.id || ""));
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
                    confMsg.embeds[0].color = parseInt((await getGlobalSetting("fail_embed_color"))[0].value, 10)
                    confMsg.embeds[0].title = null;
                    confMsg.embeds[0].description = "Error when creating subscription with Twitch";
                    await confMsg.edit(new Discord.MessageEmbed(confMsg.embeds[0]));
                    //client.specials.sendError(message.channel, "Error when creating subscription with Twitch");
                    await confMsg.reactions.removeAll();
                    
                } else if (hookRes === "ID_NOT_FOUND") {
                    confMsg.embeds[0].color = parseInt((await getGlobalSetting("fail_embed_color"))[0].value, 10)
                    confMsg.embeds[0].title = null;
                    confMsg.embeds[0].description = `Your streamer, \`${targetUsername}\`, could not be found`;
                    await confMsg.edit(new Discord.MessageEmbed(confMsg.embeds[0]));
                    //client.specials.sendError(message.channel, `Your streamer, \`${targetUsername}\`, could not be found`);
                    await confMsg.reactions.removeAll();
                    
                } else if (hookRes === "ALREADY_EXISTS") {
                    confMsg.embeds[0].color = parseInt((await getGlobalSetting("fail_embed_color"))[0].value, 10)
                    confMsg.embeds[0].title = null;
                    confMsg.embeds[0].description = `A subscription for \`${targetUsername}\` already exists`;
                    confMsg.embeds[0].footer = {
                        text: "delete it with the remt command"
                    };
                    await confMsg.edit(new Discord.MessageEmbed(confMsg.embeds[0]));
                    //client.specials.sendError(message.channel, `A subscription for \`${targetUsername}\` already exists`);
                    await confMsg.reactions.removeAll();

                } else {
                    confMsg.embeds[0].color = parseInt((await getGlobalSetting("success_embed_color"))[0].value, 10)
                    confMsg.embeds[0].title = "Subscribed";
                    confMsg.embeds[0].description = `You server is now subscribed to notifications in ${targetChannel} for when **${targetUsername}** goes live.`;
                    await confMsg.edit(new Discord.MessageEmbed(confMsg.embeds[0]));

                    const reactsToRemove = confMsg.reactions.cache.filter(r => r.users.cache.has(client.user?.id || ""));
                    try {
                        for (const reaction of reactsToRemove.values()) {
                            await reaction.users.remove(client.user?.id || "");
                        }    
                    } catch (error) {
                        xlg.error(error);
                    }    

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