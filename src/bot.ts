'use strict';

// To all for `import - from '-'` and `export async function function() {}` in modules I must change the eslint sourcetype to module
// and change the package.json tyope to module, then replace all require()s and exports.method/module.exports with the types of
// statements above. mayve one day I could do it because it might look better.

// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config();
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

class Bot {
	public client: any;
	public website: any;

    static init(client, website) {
        if (!(client instanceof Discord.Client) || !(website instanceof MesaWebsite)) return;
        this.client = client;
        this.website = website;
    }
}

import fs from 'fs'; // Get the filesystem library that comes with nodejs
import Discord, { TextChannel } from "discord.js"; // Load discord.js library
import config from "../auth.json"; // Loading app config file
const client: XClient = new Discord.Client();
//import { updateXP, updateBotStats, getGlobalSetting, getPrefix, clearXP, massClearXP, logCmdUsage, getGuildSetting, logMsgReceive, DBManager } from "./dbmanager";
import { permLevels, getPermLevel } from "./permissions";
import { logMember, logMessageDelete, logMessageBulkDelete, logMessageUpdate, logRole, logChannelState, logChannelUpdate, logEmojiState } from './serverlogger';
import ar from "./utils/arhandler";
import MesaWebsite from "./website/app";
import Commands from './commands';
import { XClient, XMessage } from "./gm";
client.specials = require("./utils/specials") || {};

// Chalk for "terminal string styling done right," currently not using, just using the built in styling tools https://telepathy.freedesktop.org/doc/telepathy-glib/telepathy-glib-debug-ansi.html
//const chalk = require('chalk');

// The Discord.js *client*
const co = new Commands();
client.commands = co.commands;
client.categories = co.categories;

// ▼▼▼▼▼ command cooldowns section
const cooldowns = new Discord.Collection();
const xpcooldowns = new Discord.Collection();

