'use strict';

// To all for `import - from '-'` and `export async function function() {}` in modules I must change the eslint sourcetype to module
// and change the package.json tyope to module, then replace all require()s and exports.method/module.exports with the types of
// statements above. mayve one day I could do it because it might look better.

const xlg = require("./xlogger");
process.on('uncaughtException', function (e) {
    xlg.log(e);
    process.exit(1);
});
/* https://pm2.keymetrics.io/docs/usage/signals-clean-restart/ while looking at pm2-api docs
process.on('SIGINT', function () {
});*/
// catches unhandled promise rejections
process.on('unhandledRejection', async (reason, promise) => {
    var error = new Error('Unhandled Rejection. Reason: ' + reason);
    console.error(error, "Promise:", promise);
});

const fs = require('fs'); // Get the filesystem library that comes with nodejs
const Discord = require("discord.js"); // Load discord.js library
const config = require("./auth.json"); // Loading app config file
// config.token contains the bot's token
// config.prefix contains the message prefix.
//const dbm = require("./dbmanager");
//const mysql = require("mysql");
const client = new Discord.Client();
var { conn, updateXP, updateBotStats, getGlobalSetting, getPrefix, clearXP, massClearXP, logCmdUsage } = require("./dbmanager");
const { permLevels, getPermLevel } = require("./permissions");
const { logMember, logMessageDelete, logMessageBulkDelete, logMessageUpdate, logRole, logChannelState } = require('./serverlogger')

// Chalk for "terminal string styling done right," currently not using, just using the built in styling tools https://telepathy.freedesktop.org/doc/telepathy-glib/telepathy-glib-debug-ansi.html
//const chalk = require('chalk');

// The Discord.js *client*
client.commands = new Discord.Collection()
// ▼▲▼▲▼▲▼▲▼▲▼▲▼▲ for command handler, got this from https://discordjs.guide/command-handling/
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
var commNumber = 1;
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    // set a new item in the Collection
    // with the key as the command name and the value as the exported module
    client.commands.set(command.name, command);
    let noName = '';
    if (command.name == "" || command.name == null) {
        noName = ' \x1b[33mWARNING: \x1b[32mthis command has no name, it may not be configured properly\x1b[0m';
    }
    if (!command.execute) {
        noName = ' \x1b[33mWARNING: \x1b[32mthis command has no function, it may not be configured properly\x1b[0m';
    }
    console.log(`${commNumber} - %s$${command.name}%s has been loaded%s`, "\x1b[35m", "\x1b[0m", noName);
    commNumber++;
}

const tools = {
    memoryUsage() {
        return Object.entries(process.memoryUsage()).map(usage => {
            return `${usage[0]} : ${(Math.round(usage[1] / 1024 / 1024 * 100) / 100).toFixed().split('.')[0]} MB`
        }).join("\n");
    }
}

client.tools = tools;

// ▼▼▼▼▼▼▼▼ A lot of this stuff below is all to manage database connections, these are passed through the conn argument in the execute function
// Connecting to MySQL, external connection
//var db_config = config.db_config;
//var conn;
/*function handleDisconnect() {
    conn = mysql.createConnection(db_config);
    conn.connect(function(err) {
        if (err) {
            console.log('error when connecting to db:', err);
            setTimeout(handleDisconnect, 2000);
        }
        console.log("Connected to database");
    });
    conn.on('error', function(err) {
        //console.log('db error', err);
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            handleDisconnect();
        } else {
            throw err;
        }
    });
}
handleDisconnect();*/

// ▼▼▼▼▼ command cooldowns section
const cooldowns = new Discord.Collection();
const xpcooldowns = new Discord.Collection();

