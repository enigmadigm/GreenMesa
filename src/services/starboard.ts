import { GuildChannel, Message, MessageEmbedOptions, MessageReaction, Permissions, ThreadChannel, User } from "discord.js";
import { GuildMessageProps, MessageService } from "../gm";
import Starboard from "../struct/Starboard.js";
import { capitalize } from "../utils/parsers.js";
import { isSnowflake } from "../utils/specials.js";

const jumpSynonyms = ["leap", "spring", "bound", "hop", "bounce", "skip", "bob", "dance", "prance", "frolic"];

type skMdat = { content: string, embeds: MessageEmbedOptions[] };
function makeStarpost(starboard: Starboard, msg: Message, nsfw: boolean, count: number): skMdat {
    const e: skMdat = {
        content: `${count} ⭐ in ${msg.channel} for ${msg.author}`,
        embeds: [{
            color: starboard.color ? starboard.color : 0xffd500,
            title: `\\⭐ Starpost`,
            description: `${starboard.jumpLink ? `**[${capitalize(jumpSynonyms[Math.floor(Math.random() * jumpSynonyms.length)])} to message](${msg.url})**\n\n` : ""}`,
            footer: {
                text: `ID: ${msg.id}${nsfw ? " · nsfw" : ""}`,
            }
        }],
    };

    const contentLimited = `${msg.content.slice(0, (2048 - (e.embeds[0].description?.length ?? 0) - 7))}${msg.content.length > (2048 - (e.embeds[0].description?.length ?? 0) - 7) ? "..." : ""}`;
    if (e.embeds[0].description) {
        e.embeds[0].description += contentLimited;
    }

    let imageLink = "";
    if (msg.attachments.size) {
        const firstImage = msg.attachments.find(x => !!(x.height && x.width && x.url));
        if (firstImage) {
            imageLink = firstImage.url;
        }
    }
    if (!imageLink && msg.embeds.length) {
        const firstImage = msg.embeds.find(x => x.image?.url);
        if (firstImage) {
            imageLink = firstImage.image?.url ?? "";
        }
    }
    if (imageLink) {
        e.embeds[0].image = {
            url: imageLink,
        };
    }
    return e;
}