client.on("ready", async () => {// This event will run if the bot starts, and logs in, successfully.
    // Stats updates in logs and database
    client.db = await new DBManager().handleDisconnect();
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
        updateBotStats(client);
    }, 3600000);

    setInterval(async () => {
        if (!config.longLife || config.longLife < (client.uptime || 0)) config.longLife = client.uptime;
        fs.writeFile("./auth.json", JSON.stringify(config, null, 2), function (err) {
            if (err) return console.log(err);
        });

        const game = await getGlobalSetting('game_name');
        const gamePrefix = await getGlobalSetting('game_prefix');
        const gameStatus = await getGlobalSetting('game_status');
        if (game[0] && game[0].value !== 'default') {
            client.user?.setPresence({
                activity: {
                    name: game[0].value || 'nothing',
                    type: (gamePrefix[0] && gamePrefix[0].value) ? gamePrefix[0].value : 'WATCHING'
                },
                status: (gameStatus[0] && gameStatus[0].value) ? gameStatus[0].value : 'idle'
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

    await client.specials.timedMessagesHandler(client);

    try {
        //Generates invite link to put in console.
        const link = await client.generateInvite({ permissions: ["ADMINISTRATOR"] });
        console.log(link);

        // Twitch, I hope
        /*await xtwitch.startTwitchListening();
        await xtwitch.addTwitchWebhook();*/
        new MesaWebsite(client);
    } catch (e) {
        xlg.error(e);
    }
    
    //Bot.init(client, );
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
    const clearRes = await massClearXP(guild);
    if (!clearRes) xlg.log(`Couldn't clear XP of guild: ${guild.id}`);
});

client.on('guildMemberAdd', async member => {
    logMember(member, true);
    ar.potatoRoler(member);
});

client.on("guildMemberRemove", async member => { //Emitted whenever a member leaves a guild, or is kicked.
    const clearRes = await clearXP(member);
    if (!clearRes) xlg.log(`Couldn't clear XP of member: ${member.id} guild: ${member.guild.id}`);
    logMember(member, false);
});

client.on('messageDelete', message => {
    logMessageDelete(message);
});

client.on('messageDeleteBulk', messageCollection => {
    logMessageBulkDelete(messageCollection);
});

client.on('messageUpdate', (omessage, nmessage) => {
    logMessageUpdate(omessage, nmessage);
});

client.on('roleCreate', nrole => {
    logRole(nrole);
});

client.on('roleDelete', orole => {
    logRole(orole, true);
});

client.on('channelCreate', nchannel => {
    logChannelState(nchannel);
});

client.on('channelDelete', ochannel => {
    logChannelState(ochannel, true);
});

client.on('channelUpdate', (ochannel, nchannel) => {
    logChannelUpdate(ochannel, nchannel);
});

client.on('emojiCreate', nemoji => {
    if (!nemoji.guild) return;
    logEmojiState(nemoji)
});

client.on('emojiDelete', oemoji => {
    if (!oemoji.guild) return;
    logEmojiState(oemoji, true);
});

// the actual command processing
client.on("message", async (message: XMessage) => {// This event will run on every single message received, from any channel or DM.
    try {
        logMsgReceive();
    
        if (message.author.bot || message.system) return;
        if (!message.guild || !client.user || !client.commands || !client.categories) return;
    
        let dm = false; // checks if it's from a dm
        if (!message.guild)
            dm = true;
    
        const now = Date.now();
        if (!dm) {
            if (!xpcooldowns.has(message.author.id)) {
                updateXP(message);
                xpcooldowns.set(message.author.id, now);
                setTimeout(() => xpcooldowns.delete(message.author.id), 60000);
            }
        }
        
        let special_prefix;
        if (!dm) {
            special_prefix = await getPrefix(message.guild.id)
        } else {
            special_prefix = (await getGlobalSetting('global_prefix'))[0].value;
        }
        message.gprefix = special_prefix || config.prefix || "";
    
        if (message.mentions && message.mentions.has(client.user)) {
            if (message.content == '<@' + client.user.id + '>' || message.content == '<@!' + client.user.id + '>') {
                const iec_gs = await getGlobalSetting("info_embed_color");
                const info_embed_color = parseInt(iec_gs[0].value);
                message.channel.send({
                    embed: {
                        "description": `${message.guild.me?.nickname || client.user?.username}'s prefix for **${message.guild.name}** is **${message.gprefix}**`,
                        "color": info_embed_color
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
        const commandName = args.shift().toLowerCase()
    
        let permLevel = permLevels.member;
        let botmasters = await getGlobalSetting("botmasters").catch(xlg.error);
        botmasters = botmasters[0].value.split(',');
        if (!dm) { // gets perm level of member if message isn't from dms
            permLevel = await getPermLevel(message.member);
        } else if (botmasters.includes(message.author.id)) { // bot masters
            permLevel = permLevels.botMaster;
        }
        
        const command = client.commands.get(commandName)
            || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
    
        if (!command || !command.name) return; //Stops processing if command doesn't exist, this isn't earlier because there are exceptions
    
        if (command.guildOnly && dm) {// command is configured to only execute outside of dms
            return message.channel.send('I can\'t execute that command inside DMs!');
        }
        if (command.ownerOnly && message.author.id !== config.ownerID) {// command is configured to be owner executable only, THIS IS AN OUTDATED PROPERTY BUT IS STILL USED
            xlg.log(`${message.author.tag} attempted ownerOnly`);
            return;
        }
        if (command.permLevel && permLevel < command.permLevel) {// insufficient bot permissions
            return;
        }
    
        const commandEnabledGlobal = await getGlobalSetting(`${command.name}_enabled`);
        const commandEnabledGuild = await getGuildSetting(message.guild, `${command.name}_toggle`);
        if ((commandEnabledGlobal && commandEnabledGlobal[0].value == 'false') || (commandEnabledGuild[0] && commandEnabledGuild[0].value === 'disable')) {
            message.channel.send({
                embed: {
                    title: `Command Disabled`,
                    description: `\`${commandName}\` has been disabled ${(commandEnabledGlobal[0] && commandEnabledGlobal[0].value == 'false') ? "**globally**" : "**on this server**"}.`,
                    footer: {
                        text: `${(commandEnabledGlobal[0] && commandEnabledGlobal[0].value == 'false') ? 'sorry, please be patient' : 'admins may re-enable it'}`
                    }
                }
            });
            return;
        }
    
        if (command.args && !args.length) {// if arguments are required but not provided, SHOULD ADD SPECIFIC ARGUMENT COUNT PROPERTY
            const fec_gs = await getGlobalSetting("fail_embed_color");
            const fail_embed_color = parseInt(fec_gs[0].value);
    
            let reply = `Arguments are needed to make that work!`;
    
            if (command.usage) {
                reply += `\nUsage: \`${message.gprefix}${command.name} ${command.usage}\``;
            }
    
            return message.channel.send({
                embed: {
                    description: reply,
                    color: fail_embed_color,
                    footer: {
                        text: 'tip: separate arguments with spaces'
                    }
                }
            });
        }
    
        if (!cooldowns.has(command.name)) {
            cooldowns.set(command.name, new Discord.Collection());
        }
    
        const timestamps = cooldowns.get(command.name);
        const cooldownAmount = (command.cooldown || 2) * 1000;
    
        if (timestamps.has(message.author.id)) {
            const expirationTime = timestamps.get(message.author.id) + cooldownAmount;
    
            if (now < expirationTime) {
                const timeLeft = (expirationTime - now) / 1000;
                return message.reply(`please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.name}\` command.`)
            }
        }
        timestamps.set(message.author.id, now);
        setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
    
        try {
            command.execute(client, message, args);
            
            // adding one to the number of commands executed in auth.json every time command executed, commands that execute inside each other do not feature this
            /*if (config.commandsExecutedCount) config.commandsExecutedCount += 1;
            if (!config.commandsExecutedCount) config.commandsExecutedCount = 1;
            fs.writeFile("./auth.json", JSON.stringify(config, null, 2), function (err) {
                if (err) return console.log(err);
            });*/
    
            if (config.msgLogging) {
                client.channels.cache.get('661614128204480522').send(`${message.author.tag} sent command \`${command.name}\` at \`${message.id}\` ${message.url}`).catch(console.error);
            }
    
            logCmdUsage(commandName);
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

module.exports = Bot;