client.on("ready", async() => {// This event will run if the bot starts, and logs in, successfully.
    // Stats updates in logs and database
    xlg.log(`Bot ${client.user.tag}(${client.user.id}) has started, with ${client.users.cache.size} users, in ${client.channels.cache.size} channels of ${client.guilds.cache.size} guilds.`);
    client.channels.cache.get('661614128204480522').send(`Started :green_square: :green_square:`).catch(console.error);
    setInterval(() => {
        client.channels.cache.get('661614128204480522').send(`Scheduled Update: ${client.users.cache.size} users, in ${client.channels.cache.size} channels of ${client.guilds.cache.size} guilds.`).catch(xlg.error);
        updateBotStats(client);
    }, 3600000);
    //updateBotStats(client);

    setInterval(async () => {
        if (!config.longLife || config.longLife < client.uptime) config.longLife = client.uptime;
        fs.writeFile("./auth.json", JSON.stringify(config, null, 2), function (err) {
            if (err) return console.log(err);
        });

        let game = await getGlobalSetting('game_name');
        let gamePrefix = await getGlobalSetting('game_prefix');
        let gameStatus = await getGlobalSetting('game_status');
        if (game[0] && game[0].value !== 'default') {
            client.user.setPresence({
                activity: {
                    name: game[0].value || 'nothing',
                    type: (gamePrefix[0] && gamePrefix[0].value) ? gamePrefix[0].value : 'WATCHING'
                },
                status: (gameStatus[0] && gameStatus[0].value) ? gameStatus[0].value : 'idle'
            }).catch(console.error);
        } else {
            if (Math.floor(Math.random() * 10) <= 8) {
                // Set the bot's presence (activity and status)
                client.user.setPresence({
                    activity: {
                        name: `${config.prefix} help | ${config.prefix} invite`,
                    },
                    status: 'online'
                })
            } else {
                client.user.setPresence({
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

    //Generates invite link to put in console.
    try {
        let link = await client.generateInvite(["ADMINISTRATOR"]);
        console.log(link);
    } catch (e) {
        xlg.error(e);
    }
});

client.on("rateLimit", rateLimitInfo => {
    xlg.log('Ratelimited: ' + JSON.stringify(rateLimitInfo));
})

client.on("guildCreate", guild => {// This event triggers when the bot joins a guild.
    xlg.log(`New guild: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members!`);
    client.channels.cache.get('661614128204480522').send(`New guild: ${guild.name} (id: ${guild.id}) (members: ${guild.memberCount})`).catch(console.error);
    // client.user.setActivity(`Serving ${client.guilds.size} servers`);
});

client.on("guildDelete", async guild => {// this event triggers when the bot is removed from a guild.
    xlg.log(`Removed from: ${guild.name} (id: ${guild.id})`);
    client.channels.cache.get('661614128204480522').send(`Removed from: ${guild.name} (id: ${guild.id})`).catch(console.error);
    // client.user.setActivity(`Serving ${client.guilds.size} servers`);
    let clearRes = await massClearXP(guild);
    if (!clearRes) xlg.log(`Couldn't clear XP of guild: ${guild.id}`);
});

client.on('guildMemberAdd', async member => {
    logMember(member, true);
});

client.on("guildMemberRemove", async member => { //Emitted whenever a member leaves a guild, or is kicked.
    let clearRes = await clearXP(member);
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
    if (!nchannel.guild) return;
    logChannelState(nchannel);
});

client.on('channelDelete', ochannel => {
    if (!ochannel.guild) return;
    logChannelState(ochannel, true);
});

// the actual command processing
client.on("message", async message => {// This event will run on every single message received, from any channel or DM.

    if (message.author.bot) return;
    if (message.system) return;

    var dm = false; // checks if it's from a dm
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
    
    let special_prefix = false;
    if (!dm) {
        special_prefix = await getPrefix(message.guild.id)
    } else {
        special_prefix = await getGlobalSetting('global_prefix');
    }
    message.gprefix = special_prefix || config.prefix;

    if (message.mentions && message.mentions.has(client.user)) {
        if (message.content == '<@' + client.user.id + '>' || message.content == '<@!' + client.user.id + '>') {
            let iec_gs = await getGlobalSetting("info_embed_color");
            let info_embed_color = parseInt(iec_gs[0].value);
            message.channel.send({
                embed: {
                    "description": `${message.guild.me.nickname || client.user.username}'s prefix for **${message.guild.name}** is **${message.gprefix}**`,
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

    var permLevel = permLevels.member;
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

    if (command.guildOnly && message.channel.type !== 'text') {
        return message.channel.send('I can\'t execute that command inside DMs!');
    }
    if (command.ownerOnly && message.author.id !== config.ownerID) return xlg.log(`${message.author.tag} attempted ownerOnly!`);
    if (command.permLevel && permLevel < command.permLevel) return; // insufficient bot permissions

    let commandEnabledGlobal = await getGlobalSetting(`${command.name}_enabled`);
    if (commandEnabledGlobal && commandEnabledGlobal[0].value == 'false') {
        message.channel.send({
            embed: {
                title: `Command Disabled`,
                description: `\`${commandName}\` has been disabled ${(commandEnabledGlobal[0].value == "false") ? "**globally**" : "**on this server**"}.`,
                footer: {
                    text: `${(commandEnabledGlobal[0].value == "false") ? 'sorry, please be patient' : 'admins may re-enable it'}`
                }
            }
        });
        return;
    }

    if (command.args && !args.length) {
        const fec_gs = await getGlobalSetting("fail_embed_color");
        const fail_embed_color = parseInt(fec_gs[0].value);

        let reply = `I need arguments to make that work, ${message.author}!`;

        if (command.usage) {
            reply += `\nThe proper usage would be: \`${message.gprefix}${command.name} ${command.usage}\``;
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
        command.execute(client, message, args, conn);
        
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
        message.reply('error while executing! please create an issue at https://github.com/enigmadigm/GreenMesa/issues');
    }
});

client.on('error', xlg.error);

client.login(config.token);
