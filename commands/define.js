const config = require("../auth.json");

module.exports = {
    name: 'define',
    description: 'Use this sleek command that I spent hours creating to get the beautiful definition of any proper English word!',
    args: true,
    usage: "<some english word>",
    aliases: ['def'],
    execute(client, message, args, conn, snekfetch) {
        // making sure one no more no less arguments are supplied
        if (args.length == 1) {
            // **NOTE** client.fetchUser(id) is a thing (get the user object from an id)
            if (message.channel.type === "text" && message.mentions.members.size) {
                //return console.log(message.mentions.members.first().id);
                if (message.mentions.members.first().id == "142831008901890048") {
                    //(await client.fetchUser("142831008901890048")).username previously, had to make execute() async execute() to work
                    return message.channel.send({
                        embed: {
                            "title": "The definition of " + message.mentions.users.first().username,
                            "description": "One of the universe's worst ideas",
                            "color": 15277667,
                            "timestamp": new Date(),
                            "footer": {
                                "text": "Definitions"
                            }
                        }
                    });
                }
                if (message.mentions.members.first().id == "343386990030356480") {
                    return message.channel.send({
                        embed: {
                            "title": "The definition of " + message.mentions.users.first().username,
                            "description": "a total dumbass",
                            "color": 15277667,
                            "timestamp": new Date(),
                            "footer": {
                                "text": "Definitions"
                            }
                        }
                    });
                }
                if (message.mentions.members.first().id == "211992874580049920") {
                    return message.channel.send({
                        embed: {
                            "title": "The definition of " + message.mentions.users.first().username,
                            "description": "Idiot",
                            "color": 15277667,
                            "timestamp": new Date(),
                            "footer": {
                                "text": "Definitions"
                            }
                        }
                    });
                }
                return message.channel.send({
                    embed: {
                            "title": "Well you see I can't define that mention",
                            "description": "I can't define mentions unless they are special!",
                            "color": 15277667,
                            "timestamp": new Date(),
                            "footer": {
                                "text": "Definitions"
                        }
                    }
                });
            }
            // mw api test url https://www.dictionaryapi.com/api/v3/references/collegiate/json/test?key=03464f03-851d-4df0-ad53-4afdb47311d8
            let def = args[0].toLowerCase();
            // tried some() but that checks to see if at least one element in an array passes the
            // test (in this case the test is isNaN()), looked up on MDN and the solution is every().
            // here the split() is making an array of every character in the first argument, and
            // every() is checking to see if all elements in array are letters and not coercible to a number
            //def.split("").every(isNaN) used in place of regex
            let letters = /^[A-Za-z]+$/; // regular expression testing whether everything matched against contains only upper/lower case letters
            if (letters.test(def)) {
                snekfetch.get(`https://www.dictionaryapi.com/api/v3/references/collegiate/json/${def}?key=03464f03-851d-4df0-ad53-4afdb47311d8`).then(r => {
                    //let definition = r.body[0].shortdef;
                    if (r.body[0]) {
                        if (r.body[0].shortdef) {
                            // LUMINOUS_VIVID_PINK is 15277667
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
}