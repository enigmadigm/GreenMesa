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

// get the snekfetch client
const snekfetch = require("snekfetch");

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

client.on("ready", () => {
    // This event will run if the bot starts, and logs in, successfully.
    console.log(`Bot has started, with ${client.users.size} users, in ${client.channels.size} channels of ${client.guilds.size} guilds.`);
    // Example of changing the bot's playing game to something useful. `client.user` is what the
    // docs refer to as the "ClientUser".
    //client.user.setActivity(`no site yet | $help | Serving ${client.guilds.size} servers`);
    var abs = 0;
    setInterval(() => {
        switch (abs) {
            case 0:
                client.user.setActivity(`bit.ly/2KvEP9w | $help | Serving ${client.guilds.size} servers`);
                break;
            case 1:
                client.user.setActivity(`society crumble`, { type: 'WATCHING' });
                break;
            case 2:
                //client.user.setActivity(`Twitch`, {url: 'https://twitch.tv/EnigmaDigm'});
                break;
            default:
                client.user.setActivity(`bit.ly/2KvEP9w | $help | Serving ${client.guilds.size} servers`);
        }
        if (abs > 1) {
            abs = 0
        } else {
            abs++
        }
    }, 20000); // Runs this every 10 seconds.
    // End of this rubbish loop, can insert other settings after
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

// Get a random number
function getRandom() {
    return Math.floor(Math.random() * 10);
}
// Now were doing work on the xp system
function generateXp() {
    let min = 20;
    let max = 40;
    return Math.floor(Math.random() * (30 - 10 + 1)) + min
}
// 8ball response generator
function doMagic8BallVoodoo() {
    var rand = ['Yes', 'No', 'Why are you even trying?', 'What do you think? NO', 'Maybe', 'Never', 'Yep'];
    return rand[Math.floor(Math.random() * rand.length)];
}
// what ass (nsfw)
function nsfwAss() {
    var rand = ['bath_pussy.jpg', '18709885.jpg', '20976328.jpg', 'tumblr_p1p28gKz7o1ui7kc0o1_1280.jpg', 'hailee_steinfeld_naked_ass.jpg', 'real-bad-ideas-for-the-weekend-2545.jpg'];
    return "media/" + rand[Math.floor(Math.random() * rand.length)];
}

function nsfwPussy() {
    var rand = ['19041137.gif', 'hailee_steinfeld_naked_ass.jpg', 'bath_pussy.jpg', 'tumblr_p1p28gKz7o1ui7kc0o1_1280.jpg', 'hailee_steinfeld_naked_ass.jpg', 'O0AhK.jpg', 'jessicaalba.jpg', 'JessicaAlbaHardcoreSexFuckedinPussy.png', 'guerlain.jpg', 'girls-masterbating.jpg'];
    return "media/" + rand[Math.floor(Math.random() * rand.length)];
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
    if (message.content.indexOf(config.prefix) !== 0) return;

    // Here we separate our "command" name, and our "arguments" for the command.
    // e.g. if we have the message "+say Is this the real life?" , we'll get the following:
    // command = say
    // args = ["Is", "this", "the", "real", "life?"]
    const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();

    //=!=!=!=!=!=!=!=!=!=!=!=!=!=!=!=!=!=!=!=
    //=!=!= THE REAL STUFF STARTS HERE =!=!=
    //=!=!=!=!=!=!=!=!=!=!=!=!=!=!=!=!=!=!=
    if (command == "ta") {
        message.channel.send(Math.floor(Math.random() * (10))).catch(console.error);
    }
    if (command == "nsfw") {
        if (args[0] == "ass") {
            message.channel.send({ files: [nsfwAss()] }).catch(console.error);
        } else if (args[0] == "pussy") {
            message.channel.send({ files: [nsfwPussy()] }).catch(console.error);
        }
        if (typeof args[0] == 'undefined') {
            message.channel.send("Please supply an argument (e.g. ass, pussy), and you will be given the content.");
        }
    }
    if (command == "8ball") {
        message.channel.send(doMagic8BallVoodoo()).catch(console.error);
    }
    // Random number test
    if (command === "randomnumberfunction" || command == "rand") {
        message.channel.send(getRandom()).catch(console.error);
    }
    // Give oauth url for bot invite
    if (command === "invite") {
        message.channel.send({
            embed: {
                color: 3447003,
                fields: [{
                        name: "Direct OAuth link",
                        value: "[Here](https://discordapp.com/api/oauth2/authorize?client_id=560223567967551519&permissions=8&redirect_uri=https%3A%2F%2Fdigmsl.link%2Fgreenmesa&scope=bot) is the direct invite link to get GM on your server, there is no documentation, just the Discord OAuth invite page."
                    },
                    {
                        name: "Step by step process",
                        value: "[Step by step process to get GM (really takes no effort)](https://git.io/fjmEX)."
                    }
                ],
                timestamp: new Date(),
                footer: {
                    icon_url: client.user.avatarURL,
                    text: message.id
                }
            }
        });
    }
    // Tell why
    if (command === "why") {
        message.channel.send({
            embed: {
                color: 3447003,
                fields: [{
                    name: "Why?",
                    value: "Because I wanted to."
                }],
                timestamp: new Date(),
                footer: {
                    text: message.id
                }
            }
        });
    }
    // Pornography denial
    if (command === "porn") {
        message.channel.send("mmmmm no...not gonna make it *that* easy");
    }
    // XP system (DigiCom), there's gonna be a lot here
    /*
    if (command === "givexp") {
      if (true) {
        conn.query(`SELECT * FROM dgmxp WHERE id = '${message.author.id}'`, (err, rows) => {
          if(err) throw err;
          let sql;
          if (rows.length < 1) {
            sql = `INSERT INTO dgmxp (id, xp) VALUES ('${message.author.id}', '${generateXp()}')`;
          } else {
            let xp =  rows[0].xp;
            sql = `UPDATE dgmxp SET xp = ${xp + generateXp()} WHERE id = '${message.author.id}'`
          }
          conn.query(sql);
        });
        message.channel.send("You have been given XP.")
      }
    }
    */
    if (command === "currentxp" || command === "xp") {
        let target = message.mentions.users.first() || message.guild.members.get(args[1]) || message.author;
        conn.query(`SELECT * FROM dgmxp WHERE id = '${target.id}'`, (err, rows) => {
            if (err) throw err;
            if (!rows[0]) return message.channel.send("This user has no XP on record.");
            let xp = rows[0].xp;
            message.channel.send(target.tag + " currently has " + xp + "xp");
        });
    }

    if (command === "help") {
        message.channel.send({
            embed: {
                color: 3447003,
                author: {
                    name: client.user.username,
                    icon_url: client.user.avatarURL
                },
                title: "GreenMesa Help",
                url: "https://enigmadigm.com/apps/greenmesa/help",
                description: "You ask for some help? View the following links and information to answer your questions and spark curiosity.",
                fields: [{
                        name: "Commands (all)",
                        value: "[Sure thing](https://enigmadigm.com/apps/greenmesa/commands)"
                    },
                    {
                        name: "The H*ll Is This? AND REQUESTS",
                        value: "Look at the profile of @GreenMesa! Otherwise just know that GM is a general purpose Discord API supported application (bot) that can be used for pretty much anything we/you want. That's right! You want it? You have a 20% chance of Stefan being able to get it. But it you do want to make a request either use the #requests channel or go to the [enigmadigm contact tab](https://enigmadigm.com/apps/greenmesa/discord/help?conresrec=reset)"
                    },
                    {
                        name: "What am I supposed to do?",
                        value: "IDK. Many of the channels have clear purposes, and there is no need to worry about the ones you cannot access. You can do and say whatever you wish inside the general channels as long as you are abiding by the #rules and [EnigmaDigm Policies](https://enigmadigm.com/policies)"
                    }
                ],
                timestamp: new Date(),
                footer: {
                    icon_url: client.user.avatarURL,
                    text: "The Help"
                }
            }
        });
    }
    if (command === "intro") {
        message.channel.send({
            embed: {
                color: 3447003,
                author: {
                    name: client.user.username,
                    icon_url: client.user.avatarURL
                },
                title: "Introduction",
                description: "YAGPDB, you get the idea.",
                fields: [{
                    name: "More",
                    value: "`$help`"
                }],
                timestamp: new Date(),
                footer: {
                    icon_url: client.user.avatarURL,
                    text: "The Intro"
                }
            }
        });
    }
    if (message.author.id !== config.ownerID && command === "df4h654s6hgs4b6segasbeb698g4") {
        // This will create the webhook with the name "Example Webhook" and an example avatar.
        message.channel.createWebhook("Example Webhook", "https://i.imgur.com/p2qNFag.png")
            // This will actually set the webhooks avatar, as mentioned at the start of the guide.
            .then(webhook => webhook.edit("Example Webhook", "https://i.imgur.com/p2qNFag.png")
                // This will get the bot to DM you the webhook, if you use this in a selfbot,
                // change it to a console.log as you cannot DM yourself
                .then(wb => message.author.send(`Here is your webhook https://canary.discordapp.com/api/webhooks/${wb.id}/${wb.token}`)).catch(console.error))
    }
    // $say-embed-welcome : command only usable for user with EnigmaDigm owner id (in config file), sends message to welcome channel
    // This command is no longer in use, USE AS EXAMPLE
    if (command === "say-embed-welcome" && message.author.id === config.ownerID) {
        if (args.length > 0) {
            const sayMessage = args.join(" ");
            message.delete().catch(O_o => {});
            client.channels.get("559936955995914260").send({
                embed: {
                    color: 10181046,
                    author: {
                        name: client.user.username,
                        icon_url: client.user.avatarURL
                    },
                    title: args[0],
                    description: args[1]
                }
            });
        }
    }
    // $esay : $say command but an embed, comes with options, $say still available
    if (command === "esay") {
        // makes the bot say something and delete the message. As an example, it's open to anyone to use. EDIT:
        // if say is empty the bot makes up something.
        if (args.length > 0) {
            // To get the "message" itself we join the `args` back into a string with spaces:
            const sayMessage = args.join(" ");
            // Then we delete the command message (sneaky, right?). The catch just ignores the error with a cute smiley thing.
            message.delete().catch(O_o => {});
            //not sure where I got this from (forgetting my edit: message.edit.catch(O_o=>{});
            // And we get the bot to say the thing:
            if (isNaN(args[0]) == false && args[0] <= 16777215) {
                var seacolor = parseInt(args[0]);
                var sclength = args[0].length;
            } else {
                var seacolor = 3447003;
                var sclength = 0;
            }
            message.channel.send({
                embed: {
                    color: seacolor,
                    title: "From @" + message.author.tag + ", with love:",
                    description: args.join(" ").slice(sclength).trim(),
                    timestamp: new Date(),
                    footer: {
                        icon_url: client.user.avatarURL,
                        text: message.id
                    }
                }
            });
        } else {
            // Else statement activated if user did not enter any parameters
            //=!=!= NOTE =!=!= cannot edit a message authored by another user =!=!= NOTE =!=!=
            //message.edit("ig idk");
            // Deleting command message from requesting user to make it look "cooler"
            message.delete().catch(O_o => {});
            // Telling user that the bot can't say anything without something to say
            message.channel.send("**" + client.user.username + "  ERROR =>  MID" + message.id + "  ! EXEC COMM NO PARAMS ** *Command:* `$esay` *Description:* `$say` command but an embed with options (more to come). *Syntax:* `$esay [color code] <message w/ formatting>`");
        }
    }
    // $ennounce : $esay command but for moderators/admins, doesn't come with mark, used for courtesy, notification, warnings, other messages. Use $esay for all other purposes
    if (command === "ennounce") {
        // && message.member.roles.find(r => r.name === "Admin") || message.member.roles.find(r => r.name === "Mod")
        // ^ originally meant to find if message author has the Admin role, didn't work, went https://stackoverflow.com/questions/53521160/command-only-with-certain-role?noredirect=1&lq=1 and https://stackoverflow.com/questions/45317305/find-out-if-someone-has-a-role to find answers
        // The following actually works in finding out if author has the admin role, however when this executes console gives warning to `Pass function`?
        // Getting ID of Admin role for next part
        let Admina = message.guild.roles.find(x => x.name === "Admin");
        // Added this for someone who has annnouncement perms but is not an admin
        let AdminPerma = message.guild.roles.find(x => x.name === "Moderator"); /*!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!*/
        // Using ID of Admin role to find out if author has it
        if (message.member.roles.has(Admina.id) || message.member.roles.has(AdminPerma.id) || message.member.hasPermission("MENTION_EVERYONE", false, true, true)) {
            // makes the bot say something and delete the message. As an example, it's open to anyone to use. EDIT:
            // if say is empty the bot makes up something.
            if (args.length > 0) {
                // To get the "message" itself we join the `args` back into a string with spaces:
                const sayMessage = args.join(" ");
                // Then we delete the command message (sneaky, right?). The catch just ignores the error with a cute smiley thing.
                message.delete().catch(O_o => {});
                //not sure where I got this from (forgetting my edit: message.edit.catch(O_o=>{});
                // And we get the bot to say the thing:
                if (isNaN(args[0]) == false && args[0] <= 16777215) {
                    var seacolor = parseInt(args[0]);
                    var sclength = args[0].length;
                } else {
                    var seacolor = 3447003;
                    var sclength = 0;
                }
                message.channel.send({
                    embed: {
                        color: seacolor,
                        description: args.join(" ").slice(sclength).trim(),
                        timestamp: new Date(),
                        footer: {
                            icon_url: message.author.avatarURL,
                            text: "Administrator message"
                        }
                    }
                });
            } else {
                // Else statement activated if user did not enter any parameters
                //=!=!= NOTE =!=!= cannot edit a message authored by another user =!=!= NOTE =!=!=
                //message.edit("ig idk");
                // Deleting command message from requesting user to make it look "cooler"
                message.delete().catch(O_o => {});
                // Telling user that the bot can't say anything without something to say
                message.channel.send("**" + client.user.username + "  ERROR =>  MID" + message.id + "  ! EXEC COMM NO PARAMS ** *Command:* `$ennounce` *Description:* `$esay` command but for moderators/admins, doesn't come with mark, used for courtesy, notification, warnings, other messages. Use `$esay` for all other purposes. *Syntax:* `$ennounce [color code] <message w/ formatting>`");
            }
        } else {
            message.delete().catch(O_o => {});
            message.author.send("Insufficient permissions for `ennounce`");
        }
    }
    if (command == "dmme") {
        message.author.send("Why would you ask to get a dm?");
        console.log(message.author.tag + ` dmd itself.`);
    }
    if (command === "vote") {
        await message.react('✅')
            //.then(console.log)
            .catch(console.error);
        message.react('❌')
            .catch(console.error);
    }
    if (command === "define" || command === "def") {
        // making sure one no more no less arguments are supplied
        if (args.length == 1) {
            // mw api test url https://www.dictionaryapi.com/api/v3/references/collegiate/json/test?key=03464f03-851d-4df0-ad53-4afdb47311d8
            let def = args[0].toLowerCase();
            // tried some() but that checks to see if at least one element in an array passes the
            // test (in this case the test is isNaN()), looked up on MDN and the solution is every().
            // here the split() is making an array of every character in the first argument, and
            // every() is checking to see if all elements in array are letters and not coercible to a number
            if (def.split("").every(isNaN)) {
                snekfetch.get(`https://www.dictionaryapi.com/api/v3/references/collegiate/json/${def}?key=03464f03-851d-4df0-ad53-4afdb47311d8`).then(r => {
                    //let definition = r.body[0].shortdef;
                    if (r.body[0]) {
                        if (r.body[0].shortdef) {
                            // LUMINOUS_VIVID_PINK is 15277667
                            /*var embed = new Discord.RichEmbed()
                              .setTitle('The Definition of ' + def)
                              .setColor(15277667)
                              .setDescription(r.body[0].shortdef[0]);
                            message.channel.send(embed).catch(console.error);*/
                            let defsArray = []
                            for (var i = 0; i < r.body[0].shortdef.length; i++) {
                                defsArray[i] = "[" + (i + 1) + "] " + r.body[0].shortdef[i];
                            }
                            message.channel.send({
                                embed: {
                                    "title": "The definition of " + def,
                                    "description": defsArray.join(", "),
                                    "color": 65280,
                                    "timestamp": new Date(),
                                    "footer": {
                                        "text": "Definitions"
                                    }
                                }
                            }).catch(console.error);
                        } else {
                            const embed = {
                                "title": "Your word could not be found",
                                "description": "Did you mean: " + r.body.join(", "),
                                "color": 16750899,
                                "timestamp": new Date(),
                                "footer": {
                                    "text": "Definitions"
                                }
                            };
                            message.channel.send({ embed }).catch(console.error);
                        }
                    } else {
                        message.channel.send({
                            embed: {
                                "title": "It appears you typed gibberish.",
                                "description": "That or there was an unhandled error.",
                                "color": 16750899,
                                "timestamp": new Date(),
                                "footer": {
                                    "text": "Definitions"
                                }
                            }
                        }).catch(console.error);
                    }
                }).catch(console.error);
            } else {
                message.channel.send({
                    embed: {
                        "title": "Please send a valid word to be defined",
                        "description": "Whatever you entered wasn't found to be valid, it probably contained a number",
                        "color": 16711680,
                        "timestamp": new Date(),
                        "footer": {
                            "text": "Definitions"
                        }
                    }
                }).catch(console.error);
            }
            // ***BAD CODE***
            /*if(!def) return message.channel.send("Send a word to be defined!");
            def = def.toLowerCase().split("");
            def.forEach((r, contDefLoop = true) => {
              if(!isNaN(r)){
                contDefLoop = false;
                message.channel.send("Send a valid word to be defined!");
              }
              console.log("made it here");
              if (contDefLoop == false) return false;
            });
            if (defValid == false) return console.log("character invalid");
            message.channel.send(def);
            snekfetch.get(`https://www.dictionaryapi.com/api/v3/references/collegiate/json/${def}?key=03464f03-851d-4df0-ad53-4afdb47311d8`).then(r => {
              let body = r.body;
            });*/
        } else {
            message.channel.send({
                embed: {
                    "title": "Please send only one term/argument to define",
                    "description": "$<def>/<define> <proper non-medical English word>",
                    "color": 16711680,
                    "timestamp": new Date(),
                    "footer": {
                        "text": "Definitions"
                    }
                }
            }).catch(console.error);
        }
    }
    //=!=!=!=!=!=!=!=!=!=!=!=!=!=!=!=!=!=!=
    //=!=!= THE REAL STUFF ENDS HERE =!=!=
    //=!=!=!=!=!=!=!=!=!=!=!=!=!=!=!=!=!=

    // Let's go with a few common example commands! Feel free to delete or change those.

    if (command === "ping") {
        // Calculates ping between sending a message and editing it, giving a nice round-trip latency.
        // The second ping is an average latency between the bot and the websocket server (one-way, not round-trip)
        const m = await message.channel.send("Ping?");
        m.edit(`Pong! Latency is ${m.createdTimestamp - message.createdTimestamp}ms. API Latency is ${Math.round(client.ping)}ms.`);
        console.log(`API Latency is ${Math.round(client.ping)}ms.`);
    }

    if (command === "say") {
        // makes the bot say something and delete the message. As an example, it's open to anyone to use. EDIT:
        // if say is empty the bot makes up something.
        if (args.length > 0) {
            // To get the "message" itself we join the `args` back into a string with spaces:
            const sayMessage = args.join(" ");
            // Then we delete the command message (sneaky, right?). The catch just ignores the error with a cute smiley thing.
            message.delete().catch(O_o => {});
            //not sure where I got this from (forgetting my edit: message.edit.catch(O_o=>{});
            // And we get the bot to say the thing:
            message.channel.send(args.join(" "));
        } else {
            // Else statement activated if user did not enter any parameters
            //cannot edit a message authored by another user =!=!= NOTE =!=!=
            //message.edit("ig idk");
            // Deleting command message from requesting user to make it look "cooler"
            //message.delete().catch(O_o=>{});
            // Telling user that the bot can't say anything without something to say
            message.channel.send("Ha! No. You need to tell me what to say.");
        }
    }
    if (command === "kick") {
        // This command must be limited to mods and admins. In this example we just hardcode the role names.
        // Please read on Array.some() to understand this bit:
        // https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Array/some?
        /*if(!message.member.roles.some(r=>["Administrator", "Moderator"].includes(r.name)) && message.author.id != config.ownerID)
          return message.reply("Sorry, you don't have permissions to use this!");*/

        if (!message.member.hasPermission("KICK_MEMBERS", false, true, true))
            return message.reply("Sorry, you don't have permissions to use this!");

        // Let's first check if we have a member and if we can kick them!
        // message.mentions.members is a collection of people that have been mentioned, as GuildMembers.
        // We can also support getting the member by ID, which would be args[0]
        let member = message.mentions.members.first() || message.guild.members.get(args[0]);
        if (!member)
            return message.reply("Please mention a valid member of this server");
        if (!member.kickable)
            return message.reply("I cannot kick this user! Do they have a higher role? Do I have kick permissions?");

        // slice(1) removes the first part, which here should be the user mention or ID
        // join(' ') takes all the various parts to make it a single string.
        let reason = args.slice(1).join(' ');
        if (!reason) reason = "No reason provided";

        // Now, time for a swift kick in the nuts!
        await member.kick(reason)
            .catch(error => message.reply(`Sorry ${message.author} I couldn't kick because of : ${error}`));
        message.reply(`${member.user.tag} has been kicked by ${message.author.tag} because: ${reason}`);

    }

    if (command === "ban") {
        // Most of this command is identical to kick, except that here we'll only let admins do it.
        // In the real world mods could ban too, but this is just an example, right? ;)
        /*if(!message.member.roles.some(r=>["Administrator"].includes(r.name)) )
          return message.reply("Sorry, you don't have permissions to use this!");*/

        if (!message.member.hasPermission("BAN_MEMBERS", false, true, true))
            return message.reply("Sorry, you don't have permissions to use this!");

        let member = message.mentions.members.first();
        if (!member)
            return message.reply("Please mention a valid member of this server");
        if (!member.bannable)
            return message.reply("I cannot ban this user! Do they have a higher role? Do I have ban permissions?");

        let reason = args.slice(1).join(' ');
        if (!reason) reason = "No reason provided";

        await member.ban(reason)
            .catch(error => message.reply(`Sorry ${message.author} I couldn't ban because of : ${error}`));
        message.reply(`${member.user.tag} has been banned by ${message.author.tag} because: ${reason}`);
    }

    if (command === "purge") {
        // This command removes all messages from all users in the channel, up to 100.

        if (!message.member.hasPermission("ADMINISTRATOR", false, true, true))
            return message.reply("Sorry, you don't have permissions to use this!");

        // get the delete count, as an actual number.
        const deleteCount = parseInt(args[0], 10);

        // Ooooh nice, combined conditions. <3
        if (!deleteCount || deleteCount < 2 || deleteCount > 100)
            return message.reply("Please provide a number between 2 and 100 for the number of messages to delete");

        // So we get our messages, and delete them. Simple enough, right?
        const fetched = await message.channel.fetchMessages({ limit: deleteCount });
        message.channel.bulkDelete(fetched)
            .catch(error => message.reply(`Couldn't delete messages because of: ${error}`));
    }
});

client.on('error', console.error);

client.login(config.token);