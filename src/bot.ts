/**
 * GreenMesa is the core of the application Stratum, an interactive, text-based "bot"
 * Copyright (C) 2021 Stefan Hauge
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 * 
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
'use strict';

// To all for `import - from '-'` and `export async function function() {}` in modules I must change the eslint sourcetype to module
// and change the package.json tyope to module, then replace all require()s and exports.method/module.exports with the types of
// statements above. mayve one day I could do it because it might look better.

// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config();
// eslint-disable-next-line @typescript-eslint/no-var-requires
require('source-map-support').install();
//require('./website/app');

process.on('uncaughtException', function (e) {
    xlg.log(e);
    process.exit(1);
});
/* https://pm2.keymetrics.io/docs/usage/signals-clean-restart/ while looking at pm2-api docs
process.on('SIGINT', function () {
});*/
// catches unhandled promise rejections
process.on('unhandledRejection', async (reason, promise) => {
    const error = new Error('Unhandled Rejection. Reason: ' + reason);
    console.error(error, "Promise:", promise);
});

import fs from 'fs'; // Get the filesystem library that comes with nodejs
import Discord, { GuildChannel, Intents, MessageEmbedOptions, PermissionString, TextChannel } from "discord.js"; // Load discord.js library
import config from "../auth.json"; // Loading app config file
import { permLevels, getPermLevel } from "./permissions";
import { logMember, logMessageDelete, logMessageBulkDelete, logMessageUpdate, logRole, logChannelState, logChannelUpdate, logEmojiState, logNickname, logRoleUpdate } from './serverlogger';
import MesaWebsite from "./website/app";
import { Command, XClient, XMessage } from "./gm";
import { TimedActionsSubsystem } from "./tactions";
import { PaginationExecutor } from "./utils/pagination";
import Client from "./struct/Client";
import { ban } from "./utils/modactions";
import "./xlogger";
import { combineMessageText, parseLongArgs } from './utils/parsers';

