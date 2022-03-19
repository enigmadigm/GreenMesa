import { Command, GuildMessageProps } from "src/gm";
import moment from 'moment';
import { ordinalSuffixOf, stringToMember } from "../../utils/parsers";
import { permLevels, getPermLevel } from "../../permissions";
import { Collection, Guild, GuildMember, NewsChannel, Permissions, Snowflake, TextChannel, ThreadChannel } from "discord.js";
import { isSnowflake } from "../../utils/specials";

// ●

function getJoinRank(id: string | Snowflake, guild: Guild) {// Call it with the ID of the user and the guild
    if (!isSnowflake(id)) return;
    if (!guild.members.cache.get(id)) return;// It will return undefined if the ID is not valid

    const arr = [...guild.members.cache.values()];// Create an array with every member
    arr.sort((a, b) => (a.joinedTimestamp || 0) - (b.joinedTimestamp || 0));// Sort them by join date

    for (let i = 0; i < arr.length; i++) {// Loop though every element
        if (arr[i].id == id) return i;// When you find the user, return it's position
    }
}

function getPresenceEmoji(target: GuildMember) {
    if (target.presence?.status === 'online') return '<:736903507436896313:752118506950230067>';
    if (target.presence?.status === 'idle') return '<:736903574235250790:752118507164139570>';
    if (target.presence?.status === 'dnd') return '<:736903662617755670:752118507046699079>';
    if (target.presence?.status === 'offline') return '<:736903819509628948:752118507260477460>';
    if (target.presence?.activities.length && target.presence.activities[0].type === 'STREAMING') return '<:736903745245413386:752118507248025641>';
}

export const command: Command<GuildMessageProps> = {
    name: "userinfo",
    description: {
        short: "get info on any member",
        long: "Get detailed information on any provided member."
    },
    aliases: ["ui"],
    cooldown: 3,
    guildOnly: true,
    async execute(client, message, args) {
        try {
            await message.channel.sendTyping();
            const a = args.join(" ");
            const memberFind = await stringToMember(message.guild, a);
            const target = memberFind ?? message.member;
            if (!memberFind && args.length) {
                await client.specials.sendError(message.channel, `That user could not be found`);
                return;
            }
            const rank = await client.database.getXPTop10(message.guild.id, target.id);
            const xp = await client.database.getXP(target);

            let roles = '';
            const roleArray = [...target.roles.cache.values()].sort((a, b) => a.position > b.position ? -1 : 1);
            const roleCount = target.roles.cache.size - 1;
            roleArray.pop();
            for (const role of roleArray.slice(0, 40)) {
                roles += role.toString() + ' ';
            }
            if (roleArray.length > 40) roles += `and ${roleCount - 40} more`;// BEWARE!! I don't think this really works; admittedly, I got this code elsewhere, but I now realize it probably doesn't really respect the character limit
            if (roles.length == 0) {
                roles = 'no roles';
            }

            const joinedAt = moment(target.joinedAt).utc();
            const createdAt = moment(target.user.createdTimestamp).utc();

            // get join rank of member
            let joinRank = `${(getJoinRank(target.id, target.guild) || -1) + 1}`;
            if (joinRank === "1" || joinRank === "0") {
                joinRank = 'oldest member';
            } else {
                joinRank = ordinalSuffixOf(parseInt(joinRank, 10));
            }

            // designator
            const permLev = await getPermLevel(target);
            //const permLevelNames = Object.keys(permLevels);
            //const permLevelName = permLevelNames[permLev];
            const permLevelName = Object.keys(permLevels)[permLev];
            //xlg.log(permLevelName) // this was uncommented for who knows how long for some reason, not looking at past commits

            // invites
            const data = await client.database.getInvites({ guildid: message.guild.id, inviter: target.id });
            const invitesTotal = message.guild.me?.permissions.has(Permissions.FLAGS.MANAGE_GUILD) ? `\`${data.length}\` (total)` : `[unknown](${process.env.DASHBOARD_HOST}/assets/invites_disclaimer.png) ⟵`;

            // last message
            const lastChannel = message.guild.channels.cache.filter((c) => !!(c.isText() && c.messages.cache.find(m => m.author.id === message.author.id))).reduce<Collection<string, NewsChannel | TextChannel | ThreadChannel>>((p, c) => {
                const f = p.first();
                if (f && f.createdAt < c.createdAt) {
                    p.delete(c.id);
                    return p;
                } else {
                    return p;
                }
            }).first();
            const lastMessage = lastChannel?.id ? lastChannel.messages.cache.find(m => m.author.id === message.author.id) : null;
            const lastCreated = lastMessage?.id ? moment(lastMessage.createdAt).utc() : null;

            await message.channel.send({
                embeds: [{
                    color: target.roles.hoist && target.roles.hoist.color != 0x000000 ? target.roles.hoist.color : await client.database.getColor("info"),
                    author: {
                        name: `Info for ${target.user.tag} ${rank && xp ? `${rank.personal ? rank.personal.rank == 1 ? "🥇" : rank.personal.rank == 2 ? "🥈" : rank.personal.rank == 3 ? "🥉" : "" : ''}` : ""}`,
                        icon_url: target.user.displayAvatarURL()
                    },
                    thumbnail: {
                        url: target.user.displayAvatarURL()
                    },
                    description: `${target} ${target.id}`,
                    fields: [
                        {
                            name: "Status",
                            value: `${getPresenceEmoji(target)} ${target.presence?.status || ''}`,
                            inline: true,
                        },
                        {
                            name: 'Join Rank',
                            value: joinRank,
                            inline: true,
                        },
                        {
                            name: 'Nitro Boosting',
                            value: `${target.premiumSince ? `since <t:${moment(target.premiumSince).unix()}:R>` : 'sadly not'}`,
                            inline: true,
                        },
                        {
                            name: 'Joined',
                            value: `<t:${joinedAt.unix()}:R>`,
                            inline: true,
                        },
                        {
                            name: 'Created',
                            value: `<t:${createdAt.unix()}:R>`,
                            inline: true,
                        },
                        {
                            name: "Last Message",
                            value: lastCreated && lastMessage?.id ? `[<t:${lastCreated.unix()}:R>](${lastMessage?.url})` : `Unsure, I haven't seen one recently`,
                            inline: true,
                        },
                        {
                            name: "Designation",
                            value: `${permLevelName}\n[ᵂʰᵃᵗ ⁱˢ ᵗʰⁱˢˀ](https://enigmadigm.com/status/Designation/A%20property%20the%20bot%20gives%20you/It%20is%20used%20when%20checking%20for%20required%20or%20missing%20permissions)`,// How the bot internally sees the member in terms of permissions
                            inline: true,
                        },
                        {
                            name: "XP",
                            value: rank && xp ? `Rank: ${rank.personal ? `\`${rank.personal.rank}\` of \`${rank.total}\`` : '`none`'}\nLevel: \`${xp.level}\`` : "none",
                            inline: true,
                        },
                        {
                            name: "Invites",
                            value: `${invitesTotal}`,
                            inline: true,
                        },
                        {
                            name: `Roles [${roleCount}]`,
                            value: roles,
                        }
                    ],
                    footer: {
                        text: 'All dates in UTC'
                    }
                }],
            });

        } catch (error) {
            xlg.error(error);
            await client.specials.sendError(message.channel);
            return false;
        }
    }
}
