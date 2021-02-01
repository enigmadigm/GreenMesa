import xlg from "../../xlogger";
import moment from 'moment';
//import { getTop10, getXP, getGlobalSetting } from "../dbmanager";
import { stringToMember } from "../../utils/parsers";
import { permLevels, getPermLevel } from "../../permissions";
import { Command } from "src/gm";
import { Guild, GuildMember } from "discord.js";

function getJoinRank(ID: string, guild: Guild) {// Call it with the ID of the user and the guild
    if (!guild.member(ID)) return;// It will return undefined if the ID is not valid

    const arr = guild.members.cache.array();// Create an array with every member
    arr.sort((a, b) => (a.joinedTimestamp || 0) - (b.joinedTimestamp || 0));// Sort them by join date

    for (let i = 0; i < arr.length; i++) {// Loop though every element
        if (arr[i].id == ID) return i;// When you find the user, return it's position
    }
}

function getOrdinalSuffix(i: number) {
    const j = i % 10,
        k = i % 100;
    if (j === 1 && k !== 11) {
        return i + "st";
    }
    if (j === 2 && k !== 12) {
        return i + "nd";
    }
    if (j === 3 && k !== 13) {
        return i + "rd";
    }
    return i + "th";
}

function getPresenceEmoji(target: GuildMember) {
    if (target.user.presence.status === 'online') return '<:736903507436896313:752118506950230067>';
    if (target.user.presence.status === 'idle') return '<:736903574235250790:752118507164139570>';
    if (target.user.presence.status === 'dnd') return '<:736903662617755670:752118507046699079>';
    if (target.user.presence.status === 'offline') return '<:736903819509628948:752118507260477460>';
    if (target.user.presence.activities.length && target.user.presence.activities[0].type === 'STREAMING') return '<:736903745245413386:752118507248025641>';
}

export const command: Command = {
    name: 'userinfo',
    description: 'get info on any member',
    aliases: ['ui', 'user'],
    cooldown: 8,
    async execute(client, message, args) {
        try {
            if (!message.guild || !message.member) return;

            message.channel.startTyping();
            await message.guild.fetch();
            const target = await stringToMember(message.guild, args.join(" ")) || message.member;
            const rank = await client.database?.getTop10(message.guild.id, target.id);
            const xp = await client.database?.getXP(target);
            if (!rank || !xp) {
                client.specials?.sendError(message.channel, "User information could not be retrieved");
                return;
            }

            let roles = '';
            const roleArray = target.roles.cache.array().sort((a, b) => a.position > b.position ? -1 : 1);
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
            if (joinRank === "1") {
                joinRank = 'oldest member';
            } else {
                joinRank = getOrdinalSuffix(parseInt(joinRank, 10)) + ' member joined';
            }

            const permLev = await getPermLevel(target);
            //const permLevelNames = Object.keys(permLevels);
            //const permLevelName = permLevelNames[permLev];
            const permLevelName = Object.keys(permLevels)[permLev];
            //xlg.log(permLevelName) // this was uncommented for who knows how long for some reason, not looking at past commits

            message.channel.send({
                embed: {
                    color: target.roles.hoist ? target.roles.hoist.color : await client.database?.getColor("info_embed_color") || 0,
                    author: {
                        name: `Stats of ${target.user.tag} ${rank.personal ? rank.personal.rank == 1 ? "🥇" : rank.personal.rank == 2 ? "🥈" : rank.personal.rank == 3 ? "🥉" : "" : ''}`,
                        icon_url: target.user.displayAvatarURL()
                    },
                    thumbnail: {
                        url: target.user.displayAvatarURL()
                    },
                    description: `${target}`,
                    fields: [
                        {
                            "name": "Status",
                            "value": `${getPresenceEmoji(target)} ${target.user.presence.status || ''}`,
                            "inline": true
                        },
                        {
                            name: 'Join Rank',
                            value: joinRank,
                            inline: true
                        },
                        {
                            name: 'Nitro Boosting',
                            value: `${target.premiumSince ? `since ${moment(target.premiumSince).format('ddd M/D/Y HH:mm:ss')}` : 'no'}`,
                            inline: true
                        },
                        {
                            name: 'Joined',
                            value: `${joinedAt.format('ddd M/D/Y HH:mm:ss')}\n(${joinedAt.fromNow()})`,
                            inline: true
                        },
                        {
                            name: 'Created',
                            value: `${createdAt.format('ddd M/D/Y HH:mm:ss')}\n(${createdAt.fromNow()})`,
                            inline: true
                        },
                        {
                            name: 'Designation',
                            value: `${permLevelName}\n[What is this?](https://stratum.hauge.rocks)`,// How the bot internally sees the member in terms of permissions
                            inline: true
                        },
                        {
                            name: 'XP',
                            value: `Rank: ${rank.personal ? rank.personal.rank : 'none'}\nLevel: ${xp ? xp.level : 'none'}`,
                            inline: true
                        },
                        {
                            "name": `Roles [${roleCount}]`,
                            "value": roles
                        }
                    ],
                    footer: {
                        text: 'All dates in UTC'
                    }
                }
            });

            message.channel.stopTyping();
        } catch (error) {
            xlg.error(error);
            message.channel.stopTyping(true);
            await client.specials?.sendError(message.channel);
            return false;
        }
    }
}