String.prototype.escapeSpecialChars = function () {
    return this.replace(/(?<!\\)\\n/g, "\\n")
        .replace(/(?<!\\)\\'/g, "\\'")
        .replace(/(?<!\\)\\"/g, '\\"')
        .replace(/(?<!\\)\\&/g, "\\&")
        .replace(/(?<!\\)\\r/g, "\\r")
        .replace(/(?<!\\)\\t/g, "\\t")
        .replace(/(?<!\\)\\b/g, "\\b")
        .replace(/(?<!\\)\\f/g, "\\f");
};

String.prototype.escapeDiscord = function () {
    return this.replace(/\*/g, "⁎")
        .replace(/_/g, "˾")
        .replace(/`/g, "'");
};

Number.prototype.between = function (gt, lt, inclusive = false) {
    if (inclusive) {
        return (gt <= this && this <= lt);
    }
    return (gt < this && this < lt);
};

export class Bot {
    static client: XClient;
    static tas: TimedActionsSubsystem;
    // static cm: Contraventions;

    static init(client: XClient, tas: TimedActionsSubsystem): void {
        this.client = client;
        this.tas = tas;
        // this.cm = cm;
    }
}

const client = new Client({
    partials: ["MESSAGE", "CHANNEL", "REACTION"],
    intents: [Object.values(Intents.FLAGS)],
});

// Chalk for "terminal string styling done right," currently not using, just using the built in styling tools https://telepathy.freedesktop.org/doc/telepathy-glib/telepathy-glib-debug-ansi.html
//const chalk = require('chalk');

// ▼▼▼▼▼ command cooldowns section
const cooldowns: Discord.Collection<Command["name"], Discord.Collection<string, number>> = new Discord.Collection();

client.on("ready", async () => {// This event will run if the bot starts, and logs in, successfully.
    const tas = new TimedActionsSubsystem();

    xlg.log(`Bot ${client.user?.tag}(${client.user?.id}) has started, with ${client.users.cache.size} users, in ${client.channels.cache.size} channels of ${client.guilds.cache.size} guilds.`);
    const lo = client.channels.cache.get('661614128204480522');
    if (lo instanceof TextChannel) {
        lo.send(`Started \\🟩 \\🟩`).catch(console.error);
    }
    setInterval(() => {
        const lo = client.channels.cache.get('661614128204480522');
        if (lo instanceof TextChannel) {
            lo.send(`Scheduled Update: ${client.users.cache.size} users, in ${client.channels.cache.size} channels of ${client.guilds.cache.size} guilds.`).catch(xlg.error);
        }
        client.database.updateBotStats(client);
    }, 3600000);

    setInterval(async () => {
        if (!config.longLife || config.longLife < (client.uptime || 0)) config.longLife = client.uptime;
        fs.writeFile("./auth.json", JSON.stringify(config, null, 2), function (err) {
            if (err) return console.log(err);
        });

        const presence = await client.database.getStoredPresence();
        if (!presence.useDefault || Math.floor(Math.random() * 10) <= 8) {
            client.user?.setPresence({
                status: presence.status,
                afk: presence.afk,
                activities: [
                    {
                        name: presence.name,
                        type: presence.type,
                    }
                ],
            });
        } else {
            client.user?.setPresence({
                activities: [
                    {
                        name: 'society crumble',
                        type: 'WATCHING'
                    },
                ],
                status: 'idle',
            });
        }
    }, 20000); // Runs this every 20 seconds. Discord has an update LIMIT OF 15 SECONDS
    // End of this rubbish loop, can insert other settings after

    client.specials.timedMessagesHandler(client);

    try {
        //Generates invite link to put in console.
        const link = await client.generateInvite({ permissions: ["ADMINISTRATOR"] });
        console.log(link);

        // Twitch, I hope
        /*await xtwitch.startTwitchListening();
        await xtwitch.addTwitchWebhook();*/
    } catch (e) {
        xlg.error(e);
    }

    if (client.shard?.ids.includes(0)) {
        new MesaWebsite(client);
    }
    Bot.init(client, tas);
    xlg.log("Bot initialized")
});

client.on("rateLimit", rateLimitInfo => {
    xlg.log('Ratelimited: ' + JSON.stringify(rateLimitInfo));
})

client.on("guildCreate", guild => {// This event triggers when the bot joins a guild.
    xlg.log(`New guild: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members!`);
    const lo = client.channels.cache.get('661614128204480522');
    if (lo instanceof TextChannel) {
        lo.send(`New guild: ${guild.name} (id: ${guild.id}) (members: ${guild.memberCount})`).catch(console.error);
    }
    // client.user.setActivity(`Serving ${client.guilds.size} servers`);
});

client.on("guildDelete", async guild => {// this event triggers when the bot is removed from a guild.
    xlg.log(`Removed from: ${guild.name} (id: ${guild.id})`);
    const lo = client.channels.cache.get('661614128204480522');
    if (lo instanceof TextChannel) {
        lo.send(`Removed from: ${guild.name} (id: ${guild.id})`).catch(console.error);
    }
    // client.user.setActivity(`Serving ${client.guilds.size} servers`);
    const clearRes = await client.database.massClearXP(guild);
    if (!clearRes) xlg.log(`Couldn't clear XP of guild: ${guild.id}`);
});

client.on('guildMemberAdd', async member => {
    try {
        await logMember(member, true);
        const storedBans = await client.database.getGuildSetting(member.guild, "toban");
        if (storedBans) {
            try {
                const bans: string[] = JSON.parse(storedBans.value);
                if (bans.includes(member.id) && member.guild.me) {
                    try {
                        //await member.ban();
                        await ban(client, member, undefined, member.guild.me, `Autoban initiated on join. Triggered because ${member.user.tag} was on the autoban list.`);
                        bans.splice(bans.indexOf(member.id), 1);
                        await client.database.editGuildSetting(member.guild, "toban", JSON.stringify(bans).escapeSpecialChars());
                    } catch (error) {
                        await member.kick().catch((o_O) => o_O);
                    }
                    //await logAutoBan(member);
                    return;
                }
            } catch (error) {
                xlg.error(error);
            }
        }
        await client.invites.logIngress(member);
        await client.services.run(client, "autorole", member);
        await client.services.run(client, "automod_nicenicks", member);
    } catch (error) {
        xlg.error(error);
    }
});

client.on("guildMemberRemove", async member => { //Emitted whenever a member leaves a guild, or is kicked.
    if (!member.partial) {
        /*const clearRes = await client.database.clearXP(member) || 0;
        if (!clearRes) {
            xlg.log(`Couldn't clear XP of member: ${member.id} guild: ${member.guild.id}`);
        }*/
        logMember(member, false);
        client.invites.logEgress(member);
        client.database.updateGuildUserData({
            guildid: member.guild.id,
            userid: member.id,
            roles: JSON.stringify(member.roles.cache.map(r => r.id)).escapeSpecialChars(),
        });
    }
});

client.on("guildMemberUpdate", async (om, nm) => {
    if (!om.partial) {
        logNickname(om, nm);
    }
    client.services.run(client, "automod_nicenicks", nm)
});

client.on('messageDelete', async (message) => {
    if (message.partial) {
        if (message.deleted) {
            return;
        }
        message = await message.fetch();
    }
    logMessageDelete(message);
});

client.on('messageDeleteBulk', messageCollection => {
    logMessageBulkDelete(messageCollection);
});

client.on('messageUpdate', (omessage, nmessage) => {
    if (!omessage.partial && !nmessage.partial) {
        logMessageUpdate(omessage, nmessage);
        client.services.runAllTextAutomod(client, nmessage);
    }
});

client.on('roleCreate', nrole => {
    logRole(nrole);
});

client.on('roleDelete', orole => {
    logRole(orole, true);
});

client.on("roleUpdate", (previousRole, currentRole) => {
    logRoleUpdate(previousRole, currentRole);
})

client.on('channelCreate', nchannel => {
    if (nchannel instanceof GuildChannel) {
        logChannelState(nchannel);
    }
});

client.on('channelDelete', ochannel => {
    if (ochannel instanceof GuildChannel) {
        logChannelState(ochannel, true);
    }
});

client.on('channelUpdate', (ochannel, nchannel) => {
    if (ochannel instanceof GuildChannel && nchannel instanceof GuildChannel) {
        logChannelUpdate(ochannel, nchannel);
    }
});

client.on('emojiCreate', nemoji => {
    if (!nemoji.guild) return;
    logEmojiState(nemoji)
});

client.on('emojiDelete', oemoji => {
    if (!oemoji.guild) return;
    logEmojiState(oemoji, true);
});

client.on("messageReactionAdd", async (reaction, user) => {
    if (user.partial) {
        try {
            user = await user.fetch();
        } catch (error) {
            xlg.error("error filling in user reaction partial: ", error);
            return;
        }
    }
    if (reaction.partial) {
        try {
            reaction = await reaction.fetch();
        } catch (error) {
            xlg.error("error filling in reaction partial: ", error);
            return;
        }
    }
    PaginationExecutor.paginate(reaction, user);
})

client.on("messageReactionRemove", async (reaction, user) => {
    if (user.partial) {
        try {
            user = await user.fetch();
        } catch (error) {
            xlg.error("error filling in user reaction partial: ", error);
            return;
        }
    }
    if (reaction.partial) {
        try {
            reaction = await reaction.fetch();
        } catch (error) {
            xlg.error("error filling in reaction partial: ", error);
            return;
        }
    }
    PaginationExecutor.paginate(reaction, user);
});

// the actual command processing
client.on("message", async (message: XMessage) => {// This event will run on every single message received, from any channel or DM.
    try {
        // if (message.partial) {
        //     message = await <Promise<XMessage>>message.fetch();
        // }

        client.database.logMsgReceive();// log reception of message event

        client.services.runAll(client, message);// run all passive command services

        if (message.author.bot || message.system) return;
        if (!client.user) return;

        // let dm = false; // checks if it's from a dm
        // if (!(message.channel instanceof GuildChannel))
        //     dm = true;

        const now = Date.now();

        let special_prefix;
        if (message.channel instanceof GuildChannel) {
            const gpr = await client.database.getPrefix(message.guild?.id);
            if (gpr) {
                special_prefix = gpr;
            } else {
                const gsr = await client.database.getGlobalSetting('global_prefix');
                if (gsr) special_prefix = gsr.value;
            }
        } else {
            const gsr = await client.database.getGlobalSetting('global_prefix');
            if (gsr) special_prefix = gsr.value;
        }
        message.gprefix = special_prefix || "";

        const ct = combineMessageText(message);// all of the text in the message put together (no delimeter, raw text);

        const clientMentionBase = `(<@!?${client.user.id}>)`;
        if (message.mentions && message.mentions.has(client.user)) {
            if (new RegExp(`^${clientMentionBase}$`, "g").test(ct)) {
                if (message.channel instanceof GuildChannel) {
                    if (message.channel.permissionsFor(client.user)?.has("EMBED_LINKS")) {
                        await message.channel.send({
                            embed: {
                                description: `${message.guild?.me?.nickname || client.user.username}'s prefix for **${message.guild?.name}** is **${message.gprefix.escapeDiscord()}**`,
                                color: await client.database.getColor("info")
                            }
                        });
                    } else {
                        await message.channel.send(`Use \`${message.gprefix.escapeDiscord()}\` or ${client.user} as my prefix.\nBy the way, it seems I cannot send embeds in this channel, that may break some features.`);
                    }
                } else {
                    await message.channel.send(`My prefix is **${message.gprefix.escapeDiscord()}** here`);
                }
                return;
            }
        }
        // console.log("before", ct)
        let prefixUsed = message.gprefix;
        if (ct.toLowerCase().indexOf(message.gprefix) !== 0) {// check for prefix
            const mentionTest = new RegExp(`^${clientMentionBase}`, "g").exec(ct);
            // console.log("text", mentionTest)
            if (!mentionTest || !mentionTest[1]) {// check for mention prefix
                return;
            } else {
                prefixUsed = mentionTest[1];
            }
        }

        let args = ct.slice(prefixUsed.length).trim().split(/ +/g);
        const commandName = args.shift()?.toLowerCase() || "";

        const command = client.commands.get(commandName || "")
            || client.commands.find(cmd => !!(cmd.aliases && cmd.aliases.includes(commandName)));

        if (!command || !command.name) return; //Stops processing if command doesn't exist, this isn't earlier because there are exceptions
        const cc = message.guild ? await client.database.getCommands(message.guild.id, undefined, false) : false;
        const cs = cc && message.guild ? await client.database.getCommand(message.guild.id, command.name, cc) : false;
        const gc = cc && message.guild ? cc.conf : false;
        const disabled = cs ? !!(!cs.enabled || (!cs.channel_mode && cs.channels.includes(message.channel.id)) || (cs.channel_mode && !cs.channels.includes(message.channel.id)) || (message.member && ((cs.role_mode && !message.member.roles.cache.find(x => cs.roles.includes(x.id))) || (!cs.role_mode && message.member.roles.cache.find(x => cs.roles.includes(x.id)))))) : false;

        if (command.guildOnly && !(message.channel instanceof GuildChannel)) {// command is configured to only execute outside of dms
            message.channel.send(`That is not a DM executable command.`);
            return;
        }
        if (command.ownerOnly && message.author.id !== config.ownerID) {// command is configured to be owner executable only, THIS IS AN OUTDATED PROPERTY BUT IS STILL USED
            xlg.log(`${message.author.tag} attempted ownerOnly`);
            return;
        }

        let permLevel = permLevels.member;
        const bmr = await client.database.getGlobalSetting("botmasters").catch(xlg.error);
        let botmasters: string[];
        if (bmr) {
            botmasters = bmr.value.split(',');
        } else {
            botmasters = [];
        }
        if (message.channel instanceof GuildChannel) { // gets perm level of member if message isn't from dms
            permLevel = await getPermLevel(message.member || message.author);
        } else if (botmasters.includes(message.author.id)) { // bot masters
            permLevel = permLevels.botMaster;
        }
        const pl = cs ? cs.level || permLevels.member : command.permLevel || permLevels.member;// get the required permission level needed to run the command

        if (permLevel < pl) {// check if the user has the permissions needed to run the command
            const accessMessage = await client.database.getGuildSetting(message.guild || "", "access_message");
            if (accessMessage && accessMessage.value === "enabled") {
                await message.channel.send("You lack the permissions required to use this command");
            }
            return;
        }

        const commandEnabledGlobal = await client.database.getGlobalSetting(`${command.name}_enabled`);
        const disabledGlobal = (commandEnabledGlobal && commandEnabledGlobal.value !== 'true');
        if (disabledGlobal || disabled) {
            if (command.name === "h") return;
            if (!gc || (typeof gc.respond === "undefined" || gc.respond)) {
                await message.channel.send({
                    embed: {
                        title: `Command Disabled`,
                        description: `\`${commandName}\` has been disabled ${!disabled ? "**globally**" : "here"}.${commandEnabledGlobal && commandEnabledGlobal.value !== 'true' ? `\n\n**Message:** ${commandEnabledGlobal.value.replace(/_/g, " ")}` : ""}`,
                        footer: {
                            text: `${disabledGlobal ? "Sorry, please be patient" : ""}`,
                        },
                    }
                });
            }
            return;
        }

        if (command.moderation && message.guild) {
            const moderationEnabled = await client.database.getGuildSetting(message.guild, 'all_moderation');
            if (!moderationEnabled || moderationEnabled.value === 'disabled') {
                client.specials.sendModerationDisabled(message.channel);
                return;
            }
        }

        if (!cooldowns.has(command.name)) {
            cooldowns.set(command.name, new Discord.Collection());
        }

        const timestamps = cooldowns.get(command.name);
        const cd = (cs ? typeof cs.cooldown === "number" ? cs.cooldown : command.cooldown || 0 : command.cooldown || 0) * 1000;

        if (timestamps) {
            if (timestamps.has(message.author.id)) {
                const usertimestamp = timestamps.get(message.author.id);
                if (usertimestamp) {
                    const expirationTime = usertimestamp + cd;

                    if (now < expirationTime) {
                        const timeLeft = (expirationTime - now) / 1000;
                        message.reply(`please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.name}\` command.`)
                        return;
                    }
                }
            }
            timestamps.set(message.author.id, now);
            setTimeout(() => timestamps.delete(message.author.id), cd);
        }

        if (command.permissions && command.permissions.length) {
            const lacking: PermissionString[] = [];
            for (const perm of command.permissions.concat(!command.permissions.includes("EMBED_LINKS") ? ["EMBED_LINKS"] : [])) {// check if a needed permission is not met, injects the embed_links perm if it isn't already specified
                if (!message.guild?.me?.permissions.has(perm) ||
                    (message.channel instanceof GuildChannel && !message.channel.permissionsFor(message.guild?.me || "")?.has(perm))) {
                    lacking.push(perm);
                }
            }
            if (lacking.length) {
                if (message.guild?.me?.permissionsIn(message.channel).has("SEND_MESSAGES")) {
                    await message.channel.send(`I don't have the permissions needed to execute this command. I am missing: ${lacking.map(x => `**${x.toLowerCase().replace(/_/g, " ")}**`).join(", ")}.`);
                } else {
                    await message.author.send(`I don't have the permissions needed to execute this command. I am missing: ${lacking.map(x => `**${x.toLowerCase().replace(/_/g, " ")}**`).join(", ")}.`);
                }
                return;
            }
        }

        if (command.args && (typeof command.args === "boolean" || command.args > 0) && (!args.length || (typeof command.args === "number" && args.length < command.args))) {// if arguments are required but not provided, SHOULD ADD SPECIFIC ARGUMENT COUNT PROPERTY
            const fec_gs = await client.database.getColor("fail");

            let reply = `Arguments are needed to make that work!`;
            if (command.usage) {
                reply += `\n**Usage:**\n\`${message.gprefix}${command.name} ${command.usage}\``;
            }
            if (command.examples && command.examples.length) {
                reply += `\n**Example${command.examples.length > 1 ? "s" : ""}:**`;
                for (const example of command.examples) {
                    reply += `\n\`${message.gprefix} ${command.aliases && command.aliases.length ? command.aliases[0] : command.name} ${example}\``;
                }
            }

            await message.channel.send({
                embed: {
                    description: reply,
                    color: fec_gs,
                    footer: {
                        text: ['tip: separate arguments with spaces', 'tip: [] means optional, <> means required\nreplace these with your arguments'][Math.floor(Math.random() * 2)]
                    }
                }
            });
            return;
        } else if ((command.args || command.args === 0) && typeof command.args === "number" && args.length !== command.args) {
            let reply: string;
            if (command.args === 0) {
                reply = "**No arguments** are allowed for this command.";
            } else {
                reply = `Incorrect arguments. Please provide ${command.args} arguments.`;
            }
            if (command.usage) {
                reply += `\n**Usage:**\n\`${message.gprefix}${command.name} ${command.usage}\``;
            }

            await client.specials.sendError(message.channel, reply)
            return;
        }

        const flags = parseLongArgs(args);// get the flags from the beginning of the message, if they are provided
        if (flags.taken.length) {
            const queriedFlags = command.flags ? command.flags.length ? !command.flags.map(x => x.f).includes("help") ? ["help", ...command.flags.map(x => x.f)] : command.flags.map(x => x.f) : null : ["help"];/* if the flags property is specified, it will be used to figure out what flags will be accepted
             * if it is an empty array, all flags will be accepted
             * if it is not defined, no flags will be accepted and they will remain in the arguments array
             * if certain flags are specified in the definition array, only those flags will be allowed in the arguments
            */

            // const queriedFlags = command.acceptFlags ? Array.isArray(command.acceptFlags) ? !command.acceptFlags.includes("help") ? ["help", ...command.acceptFlags] : command.acceptFlags : null : ["help"];
            if (queriedFlags) {// if there is a list of accepted flags
                const notActuallyTaken = flags.flags.map((x, i) => !queriedFlags.includes(x.name) ? i : -1);// a list of provided flags that are not accepted
                for (const nat of notActuallyTaken) {// begin the process of adding the flags back into the arguments
                    if (nat > -1) {
                        flags.taken.splice(nat, 1);
                    }
                }
                flags.flags = flags.flags.filter(x => queriedFlags.includes(x.name));
            }
            const remainingArgs = args.join(" ").slice(flags.taken.join(" ").length).trim();// trim the provided argument flag array to disclude the parsed flags
            args = remainingArgs.length ? remainingArgs.split(" ") : [];
            // below flag conditions are checked (just isNumber as of now)
            if (command.flags) {// if there are flag defintions
                try {
                    for (const f of flags.flags) {// iterate through provided flags
                        const flagDef = command.flags.find(x => x.f);
                        if (flagDef) {
                            if (flagDef.isNumber && !/^[0-9]+(?:\.[0-9]+)?$/.test(f.value)) {
                                throw `You must provide a number value to the flag \`${flagDef.f}\`.`;
                            }
                        }
                    }
                } catch (error) {
                    if (typeof error === "string") {
                        await client.specials.sendError(message.channel, error);
                        return;
                    }
                    throw error;
                }
            }
        }

        if (flags.flags.find(x => x.name === "help")) {// if the help flag has been specified
            if (flags.flags.length === 1 && !args.length) {// if it was the only flag and there are no standard arguments
                const helpCommand = client.commands.find(x => x.name === "help");
                if (helpCommand) {
                    await helpCommand.execute(client, message, [command.name], flags.flags);
                    return;
                }
            } else {
                args.unshift("--help");
            }
        }

        try {
            client.database.logCmdUsage(commandName, message);
            const ret = await command.execute(client, message, args, flags.flags);

            if (ret && ret !== true) {
                if (ret.error) {
                    client.specials.sendError(message.channel, ret.content);
                } else {
                    if (ret.embedded) {
                        const embed: MessageEmbedOptions = {
                            color: ret.color || await client.database.getColor("info"),
                            description: ret.content,
                        }
                        await message.channel.send({ embed });
                    } else {
                        await message.channel.send(ret.content);
                    }
                }
            }
        } catch (error) {
            xlg.error(error);
            client.specials.sendError(message.channel, `Something went wrong. ¯\\_(ツ)_/¯\n[Report](https://github.com/enigmadigm/GreenMesa/issues/new/)`);
        }
    } catch (err) {
        xlg.error(err);
        if (message.client.user && !(message.channel instanceof GuildChannel && (!message.channel.permissionsFor(message.client.user)?.has("SEND_MESSAGES") || !message.channel.permissionsFor(message.client.user)?.has("EMBED_LINKS")))) {
            client.specials.sendError(message.channel, "Error while processing.\n[Report](https://github.com/enigmadigm/GreenMesa/issues/new/)");
        }
    }
});

client.on('error', xlg.error);

client.login(config.token);
