// Get the filesystem library that comes with js
const fs = require('fs');
// Load up the discord.js library
const Discord = require("discord.js");
// Try to get discord.io to use default functions (may not work)
//NOPE
//X const DisordIO = require("discord.io");
//X const ioclient = new Discord.Client;

// Here we load the config.json file that contains our token and our prefix values.
const config = require("./auth.json");
// config.token contains the bot's token
// config.prefix contains the message prefix.

// This is your client. Some people call it `bot`, some people call it `self`,
// some might call it `cootchie`. Either way, when you see `client.something`, or `bot.something`,
// this is what we're refering to. Your client.
const client = new Discord.Client();
client.commands = new Discord.Collection()
// Chalk for "terminal string styling done right," currently not using, just using the built in styling tools https://telepathy.freedesktop.org/doc/telepathy-glib/telepathy-glib-debug-ansi.html
//const chalk = require('chalk');
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
    console.log(`${commNumber} - %s$${command.name}%s has been loaded%s`, "\x1b[35m", "\x1b[0m", noName);
    commNumber++;
}

// ***TESTING*** Trying to set up a "WebSocket"(???) for a website to interact with the bot https://www.youtube.com/watch?v=LxLob6-8Sl0
//const WS = require('./ws/ws');
// Create Websocket instance with token '123456',
// port 5665 and passing the discord client instance
//var ws = new WS(config.ws.token, config.ws.port, client);

// get the snekfetch client for json requests
const snekfetch = require("snekfetch");

// ▼▼▼▼▼▼▼▼ A lot of this stuff below is all to manage database connections, these are passed through the conn argument in the execute function
// Connecting to MySQL, external connection (still setting up at the time of this writing)
//old password _Qf^gVJt,;I8
const mysql = require("mysql");
var db_config = {
    host: "***REMOVED***",
    user: "***REMOVED***",
    password: "***REMOVED***",
    database: "***REMOVED***aline",
    port: "3306"
};
// This connects the table for the xp (currency) system (in DigiCom)
//conn.connect(err => {
//  if(err) throw err;
//  console.log("Connected to database");
//});
var conn;

function handleDisconnect() {
    conn = mysql.createConnection(db_config);
    conn.connect(function(err) {
        if (err) {
            console.log('error when connecting to db:', err);
            setTimeout(handleDisconnect, 2000);
        }
        console.log("Connected to database");
    });
    conn.on('error', function(err) {
        console.log('db error', err);
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            handleDisconnect();
        } else {
            throw err;
        }
    });
}
handleDisconnect();

// ▼▼▼▼▼ command cooldowns section
const cooldowns = new Discord.Collection();

client.on("ready", async() => {
    // This event will run if the bot starts, and logs in, successfully.
    console.log(`Bot ${client.user.tag}(${client.user.id}) has started, with ${client.users.size} users, in ${client.channels.size} channels of ${client.guilds.size} guilds.`);
    // Example of changing the bot's playing game to something useful. `client.user` is what the
    // docs refer to as the "ClientUser".
    //client.user.setActivity(`no site yet | $help | Serving ${client.guilds.size} servers`);
    //var abs = 0;
    setInterval(() => {
        if (!config.longLife || config.longLife < client.uptime) config.longLife = client.uptime;
        fs.writeFile("./auth.json", JSON.stringify(config, null, 2), function (err) {
            if (err) return console.log(err);
        });

        if (Math.floor(Math.random() * 10) <= 8) {
            //client.user.setActivity(`$help $info | bit.ly/2KvEP9w | Serving ${client.guilds.size} servers`);
            //client.user.setStatus("online");
            // Set the bot's presence (activity and status)
            client.user.setPresence({
                game: {
                    name: `$help $info | bit.ly/2KvEP9w | Serving ${client.guilds.size} servers`,
                },
                status: 'online'
            })
        } else {
            //client.user.setActivity(`society crumble`, { type: 'WATCHING' });
            //client.user.setStatus("dnd");
            client.user.setPresence({
                game: {
                    name: 'society crumble',
                    type: 'WATCHING'
                },
                status: 'dnd'
            })
        }
        /*switch (abs) {
            case 0:
                client.user.setActivity(`$help $info | bit.ly/2KvEP9w | Serving ${client.guilds.size} servers`);
                break;
            case 1:
                client.user.setActivity(`society crumble`, { type: 'WATCHING' });
                break;
            default:
                client.user.setActivity(`bit.ly/2KvEP9w | $help | Serving ${client.guilds.size} servers`);
        }
        if (abs > 0) {
            abs = 0
        } else {
            abs++
        }*/
    }, 20000); // Runs this every 10 seconds.
    // End of this rubbish loop, can insert other settings after

    // if this doesn't work remove the async in the event listener above
    /*client.generateInvite(["ADMINISTRATOR"]).then(link => {
        console.log(link);
    }).catch(err => {
        console.log(err.stack);
    });*/

    try {
        let link = await client.generateInvite(["ADMINISTRATOR"]);
        console.log(link);
    } catch (e) {
        console.log(e.stack);
    }
});