export const service: MessageService = {
    events: ["messageUpdate", "messageReactionAdd", "messageReactionRemove"],
    async execute(client, event, m: (Message & GuildMessageProps) | MessageReaction, user?: User) {
        try {
            if (user?.bot) return;// unnecessary logic, but just to be safe
            // changes to bot-starred messages (like stars on starposts) won't show up changed in their starposts because they won't make it past the check above
            if (event === "messageUpdate" && m instanceof Message && !m.partial) {// if it is an edited message, meaning a starpost could have been updated
                const starPost = await client.database.getStarredMessage(m.id);
                if (starPost && !starPost.locked && starPost.postid) {// if it is actually a post
                    const starboard = await client.database.getStarboardSetting(m.guild.id);// getting the starboard settings
                    if (!starboard.locked && starboard.channel && (!starPost.nsfw || starboard.allowSensitive)) {
                        const starChannel = m.guild.channels.cache.get(starboard.channel);
                        if (starChannel && starChannel.isText() && client.user && starChannel.permissionsFor(client.user)?.has([Permissions.FLAGS.SEND_MESSAGES, Permissions.FLAGS.EMBED_LINKS, Permissions.FLAGS.ATTACH_FILES])) {
                            if (starChannel.id === starPost.postchannel && isSnowflake(starPost.postid)) {
                                const mdat = makeStarpost(starboard, m, !!starPost.nsfw, starPost.stars);
                                const post = await starChannel.messages.fetch(starPost.postid);
                                await post.edit(mdat);// edit the starpost for posterity (to see updated message content)
                            }
                        }
                    }
                }
            } else if ((event === "messageReactionAdd" || event === "messageReactionRemove") && m instanceof MessageReaction && user instanceof User && !m.partial) {
                const msg = m.message;
                if (!msg.partial && !msg.deleted && msg.guild && (msg.channel instanceof GuildChannel || msg.channel instanceof ThreadChannel)) {
                    const starboard = await client.database.getStarboardSetting(msg.guild.id);// getting the starboard settings
                    const reactedUsers = await m.users.fetch();
                    const count = reactedUsers.filter(u => u.id !== client.user?.id).size;// try to get an accurate number of users who reacted with the current emoji
                    if (
                        !starboard.locked &&
                        starboard.channel &&
                        (starboard.allowSelf || msg.author.id !== user.id) &&
                        starboard.emoji.length &&
                        (starboard.emoji.find((e) => {
                            const emojiKey = m.emoji.id ?? m.emoji.name ?? "";
                            const r = "^<(a)?:\\w{1,100}:" + emojiKey + ">$"
                            if (emojiKey === e || e.match(new RegExp(r))) {
                                return true;
                            }
                            return false;
                        })) &&
                        !starboard.ignoredChannels.includes(msg.channel.id)
                    ) {// if the channel isn't locked, the id is present and not an empty string, the threshold is met, and the emoji is the right emoji=
                        const mid = msg.id;
                        const starPost = await client.database.getStarredMessage(mid);
                        const starChannel = msg.guild.channels.cache.get(starboard.channel);
                        const nsfw = !starPost ? msg.channel instanceof ThreadChannel ? !!msg.channel.parent?.nsfw : msg.channel.nsfw : !!starPost.nsfw;
                        if (starboard.allowSensitive || !nsfw) {
                            if (!starPost || !starPost.postid) {// if there is already a starboard entry for this message
                                if (count >= starboard.threshold) {// if the post has the necessary number of reactions
                                    let postid = "";
                                    if (starChannel && starChannel.isText() && client.user && starChannel.permissionsFor(client.user)?.has([Permissions.FLAGS.SEND_MESSAGES, Permissions.FLAGS.EMBED_LINKS, Permissions.FLAGS.ATTACH_FILES])) {
                                        const mdat = makeStarpost(starboard, msg, nsfw, count);
                                        const post = await starChannel.send(mdat);// post a new entry to the starboard channel
                                        if (starboard.starStarred) {
                                            try {
                                                await post.react(starboard.emoji[0]);
                                            } catch (error) {
                                                //
                                            }
                                        }
                                        postid = post.id;
                                    }
                                    await client.database.setStarredMessage({// save new entry no matter what, so it can be retrieved for whatever reason in the future
                                        messageid: msg.id,
                                        authorid: msg.author.id,
                                        channelid: msg.channel.id,
                                        guildid: msg.guild.id,
                                        stars: count,
                                        locked: 0,
                                        nsfw: nsfw ? 1 : 0,
                                        postid,
                                        postchannel: starChannel?.id ?? "",
                                    });
                                }
                            } else {// if an entry may need to be made
                                if (starChannel && starChannel.isText() && client.user && starChannel.permissionsFor(client.user)?.has([Permissions.FLAGS.SEND_MESSAGES, Permissions.FLAGS.EMBED_LINKS, Permissions.FLAGS.ATTACH_FILES])) {// the starboard channel is set and messages can be sent in it
                                    if (starChannel.id === starPost.postchannel && isSnowflake(starPost.postid)/*  && count !== starPost.stars */) {// checks to make sure the postid is valid and that the channel of the post is in the starboard channel, since it may have changed
                                        if (count === 0) {
                                            const post = await starChannel.messages.fetch(starPost.postid).catch(() => {
                                                starPost.postchannel = "";
                                                starPost.postid = "";
                                            });
                                            if (post && post.deletable) {
                                                starPost.postid = "";
                                                starPost.postchannel = "";
                                                await post.delete();
                                            }
                                        } else {
                                            const mdat = makeStarpost(starboard, msg, nsfw, count);
                                            const post = await starChannel.messages.fetch(starPost.postid);
                                            await post.edit(mdat);// edit the starpost for posterity (to see an updated count)
                                        }
                                    } else {// the location of the starpost is in the wrong channel, or the post id was invalid
                                        // the id and channel should be reset so it can be reposted
                                        starPost.postid = "";
                                        starPost.postchannel = "";
                                    }
                                }
                                await client.database.setStarredMessage({// update stored star count
                                    ...starPost,
                                    stars: count,
                                });
                            }
                        }
                    }
                }
            }
        } catch (error) {
            xlg.error(error);
        }
    }
}
