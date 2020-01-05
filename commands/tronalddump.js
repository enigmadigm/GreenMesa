const fetch = require('node-fetch');
module.exports = {
    name: 'tronalddump',
    description: 'the dumbest things Donald Trump has ever said (again not curated by me). Get either a random quote, a list of existing tags, or a quote under one of the tags (case sensitive).',
    aliases:['td', 'tronald'],
    usage: "[tags | existing tag]",
    cooldown: 2,
    async execute(client, message, args) {
        const allTags = [];
        const tagInfo = await fetch('https://api.tronalddump.io/tag')
            .then(res => res.json())
            .then(j => {
                for (let i = 0; i < j._embedded.tag.length; i++) {
                    allTags.push(j._embedded.tag[i].value);
                }
                return {count: j.total, tags: allTags};
            });
            
            // for (let i = 0; i < tagInfo.tags.length; i++) {
                //     console.log(tagInfo.tags[i]);
                //     console.log(tagInfo.tags.includes(tagInfo.tags[i]));
                //     console.log(tagInfo.tags.includes(args.join(" ").toLowerCase()));
                //     console.log(args.join(" "));
                // }
                
        if (!args.length || args.length == 0) {
            return fetch('https://api.tronalddump.io/random/quote')
                .then(res => res.json())
                .then(j => {
                    message.channel.send({
                        embed: {
                            "title": "Donald Trump",
                            "url": j._links.self.href,
                            "description": j.value,
                            "color": Math.floor(Math.random() * 16777215),
                            "timestamp": j.appeared_at,
                            "footer": {
                                "text": j.tags[0] + " | " + j.quote_id
                            }
                        }
                    });
                }).catch(console.error);
        }
        if (args.length & args.length == 1 & args.toString().length == 22) {
            return fetch(`https://api.tronalddump.io/quote/${args[0]}`)
                .then(res => res.json())
                .then(j => {
                    message.channel.send({
                        embed: {
                            "title": "Donald Trump",
                            "url": j._links.self.href,
                            "description": j.value,
                            "color": Math.floor(Math.random() * 16777215),
                            "timestamp": j.appeared_at,
                            "footer": {
                                "text": j.tags[0] + " | " + j.quote_id
                            }
                        }
                    });
                }).catch(console.error);
        }
        //return message.channel.send('I\'m sorry, the quotes by tag feature is currently broken.');
        if (args[0] == "tags" || args[0] == "subjects" || args[0] == "list") {
            return message.channel.send({
                embed: {
                    "title": "Donald Trump: Tags",
                    "description": `${tagInfo.count} total tags.\n**All Available Tags:**\n${tagInfo.tags.join('\n')}\n***NOTE: tags are case sensitive***`,
                    "timestamp": new Date(),
                    "footer": {
                        "text": "tronalddump Tag List"
                    }
                }
            });
        }

        // sweet home alabama Js5AQrOsQxmjLrq5F_Os2w

        if (args.length) {
            if (tagInfo.tags.includes(args.join(" "))) {
                //return message.channel.send('I\'m *sorry*, this feature is currently broken.')
                return fetch(`https://api.tronalddump.io/search/quote?tag=${encodeURIComponent(args.join(" "))}&query=`)
                    .then(res => res.json())
                    .then(j => {
                        j = j._embedded.quotes[Math.floor(Math.random() * j.count)];
                        message.channel.send({
                            embed: {
                                "title": "Donald Trump",
                                "url": j._links.self.href,
                                "description": j.value,
                                "color": Math.floor(Math.random() * 16777215),
                                "timestamp": j.appeared_at,
                                "footer": {
                                    "text": j.tags[0] + " | " + j.quote_id
                                }
                            }
                        }).catch(console.error);
                    }).catch(console.error);
            } else {
                message.channel.send(`ERROR. You probably sent an invalid tag: ${args.join(" ").toLowerCase()}. ***NOTE: tags are case sensitive***`);
            }
        }
        }
}