client.on("guildCreate", guild => {
    // This event triggers when the bot joins a guild.
    console.log(`New guild joined: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members!`);
    client.user.setActivity(`bit.ly/2KvEP9w | $help | Serving ${client.guilds.size} servers`);
});

client.on("guildDelete", guild => {
    // this event triggers when the bot is removed from a guild.
    console.log(`I have been removed from: ${guild.name} (id: ${guild.id})`);
    client.user.setActivity(`bit.ly/2KvEP9w | $help | Serving ${client.guilds.size} servers`);
});

// Now were doing work on the xp system
function generateXp() {
    let min = 20;
    let max = 40;
    return Math.floor(Math.random() * 29);
}

// the actual command processing
client.on("message", async message => {
    // This event will run on every single message received, from any channel or DM.

    // It's good practice to ignore other bots. This also makes your bot ignore itself
    // and not get into a spam loop (we call that "botception").
    if (message.author.bot) return;

    // xp system now automatic, the manual $givexp command has been disabled but remains in the section
    conn.query(`SELECT * FROM dgmxp WHERE id = '${message.author.id}'`, (err, rows) => {
        if (err) throw err;
        let sql;
        if (rows.length < 1) {
            sql = `INSERT INTO dgmxp (id, xp) VALUES ('${message.author.id}', '${generateXp()}')`;
        } else {
            let xp = rows[0].xp;
            sql = `UPDATE dgmxp SET xp = ${xp + generateXp()} WHERE id = '${message.author.id}'`
        }
        conn.query(sql);
    });

    // Also good practice to ignore any message that does not start with our prefix,
    // which is set in the configuration file.
    let isiam = message.content.toLowerCase().startsWith("i'm") || message.content.toLowerCase().startsWith("i am") || message.content.toLowerCase().startsWith("im");
    if (message.content.indexOf(config.prefix) !== 0 && !isiam) return;
    // deprecated with the guild only command handler filter
    //if (message.channel.type === "dm") return;

    // Here we separate our "command" name, and our "arguments" for the command.
    // e.g. if we have the message "+say Is this the real life?" , we'll get the following:
    // command = say
    // args = ["Is", "this", "the", "real", "life?"]
    const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
    const commandName = args.shift().toLowerCase()
    
    if (isiam && args.length > 0) {
        if (args.length == 1 && args[0] == "daddy") {
            return message.channel.send("Hello *daddy* I'm little girl");
        } else if (args.length <= 2 && args[0] == "baby" || args[0]+args[1] == "littlegirl") {
            return message.channel.send(`Hello *${args.join(" ")}* I'm Daddy`);
        }
        return message.channel.send(`Hello **${args.join(" ")}** I'm ${client.user.tag}`);
    }

    //if (!client.commands.has(commandName)) return;

    //const command = client.commands.get(commandName);
    const command = client.commands.get(commandName)
        || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

    if (!command) return;

    if (command.guildOnly && message.channel.type !== 'text') {
        return message.reply('I can\'t execute that command inside DMs!');
    }
    if (command.ownerOnly && message.author.id !== config.ownerID) return console.log(`${message.author.tag} attempted $botkill!`);
    if (command.args && !args.length) {
        let reply = `I need arguments to make that work, ${message.author}!`;

        if (command.usage) {
            reply += `\nThe proper usage would be: \`${config.prefix}${command.name} ${command.usage}\``;
        }

        return message.channel.send(reply);
    }

    if (!cooldowns.has(command.name)) {
        cooldowns.set(command.name, new Discord.Collection());
    }

    const now = Date.now();
    const timestamps = cooldowns.get(command.name);
    const cooldownAmount = (command.cooldown || 3) * 1000;

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
        //client.commands.get(command).execute(client, message, args, conn, snekfetch);
        // const commandReturn = await command.execute(client, message, args, conn, snekfetch);
        command.execute(client, message, args, conn, snekfetch);
        client.channels.get('661614128204480522').send(`${message.author.tag} sent command \`${command.name}\``).catch(console.error);
    } catch (error) {
        console.error(error);
        message.reply('there was an error trying to execute that command! please create an issue at https://github.com/enigmadigm/GreenMesa/issues');
    }
});

client.on('error', console.error);

client.login(config.token);