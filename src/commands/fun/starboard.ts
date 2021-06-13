import { permLevels } from '../../permissions';
import { Command, GuildMessageProps } from "src/gm";
import { stringToChannel } from '../../utils/parsers';
import { MessageActionRow, MessageButton, MessageEmbedOptions } from 'discord.js';

export const command: Command<GuildMessageProps> = {
    name: "starboard",
    aliases: ["sb"],
    description: {
        short: "configure starboard",
        long: "Configure the settings for the server's starboard. Disable by locking."
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
    ],
    examples: [
        "--channel=000000000000000000 --nsfw=1 --self=0"
    ],
    usage: "<...options>",
    args: false,
    cooldown: 2,
    permLevel: permLevels.admin,
    guildOnly: true,
    ownerOnly: false,
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
                    changes.push(`= starboard ${lockFlag.numberValue ? "locked" : "activated"}`);
                }
                const nsfwFlag = flags.find(x => x.name === "nsfw");
                if (nsfwFlag) {
                    if (!nsfwFlag.numberValue.between(0, 1, true)) {
                        await client.specials.sendError(message.channel, `Value must be zero (0) or one (1)\nSensitive content status unchanged`);
                        return;
                    }
                    sb.allowSensitive = !!nsfwFlag.numberValue;
                    changes.push(`= sensitive content ${nsfwFlag.numberValue ? "allowed" : "denied"}`);
                }
                const selfFlag = flags.find(x => x.name === "self");
                if (selfFlag) {
                    if (!selfFlag.numberValue.between(0, 1, true)) {
                        await client.specials.sendError(message.channel, `Value must be zero (0) or one (1)\nSelf-star status unchanged`);
                        return;
                    }
                    sb.allowSelf = !!selfFlag.numberValue;
                    changes.push(`= self-starring ${selfFlag.numberValue ? "allowed" : "not allowed"}`);
                }
                const starFlag = flags.find(x => x.name === "star");
                if (starFlag) {
                    if (!starFlag.numberValue.between(0, 1, true)) {
                        await client.specials.sendError(message.channel, `Value must be zero (0) or one (1)\nPost-star status unchanged`);
                        return;
                    }
                    sb.starStarred = !!starFlag.numberValue;
                    changes.push(`= post-star status now ${starFlag.numberValue ? "on" : "off"}`);
                }
                const emojiFlag = flags.find(x => x.name === "emoji");
                if (emojiFlag) {
                    // may or may not be a reliable emoji test
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
                        await client.specials.sendError(message.channel, `Color value must be within range: 0-16777216\nPost-star status unchanged`);
                        return;
                    }
                    sb.starStarred = !!colorFlag.numberValue;
                    changes.push(`= accent color set to ${colorFlag.numberValue ? "on" : "off"}`);
                }
                await client.database.setStarboard(message.guild.id, sb);
                changes[0] = `**Changes made (${changes.length - 1}):**`;
                await message.channel.send({
                    embed: {
                        color: await client.database.getColor("info"),
                        title: `\`⭐\` Starboard`,
                        description: `${changes.join("\n")}`,
                    },
                });
                return;// could also get rid of this and make it display updated values right after
            }
            const starboardChannel = sb.channel ? message.guild.channels.cache.get(sb.channel) : undefined;
            const e: MessageEmbedOptions = {
                color: await client.database.getColor("info"),
                title: `\`⭐\` Starboard`,
                description: `Summary configuration of the starboard service${!starboardChannel ? `\n\\⚠️ **A channel is not set, the starboard will not work without one**` : ""}${sb.locked ? `\n\\⚠️ **The starboard is locked, no new posts will be added**` : ""}`,
                fields: [
                    {
                        name: `Channel`,
                        value: `${starboardChannel ? starboardChannel : "not set"}`,
                        inline: true,
                    },
                    {
                        name: `Lock Status`,
                        value: `${sb.locked ? "locked/off" : "unlocked/watching"}`,
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
                        name: `Jump Link`,
                        value: `${sb.jumpLink ? "will show" : "won't show"}`,
                        inline: true,
                    },
                    {
                        name: `NSFW`,
                        value: `${sb.allowSensitive ? "sensitive content allowed" : "prohibited"}`,
                        inline: true,
                    },
                    {
                        name: `Self Starring`,
                        value: `${sb.allowSelf ? "sure" : "nope"}`,
                        inline: true,
                    },
                    {
                        name: `Add Star`,
                        value: `${sb.starStarred ? "sure" : "nope"}`,
                        inline: true,
                    },
                    {
                        name: `Ignored ${sb.ignoredChannels.length ? `(${sb.ignoredChannels.length})` : ""}`,
                        value: `${!sb.ignoredChannels.length ? "none" : `${sb.ignoredChannels.slice(0, 5).map(x => {//TODO: starboard: actually map this out properly, and don't just do it one-liner style
                            const c = message.guild.channels.cache.get(x);
                            return c;
                        })}`}`,
                    },
                ],
                footer: {
                    text: `configure options using flags (${message.gprefix} ${this.name} --help)`,
                },
            };
            const row1 = new MessageActionRow()
                .addComponents(
                    new MessageButton().setDisabled(true).setLabel(`Threshold`).setStyle("PRIMARY").setCustomID("thresh"),
                    new MessageButton().setDisabled(true).setLabel(`Emoji`).setStyle("PRIMARY").setCustomID("emoj"),
                    new MessageButton().setDisabled(true).setLabel(`Jump`).setStyle("PRIMARY").setCustomID("jump"),
                    new MessageButton().setDisabled(true).setLabel(`NSFW`).setStyle("DANGER").setCustomID("nsfw"),
            );
            const row2 = new MessageActionRow()
                .addComponents(
                    new MessageButton().setDisabled(true).setLabel(`Add Ignored`).setStyle("PRIMARY").setCustomID("aigno"),
                    new MessageButton().setDisabled(true).setLabel(`Remove Ignored`).setStyle("PRIMARY").setCustomID("rigno"),
                    new MessageButton().setDisabled(true).setLabel(`Clear Ignored`).setStyle("DANGER").setCustomID("cigno"),
                )
            await message.channel.send({
                embed: e,
                components: [row1, row2],
            })
        } catch (error) {
            xlg.error(error);
            await client.specials.sendError(message.channel);
            return false;
        }
    }
}
