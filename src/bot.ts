'use strict';

// To all for `import - from '-'` and `export async function function() {}` in modules I must change the eslint sourcetype to module
// and change the package.json tyope to module, then replace all require()s and exports.method/module.exports with the types of
// statements above. mayve one day I could do it because it might look better.

// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config();
// eslint-disable-next-line @typescript-eslint/no-var-requires
require('source-map-support').install();
//require('./website/app');

import xlg from "./xlogger";
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

String.prototype.escapeSpecialChars = function () {
    return this.replace(/\\n/g, "\\\\n")
        .replace(/\\'/g, "\\\\'")
        .replace(/\\"/g, '\\\\"')
        .replace(/\\&/g, "\\\\&")
        .replace(/\\r/g, "\\\\r")
        .replace(/\\t/g, "\\\\t")
        .replace(/\\b/g, "\\\\b")
        .replace(/\\f/g, "\\\\f");
};

String.prototype.escapeDiscord = function () {
    return this.replace(/\*/g, "⁎")
        .replace(/_/g, "˾")
        .replace(/`/g, "'");
};

import fs from 'fs'; // Get the filesystem library that comes with nodejs
import Discord, { GuildChannel, PermissionString, TextChannel } from "discord.js"; // Load discord.js library
import config from "../auth.json"; // Loading app config file
//import { updateXP, updateBotStats, getGlobalSetting, getPrefix, clearXP, massClearXP, logCmdUsage, getGuildSetting, logMsgReceive, DBManager } from "./dbmanager";
import { permLevels, getPermLevel } from "./permissions";
import { logMember, logMessageDelete, logMessageBulkDelete, logMessageUpdate, logRole, logChannelState, logChannelUpdate, logEmojiState, logNickname, logAutoBan } from './serverlogger';
import MesaWebsite from "./website/app";
import { Command, XClient, XMessage } from "./gm";
import { TimedActionsSubsystem } from "./tactions";
import { PaginationExecutor } from "./utils/pagination";
import Client from "./struct/Client";

export class Bot {
    static client: XClient;
    static tas: TimedActionsSubsystem;

    static init(client: XClient, tas: TimedActionsSubsystem): void {
        this.client = client;
        this.tas = tas;
    }
}

const client: XClient = new Client({
    partials: ["MESSAGE"],
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

        const game = await client.database.getGlobalSetting('game_name');
        const gamePrefix = await client.database.getGlobalSetting('game_prefix');
        const gameStatus = await client.database.getGlobalSetting('game_status');
        if (game && game.value !== 'default') {
            client.user?.setPresence({
                activity: {
                    name: game.value || 'nothing',
                    type: (gamePrefix && gamePrefix.value && (gamePrefix.value === "WATCHING" || gamePrefix.value === "PLAYING" || gamePrefix.value === "STREAMING" || gamePrefix.value === "LISTENING" || gamePrefix.value === "CUSTOM_STATUS" || gamePrefix.value === "COMPETING")) ? gamePrefix.value : 'WATCHING'
                },
                status: (gameStatus && gameStatus.value && (gameStatus.value === "idle" || gameStatus.value === "online" || gameStatus.value === "dnd" || gameStatus.value === "invisible")) ? gameStatus.value : 'idle'
            }).catch(console.error);
        } else {
            if (Math.floor(Math.random() * 10) <= 8) {
                // Set the bot's presence (activity and status)
                client.user?.setPresence({
                    activity: {
                        name: `${config.prefix} help | ${config.prefix} invite`,
                    },
                    status: 'online'
                })
            } else {
                client.user?.setPresence({
                    activity: {
                        name: 'society crumble',
                        type: 'WATCHING'
                    },
                    status: 'idle'
                })
            }
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
                if (bans.includes(member.id)) {
                    try {
                        await member.ban();
                        bans.splice(bans.indexOf(member.id), 1);
                        await client.database.editGuildSetting(member.guild, "toban", JSON.stringify(bans).escapeSpecialChars());
                    } catch (error) {
                        await member.kick().catch((o_O) => o_O);
                    }
                    await logAutoBan(member);
                    return;
                }
            } catch (error) {
                xlg.error(error);
            }
        }
        client.services?.run(client, "automod_nicenicks", member);
        client.services?.run(client, "autorole", member);
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
    }
});

client.on("guildMemberUpdate", async (om, nm) => {
    if (!om.partial && !nm.partial) {
        logNickname(om, nm);
    }
    client.services?.run(client, "automod_nicenicks", nm)
});

client.on('messageDelete', message => {
    if (!message.partial) {
        logMessageDelete(message);
    }
});

client.on('messageDeleteBulk', messageCollection => {
    logMessageBulkDelete(messageCollection);
});

client.on('messageUpdate', (omessage, nmessage) => {
    if (!omessage.partial && !nmessage.partial) {
        logMessageUpdate(omessage, nmessage);
        client.services?.runAllAutomod(client, nmessage);
    }
});

client.on('roleCreate', nrole => {
    logRole(nrole);
});

client.on('roleDelete', orole => {
    logRole(orole, true);
});

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
        user = await user.fetch();
    }
    PaginationExecutor.paginate(reaction, user);
})

// the actual command processing
client.on("message", async (message: XMessage) => {// This event will run on every single message received, from any channel or DM.
    try {
        client.database.logMsgReceive();// log reception of message event

        client.services?.runAll(client, message);// run all passive command services

        if (message.author.bot || message.system) return;
        if (!client.user || !client.commands || !client.categories) return;
    
        let dm = false; // checks if it's from a dm
        if (!message.guild)
            dm = true;
    
        const now = Date.now();
        
        let special_prefix;
        if (!dm) {
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
    
        if (message.mentions && message.mentions.has(client.user)) {
            if (message.content == '<@' + client.user.id + '>' || message.content == '<@!' + client.user.id + '>') {
                const iec_gs = await client.database.getColor("info");
                message.channel.send({
                    embed: {
                        "description": `${message.guild?.me?.nickname || client.user.username}'s prefix for **${message.guild?.name}** is **${message.gprefix}**`,
                        "color": iec_gs
                    }
                })
                return;
            }
        }

        // Also good practice to ignore any message that does not start with our prefix,
        // which is set in the configuration file.
        if (message.content.toLowerCase().indexOf(message.gprefix) !== 0) return;
        // ▼▼▼▼▼ deprecated with the guild only command handler filter
        //if (message.channel.type === "dm") return;

        const args = message.content.slice(message.gprefix.length).trim().split(/ +/g);
        const commandName = args.shift()?.toLowerCase() || "";

        let permLevel = permLevels.member;
        const bmr = await client.database.getGlobalSetting("botmasters").catch(xlg.error);
        let botmasters: string[];
        if (bmr) {
            botmasters = bmr.value.split(',');
        } else {
            botmasters = [];
        }
        if (!dm) { // gets perm level of member if message isn't from dms
            permLevel = await getPermLevel(message.member || message.author);
        } else if (botmasters.includes(message.author.id)) { // bot masters
            permLevel = permLevels.botMaster;
        }

        const command = client.commands.get(commandName || "")
            || client.commands.find(cmd => !!(cmd.aliases && cmd.aliases.includes(commandName)));

        if (!command || !command.name) return; //Stops processing if command doesn't exist, this isn't earlier because there are exceptions
    
        if (command.guildOnly && dm) {// command is configured to only execute outside of dms
            message.channel.send(`That is not a DM executable command.`);
            return;
        }
        if (command.ownerOnly && message.author.id !== config.ownerID) {// command is configured to be owner executable only, THIS IS AN OUTDATED PROPERTY BUT IS STILL USED
            xlg.log(`${message.author.tag} attempted ownerOnly`);
            return;
        }
        if (command.permLevel && permLevel < command.permLevel) {// insufficient bot permissions
            // TODO: add admin option to make it notify users that they don't have permissions
            const accessMessage = await client.database.getGuildSetting(message.guild || "", "access_message");
            if (accessMessage && accessMessage.value === "enabled") {
                message.channel.send("You lack the permissions required to use this command.")
            }
            return;
        }

        const commandEnabledGlobal = await client.database.getGlobalSetting(`${command.name}_enabled`);
        const commandEnabledGuild = message.guild ? await client.database.getGuildSetting(message.guild, `${command.name}_toggle`) : false;
        const commandDisabled = (commandEnabledGlobal && commandEnabledGlobal.value !== 'true') || (commandEnabledGuild && commandEnabledGuild.value !== 'enable');
        if (commandDisabled) {
            if (command.name === "h") return;
            message.channel.send({
                embed: {
                    title: `Command Disabled`,
                    description: `\`${commandName}\` has been disabled ${(commandEnabledGlobal && commandEnabledGlobal.value !== 'true') ? "**globally**" : "**in this server**"}.${commandEnabledGlobal && commandEnabledGlobal.value !== 'true' ? `\n\n**Message:** ${commandEnabledGlobal.value.replace(/_/g, " ")}` : ""}`,
                    footer: {
                        text: `${(commandEnabledGlobal && commandEnabledGlobal.value === 'false') ? 'Sorry, please be patient' : 'Admins may re-enable it'}`
                    }
                }
            });
            return;
        } else if (command.category) {
            const groupGlobal = await client.database.getGlobalSetting(`${command.category}_enabled`);
            const groupGuild = message.guild ? await client.database.getGuildSetting(message.guild, `${command.category}_toggle`) : false;
            const groupDisabled = (groupGlobal && groupGlobal.value == 'false') || (groupGuild && groupGuild.value === 'disable');
            if (groupDisabled) {
                message.channel.send({
                    embed: {
                        title: `Category Disabled`,
                        description: `Command group \`${command.category}\` has been disabled ${(groupGlobal && groupGlobal.value == 'false') ? "**globally**" : "**in this server**"}.`,
                        footer: {
                            text: `${(groupGlobal && groupGlobal.value == 'false') ? 'Sorry, please be patient' : 'Admins may re-enable it'}`
                        }
                    }
                });
                return;
            }
        }

        if (command.moderation && message.guild) {
            const moderationEnabled = await client.database.getGuildSetting(message.guild, 'all_moderation');
            if (!moderationEnabled || moderationEnabled.value === 'disabled') {
                return client.specials.sendModerationDisabled(message.channel);
            }
        }

        if (command.args && (typeof command.args === "boolean" || command.args > 0) && !args.length) {// if arguments are required but not provided, SHOULD ADD SPECIFIC ARGUMENT COUNT PROPERTY
            const fec_gs = await client.database.getColor("fail");

            let reply = `Arguments are needed to make that work!`;
            if (command.usage) {
                reply += `\n**Usage:**\n\`${message.gprefix}${command.name} ${command.usage}\``;
            }
            if (command.examples && command.examples.length) {
                reply += `\n**Example${command.examples.length > 1 ? "s" : ""}:**`;
                for (const example of command.examples) {
                    reply += `\n\`${example}\``;
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
            let reply = "Illegal Arguments";
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

        if (!cooldowns.has(command.name)) {
            cooldowns.set(command.name, new Discord.Collection());
        }

        const timestamps = cooldowns.get(command.name);
        const cooldownAmount = (command.cooldown || 0) * 1000;

        if (timestamps) {
            if (timestamps.has(message.author.id)) {
                const usertimestamp = timestamps.get(message.author.id);
                if (usertimestamp) {
                    const expirationTime = usertimestamp + cooldownAmount;
            
                    if (now < expirationTime) {
                        const timeLeft = (expirationTime - now) / 1000;
                        return message.reply(`please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.name}\` command.`)
                    }
                }
            }
            timestamps.set(message.author.id, now);
            setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
        }

        if (command.permissions && command.permissions.length) {
            const lacking: PermissionString[] = [];
            for (const perm of command.permissions) {
                if (!message.guild?.me?.hasPermission(perm)) {
                    lacking.push(perm);
                }
            }
            if (lacking.length) {
                if (message.guild?.me?.permissionsIn(message.channel).has("SEND_MESSAGES")) {
                    await message.channel.send(`I don't have the permissions needed to execute this command. I am missing: ${lacking.map(x => `**${x.toLowerCase().replace(/_/g, " ")}**`).join(", ")}.`);
                }
                return;
            }
        }

        try {
            command.execute(client, message, args);
            
            // adding one to the number of commands executed in auth.json every time command executed, commands that execute inside each other do not feature this
            /*if (config.commandsExecutedCount) config.commandsExecutedCount += 1;
            if (!config.commandsExecutedCount) config.commandsExecutedCount = 1;
            fs.writeFile("./auth.json", JSON.stringify(config, null, 2), function (err) {
                if (err) return console.log(err);
            });*/

            if (config.msgLogging) {
                const logChannel = client.channels.cache.get('661614128204480522');
                if (logChannel && logChannel instanceof TextChannel) {
                    logChannel.send(`${message.author.tag.escapeDiscord()} sent command \`${command.name}\` at \`${message.id}\` in \`${message.channel.id}\` ${message.url}`).catch(console.error);
                }
            }

            client.database.logCmdUsage(commandName);
        } catch (error) {
            xlg.error(error);
            client.specials.sendError(message.channel, 'Error while executing! If this occurs again, please create an issue for this bug on my [GitHub](https://github.com/enigmadigm/GreenMesa/issues).');
        }
    } catch (err) {
        client.specials.sendError(message.channel, "Error while processing. If this occurs again, please create an issue for this bug on my [GitHub](https://github.com/enigmadigm/GreenMesa/issues).")
    }
});

client.on('error', xlg.error);

client.login(config.token);
