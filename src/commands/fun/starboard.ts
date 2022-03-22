import { permLevels } from '../../permissions.js';
import { Command } from "src/gm";
import { stringToChannel } from '../../utils/parsers.js';
import { CollectorFilter, GuildChannel, Message, MessageActionRow, MessageButton, MessageComponentInteraction, MessageEmbed, MessageEmbedOptions, MessageSelectMenu, NewsChannel, Permissions, Snowflake, TextChannel, ThreadChannel } from 'discord.js';
import Starboard from '../../struct/Starboard.js';

export const command: Command = {
    name: "starboard",
    aliases: ["sb"],
    description: {
        short: "configure starboard",
        long: "Configure the settings for the server's starboard. Disable by locking.\n\nDue to Discord limitations out of our control, a maximum of 25 ignored channels can be selected in the select menu. To select more channels, use the -b flag.",
    },
    flags: [
        {
            f: "channel",
            d: "starboard channel",
        },
        {
            f: "threshold",
            d: "stars minimum",
            isNumber: true,
        },
        {
            f: "ignore",
            d: "add channel to be ignored",
            notEmpty: true,
        },
        {
            f: "unignore",
            d: "remove an ignored channel",
            notEmpty: true,
        },
        {
            f: "cignore",
            d: "clear ignored channels",
        },
        {
            f: "lock",
            d: "lock/disable starboard",
            v: "1|0",
            isNumber: true,
        },
        {
            f: "nsfw",
            d: "include nsfw channels",
            v: "1|0",
            isNumber: true,
        },
        {
            f: "self",
            d: "allow self-starring",
            v: "1|0",
            isNumber: true,
        },
        {
            f: "star",
            d: "star new starboard entries",
            v: "1|0",
            isNumber: true,
        },
        {
            f: "emoji",
            d: "set emoji to use",
            v: "⭐",
            notEmpty: true,
        },
        {
            f: "color",
            d: "set embed accent color",
            v: "0x000000",
            isNumber: true,
        },
        {
            f: "b",
            d: "use buttons to set ignored channels",
        }
    ],
    examples: [
        "--channel=000000000000000000 --nsfw=1 --self=0",
    ],
    usage: "<...options>",
    args: false,
    cooldown: 2,
    permLevel: permLevels.admin,
    guildOnly: true,
    permissions: [],
    async execute(client, message, args, flags) {
        try {
            const sb = await client.database.getStarboardSetting(message.guild.id);
            if (flags.length) {
                const changes = [""];
                const channelFlag = flags.find(x => x.name === "channel");
                if (channelFlag) {
                    const c = channelFlag.value ? stringToChannel(message.guild, channelFlag.value, true, true) : message.channel;
                    if (!c || !c.isText()) {
                        await client.specials.sendError(message.channel, `Invalid channel\nChannel unchanged`);
                        return;
                    }
                    sb.channel = c.id;
                    changes.push(`= channel set to ${c}`);
                }
                const thresholdFlag = flags.find(x => x.name === "threshold");
                if (thresholdFlag) {
                    const n = thresholdFlag.numberValue;
                    if (!n.between(1, 100, true)) {
                        await client.specials.sendError(message.channel, `Threshold value must be between 1 and 100 inclusive\nThreshold unchanged`);
                        return;
                    }
                    sb.threshold = n;
                    changes.push(`= threshold set to ${n}`);
                }
                const ignoreFlag = flags.find(x => x.name === "ignore");
                const unignoreFlag = flags.find(x => x.name === "unignore");
                const cignoreFlag = flags.find(x => x.name === "cignore");
                if (cignoreFlag) {
                    if (ignoreFlag || unignoreFlag) {
                        await client.specials.sendError(message.channel, `Ignored channels cannot be cleared when other ignore flags are specified\nIgnored channels unchanged`);
                        return;
                    }
                    if (!sb.ignoredChannels.length) {
                        await client.specials.sendError(message.channel, `No channels are ignored\nIgnored channels unchanged`);
                        return;
                    }
                    sb.ignoredChannels = [];
                    changes.push(`- ignored channels cleared`);
                }
                if (ignoreFlag) {
                    const c = stringToChannel(message.guild, ignoreFlag.value, true, true);
                    if (!c || !c.isText()) {
                        await client.specials.sendError(message.channel, `Invalid channel\nIgnored channels unchanged`);
                        return;
                    }
                    sb.ignoredChannels.push(c.id);
                    changes.push(`+ ${c} added to ignored list`);
                }
                if (unignoreFlag) {
                    const c = stringToChannel(message.guild, unignoreFlag.value, true, true);
                    if (!c || !c.isText()) {
                        await client.specials.sendError(message.channel, `Invalid channel\nIgnored channels unchanged`);
                        return;
                    }
                    if (sb.ignoredChannels.indexOf(c.id) < 0) {
                        await client.specials.sendError(message.channel, `${c} is not on ignored list\nIgnored channels unchanged`);
                        return;
                    }
                    sb.ignoredChannels.splice(sb.ignoredChannels.findIndex(x => x === c.id), 1);
                    changes.push(`- ${c} removed from ignored list`);
                }
                const lockFlag = flags.find(x => x.name === "lock");
                if (lockFlag) {
                    if (!lockFlag.numberValue.between(0, 1, true)) {
                        await client.specials.sendError(message.channel, `Value must be zero (0) or one (1)\nLock status unchanged`);
                        return;
                    }
                    sb.locked = !!lockFlag.numberValue;
                    changes.push(`= starboard ${lockFlag.numberValue == 1 ? "locked" : "activated"}`);
                }
                const nsfwFlag = flags.find(x => x.name === "nsfw");
                if (nsfwFlag) {
                    if (!nsfwFlag.numberValue.between(0, 1, true)) {
                        await client.specials.sendError(message.channel, `Value must be zero (0) or one (1)\nSensitive content status unchanged`);
                        return;
                    }
                    sb.allowSensitive = !!nsfwFlag.numberValue;
                    changes.push(`= sensitive content ${nsfwFlag.numberValue == 1 ? "allowed" : "denied"}`);
                }
                const selfFlag = flags.find(x => x.name === "self");
                if (selfFlag) {
                    if (!selfFlag.numberValue.between(0, 1, true)) {
                        await client.specials.sendError(message.channel, `Value must be zero (0) or one (1)\nSelf-star setting unchanged`);
                        return;
                    }
                    sb.allowSelf = !!selfFlag.numberValue;
                    changes.push(`= self-starring ${selfFlag.numberValue == 1 ? "allowed" : "not allowed"}`);
                }
                const starFlag = flags.find(x => x.name === "star");
                if (starFlag) {
                    if (!starFlag.numberValue.between(0, 1, true)) {
                        await client.specials.sendError(message.channel, `Value must be zero (0) or one (1)\nPost-star setting unchanged`);
                        return;
                    }
                    sb.starStarred = !!starFlag.numberValue;
                    changes.push(`= post starring now ${sb.starStarred ? "enabled" : "disabled"}`);
                }
                const emojiFlag = flags.find(x => x.name === "emoji");
                if (emojiFlag) {
                    // may or may not be a reliable emoji test
                    // i have a more thorough emoji test in the flag parser, so 🤷‍♂️
                    if (!/(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff]|<a?:\w{1,100}:[0-9]{18}>)/.test(emojiFlag.value)) {
                        await client.specials.sendError(message.channel, `Value is not an emoji\nEmoji unchanged`);
                        return;
                    }
                    sb.emoji = [emojiFlag.value];
                    changes.push(`= emoji changed to ${emojiFlag.value}`);
                }
                const colorFlag = flags.find(x => x.name === "color");
                if (colorFlag) {
                    if (!colorFlag.numberValue.between(0, 16777216, true)) {
                        await client.specials.sendError(message.channel, `Color value must be within range: 0-16777216\nColor unchanged`);
                        return;
                    }
                    sb.color = colorFlag.numberValue;
                    changes.push(`= accent color set to ${colorFlag.numberValue == 1 ? "on" : "off"}`);
                }
                if (changes.length - 1) {
                    await client.database.setStarboard(message.guild.id, sb);
                    changes[0] = `**Changes made (${changes.length - 1}):**`;
                    await message.channel.send({
                        embeds: [{
                            color: await client.database.getColor("info"),
                            title: `\`⭐\` Starboard`,
                            description: `${changes.join("\n")}`,
                            footer: {
                                text: `Send without flags to view settings`,
                            },
                        }],
                    });
                    if (sb.channel) {
                        return;
                    }
                }
            }
            if (!sb.channel) {
                const { end: willSetChannel, inter: setChannelConfInter } = await client.specials.getUserConfirmation(message.channel, [message.author.id], "Would you like to set a SB channel now?", "Here we go...", "", true);
                if (willSetChannel && setChannelConfInter) {
                    const channelSelectOptions = message.guild.channels.cache
                        .filter((c) => c instanceof TextChannel || c instanceof ThreadChannel || c instanceof NewsChannel)
                        .map((c) => { return { label: c.name, value: c.id, default: sb.channel === c.id } });
                    await setChannelConfInter.reply({
                        content: `Alright, select one from the menu below`,
                        components: [
                            new MessageActionRow().addComponents(
                                new MessageSelectMenu()
                                    .setCustomId(`sbchannelselect-${setChannelConfInter.id}`)
                                    .setPlaceholder("Select SB Channel")
                                    .addOptions(channelSelectOptions)
                            ),
                        ],
                    });
                    const channelSelection = await message.channel.awaitMessageComponent({
                        filter: (inter) => inter.user.id === message.author.id ||
                            inter.member?.permissions instanceof Permissions && (inter.member.permissions.bitfield & 0x8n) === 0x8n,
                        time: 20 * 1000,
                    }).catch(() => undefined);
                    if (!channelSelection || !channelSelection.isSelectMenu()) {
                        await setChannelConfInter.editReply({
                            components: [],
                            content: `Or we'll just not set a channel then`,
                        });
                        return;
                    } else {
                        await channelSelection.deferUpdate();
                        const values = channelSelection.values;
                        if (!values || !values.length) {
                            sb.channel = `0`;
                            await channelSelection.editReply({
                                content: `I reset the SB channel because I got a bad value`,
                                components: [],
                            });
                        } else {
                            const selectedChannel = message.guild.channels.cache.find(c => c.id === values[0] && c.isText());
                            if (selectedChannel) {
                                sb.channel = selectedChannel.id;
                                await channelSelection.editReply({
                                    content: `I set the SB channel to ${selectedChannel}`,
                                    components: [],
                                });
                            } else {
                                await channelSelection.editReply({
                                    content: `I couldn't find that channel so I didn't change anything`,
                                    components: [],
                                });
                            }
                        }
                        await client.database.setStarboard(message.guild.id, sb);
                        return;
                    }
                } else {
                    sb.channel = `0`;
                    await client.database.setStarboard(message.guild.id, sb);
                    // return;
                }
            }
            const starboardChannel = sb.channel ? message.guild.channels.cache.get(sb.channel) : undefined;
            const makeSbEmbed = async (sb: Starboard, starboardChannel?: GuildChannel | ThreadChannel): Promise<{ e: MessageEmbed, comp: MessageActionRow[] }> => {
                const ignoredChannels = sb.ignoredChannels.map(x => {
                    return message.guild.channels.cache.get(x);
                }).filter(x => typeof x !== "undefined") as (GuildChannel | ThreadChannel)[];
                while (ignoredChannels.map((x) => `${x}`).join(", ").length > 1024) {
                    ignoredChannels.pop();
                }
                // ^^^^^^^^ this part could be reduced to a one-liner in the embed options as a array#reduce() function
                const e: MessageEmbedOptions = {
                    color: await client.database.getColor("info"),
                    title: `\`⭐\` Starboard`,
                    description: `Summary configuration of the starboard service${!starboardChannel ? `\n\\⚠️ **A channel is not set, the starboard will not work without one**` : ""}${sb.locked ? `\n\\⚠️ **The starboard is locked, no new posts will be added**` : ""}`,
                    fields: [
                        {
                            name: `Channel`,
                            value: `${starboardChannel ? starboardChannel : "not set"}`,
                            // inline: true,
                        },
                        {
                            name: `Lock Status`,
                            value: `${sb.locked ? "🔒" : "🔓"}`,
                            inline: true,
                        },
                        {
                            name: `Emoji`,
                            value: `${sb.emoji}`,
                            inline: true,
                        },
                        {
                            name: `Threshold`,
                            value: `\`${sb.threshold}\` stars`,
                            inline: true,
                        },
                        {
                            name: `Show Jump Link`,
                            value: `${sb.jumpLink ? "✅" : "❌"}`,
                            inline: true,
                        },
                        {
                            name: `Self Starring`,
                            value: `${sb.allowSelf ? "✅" : "❌"}`,
                            inline: true,
                        },
                        {
                            name: `Add Star`,
                            value: `${sb.starStarred ? "✅" : "❌"}`,
                            inline: true,
                        },
                        {
                            name: `NSFW`,
                            value: `${sb.allowSensitive ? "✅" : "🚫"}`,
                            inline: true,
                        },
                        {
                            name: `Ignored Channels ${sb.ignoredChannels.length ? `(${sb.ignoredChannels.length})` : ""}`,
                            value: `${ignoredChannels.length ? ignoredChannels.map((x) => `${x}`).join(", ") : "none"}`,
                        },
                    ],
                    footer: {
                        text: `configure options using flags (${message.gprefix} ${this.name} --help)`,
                    },
                };
                const channelSelectOptions = message.guild.channels.cache
                    .filter((c) => c instanceof TextChannel || c instanceof ThreadChannel || c instanceof NewsChannel)
                    .map((c) => { return { label: c.name, value: c.id, default: ignoredChannels.includes(c) } });
                // 🔗
                return {
                    e: new MessageEmbed(e), comp: [
                        new MessageActionRow()
                            .addComponents(
                                new MessageButton().setDisabled(false).setLabel(`${sb.jumpLink ? "✖" : "✔"} Jump Link`).setStyle("PRIMARY").setCustomId("jump"),
                                new MessageButton().setDisabled(false).setLabel(`${sb.allowSensitive ? "✖" : "✔"} NSFW`).setStyle("PRIMARY").setCustomId("nsfw"),
                                new MessageButton().setDisabled(false).setLabel(`${sb.allowSelf ? "✖" : "✔"} Self`).setStyle("PRIMARY").setCustomId("self"),
                                new MessageButton().setDisabled(false).setLabel(`${sb.starStarred ? "✖" : "✔"} After-Star`).setStyle("PRIMARY").setCustomId("pstar"),
                            ),
                        new MessageActionRow()
                            .addComponents(
                                new MessageButton().setDisabled(false).setLabel(`Set Threshold`).setStyle("PRIMARY").setCustomId("thresh"),
                                new MessageButton().setDisabled(false).setLabel(`Set Emoji`).setStyle("PRIMARY").setCustomId("emoj"),
                        ),
                        [new MessageActionRow()
                            .addComponents(
                                new MessageButton().setDisabled(false).setLabel(`+ Ignored`).setStyle("PRIMARY").setCustomId("aigno"),
                                new MessageButton().setDisabled(!sb.ignoredChannels.length).setLabel(`- Ignored`).setStyle("PRIMARY").setCustomId("rigno"),
                                new MessageButton().setDisabled(!sb.ignoredChannels.length).setLabel(`Clear Ignored`).setStyle("DANGER").setCustomId("cigno"),
                        ),
                        new MessageActionRow().addComponents(
                            new MessageSelectMenu()
                                .setDisabled(false)
                                .setCustomId("ignomenu")
                                .setMinValues(0)
                                .setMaxValues(channelSelectOptions.length <= 25 ? channelSelectOptions.length : 25)
                                .setPlaceholder("Select Ignored Channels")
                                .addOptions(channelSelectOptions)
                        )][flags.find(x => x.name === "b") ? 0 : 1],// buttons or menu
                    ]
                };
            }
            const { e, comp } = await makeSbEmbed(sb, starboardChannel);
            const confMsg = await message.channel.send({
                embeds: [e],
                components: comp,
            });
            const filter: CollectorFilter<[MessageComponentInteraction]> = (inter) => {
                if (inter.user.id === message.author.id ||
                    (inter.member?.permissions instanceof Permissions && (inter.member.permissions.bitfield & 0x8n) === 0x8n)
                ) {
                    return true;
                }
                return false;
            }
            const confButtonCollector = confMsg.createMessageComponentCollector({
                filter,
                time: 1000 * 120,
            });

            confButtonCollector.on("collect", async (inter) => {
                const secondStepFilter: CollectorFilter<[Message]> = (m) => m.author.id === inter.user.id;
                switch (inter.customId) {
                    case "cigno": {
                        if (sb.ignoredChannels.length) {
                            sb.ignoredChannels = [];
                            const { e, comp } = await makeSbEmbed(sb, starboardChannel);
                            await inter.update({
                                components: comp,
                                embeds: [e],
                            });
                        } else {
                            await inter.deferUpdate();
                        }
                        break;
                    }
                    case "jump": {
                        sb.jumpLink = !sb.jumpLink;
                        const { e, comp } = await makeSbEmbed(sb, starboardChannel);
                        await inter.update({
                            components: comp,
                            embeds: [e],
                        });
                        break;
                    }
                    case "nsfw": {
                        sb.allowSensitive = !sb.allowSensitive;
                        const { e, comp } = await makeSbEmbed(sb, starboardChannel);
                        await inter.update({
                            components: comp,
                            embeds: [e],
                        });
                        break;
                    }
                    case "self": {
                        sb.allowSelf = !sb.allowSelf;
                        const { e, comp } = await makeSbEmbed(sb, starboardChannel);
                        await inter.update({
                            components: comp,
                            embeds: [e],
                        });
                        break;
                    }
                    case "pstar": {
                        sb.starStarred = !sb.starStarred;
                        const { e, comp } = await makeSbEmbed(sb, starboardChannel);
                        await inter.update({
                            components: comp,
                            embeds: [e],
                        });
                        break;
                    }
                    case "emoj": {
                        await inter.reply({
                            content: `Send an emoji`,
                            ephemeral: true,
                        });
                        const emojiSubs = await confMsg.channel.awaitMessages({ filter: secondStepFilter, max: 1, time: 1000 * 10 });
                        const emojiMessage = emojiSubs.first();
                        if (emojiMessage) {
                            if (!/(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff]|<a?:\w{1,100}:[0-9]{18}>)/.test(emojiMessage.content)) {
                                await inter.followUp({
                                    content: `You did not give a valid emoji`,
                                    ephemeral: true,
                                });
                                return;
                            }
                            // if (inter.replied) {
                            //     await inter.deleteReply();// cannot delete an ephemeral message
                            // }
                            const newEmoji = emojiMessage.content;
                            sb.emoji = [newEmoji];
                            if (emojiMessage.deletable) {
                                await emojiMessage.delete();
                            }
                            const { e, comp } = await makeSbEmbed(sb, starboardChannel);
                            await confMsg.edit({
                                components: comp,
                                embeds: [e],
                            });
                            await inter.editReply({
                                content: `The Starboard will now watch for ${newEmoji}`,
                            });
                        } else {
                            await inter.editReply({
                                content: `You didn't send an emoji`,
                            });
                        }
                        break;
                    }
                    case "thresh": {
                        await inter.reply({
                            content: `Send the new threshold (number)`,
                            ephemeral: true,
                        });
                        const collected = await confMsg.channel.awaitMessages({ filter: secondStepFilter, max: 1, time: 1000 * 10 });
                        const threshMessage = collected.first();
                        if (threshMessage) {
                            if (!/[0-9]+/.test(threshMessage.content)) {
                                await inter.followUp({
                                    content: `You did not give a valid number for a threshold`,
                                    ephemeral: true,
                                });
                                return;
                            }
                            const n = parseInt(threshMessage.content, 10);
                            if (!n.between(1, 100, true)) {
                                await inter.followUp({
                                    content: `Threshold value must be between 1 and 100 inclusive`,
                                    ephemeral: true,
                                });
                                return;
                            }
                            sb.threshold = n;
                            if (threshMessage.deletable) {
                                await threshMessage.delete();
                            }
                            const { e, comp } = await makeSbEmbed(sb, starboardChannel);
                            await confMsg.edit({
                                components: comp,
                                embeds: [e],
                            });
                            await inter.editReply({
                                content: `The Starboard will now wait for ${n} reactions before posting new entries`,
                            });
                        } else {
                            await inter.editReply({
                                content: `You didn't send a number`,
                            });
                        }
                        break;
                    }
                    case "rigno": {
                        if (sb.ignoredChannels.length) {
                            await inter.reply({
                                content: `Send the channel you would like to remove`,
                                ephemeral: true,
                            });
                            const collected = await confMsg.channel.awaitMessages({ filter: secondStepFilter, max: 1, time: 1000 * 10 });
                            const channelString = collected.first();
                            if (channelString) {
                                const channel = stringToChannel(message.guild, channelString.content, true, true);
                                if (!channel) {
                                    await inter.followUp({
                                        content: `That is not a known channel`,
                                        ephemeral: true,
                                    });
                                    return;
                                }
                                const ind = sb.ignoredChannels.findIndex(x => x === channel.id);
                                if (ind < 0) {
                                    await inter.followUp({
                                        content: `${channel} isn't on the ignore list (which means I can't remove it, obviously)`,
                                        ephemeral: true,
                                    });
                                    return;
                                }
                                sb.ignoredChannels.splice(ind, 1);
                                if (channelString.deletable) {
                                    await channelString.delete();
                                }
                                const { e, comp } = await makeSbEmbed(sb, starboardChannel);
                                await confMsg.edit({
                                    components: comp,
                                    embeds: [e],
                                });
                                await inter.editReply({
                                    content: `The channel ${channel} has been removed from the Starboard's list of ignored channels.\nReactions in this channel can now affect the Starboard.`,
                                });
                            } else {
                                await inter.editReply({
                                    content: `You didn't send anything (don't worry, administrating isn't for everyone)`,
                                });
                            }
                        } else {
                            await inter.deferUpdate();
                        }
                        break;
                    }
                    case "aigno": {
                        await inter.reply({
                            content: `Send the channel you would like to add`,
                            ephemeral: true,
                        });
                        const collected = await confMsg.channel.awaitMessages({ filter: secondStepFilter, max: 1, time: 1000 * 10 });
                        const channelString = collected.first();
                        if (channelString) {
                            const channel = stringToChannel(message.guild, channelString.content, true, true);
                            if (!channel) {
                                await inter.followUp({
                                    content: `That is not a known channel`,
                                    ephemeral: true,
                                });
                                return;
                            }
                            sb.ignoredChannels.push(channel.id);
                            if (channelString.deletable) {
                                await channelString.delete();
                            }
                            const { e, comp } = await makeSbEmbed(sb, starboardChannel);
                            await confMsg.edit({
                                components: comp,
                                embeds: [e],
                            });
                            await inter.editReply({
                                content: `The channel ${channel} has been added to the Starboard's list of ignored channels.\nReactions in this channel will not result in a posting.`,
                            });
                        } else {
                            await inter.editReply({
                                content: `You didn't send anything (don't worry, administrating isn't for everyone)`,
                            });
                        }
                        break;
                    }
                    case "ignomenu": {
                        if (!inter.isSelectMenu()) {
                            await inter.deferUpdate();
                            return;
                        }
                        // await inter.defer({
                        //     ephemeral: true,
                        // });
                        const selectedChannels = inter.values;
                        const newChannelSet: Snowflake[] = [];
                        if (selectedChannels) {
                            for (const channelString of selectedChannels) {
                                const channel = stringToChannel(message.guild, channelString, true, true);
                                if (!channel) {
                                    continue;
                                }
                                newChannelSet.push(channel.id);
                            }
                        }
                        sb.ignoredChannels = newChannelSet;
                        const { e, comp } = await makeSbEmbed(sb, starboardChannel);
                        await inter.update({
                            embeds: [e],
                            components: comp,
                        });
                        // await inter.editReply({
                        //     content: `Ignored channels updated`,
                        // });
                        break;
                    }
                    default:
                        return;
                }
                await client.database.setStarboard(message.guild.id, sb);
            });

            confButtonCollector.on("end", async () => {
                // if (confMsg.deletable) {
                //     await confMsg.delete();
                // }
                if (confMsg.editable) {
                    await confMsg.edit({
                        // embed: new MessageEmbed(confMsg.embeds[0]),
                        components: [],
                    });
                }
            })
        } catch (error) {
            xlg.error(error);
            await client.specials.sendError(message.channel);
            return false;
        }
    }
}
