const fetch = require('node-fetch');
module.exports = {
    name: 'tronalddump',
    description: 'the dumbest things Donald Trump has ever said (again not curated by me). Get ~~either~~ a random quote~~, a list of existing tags, or a quote under one of the tags.~~',
    aliases:['td', 'tronald'],
    usage: "~~[tags/existing tag]~~",
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
        if (args[0] == "tags" || args[0] == "subjects" || args[0] == "list") {
            return message.channel.send({
                embed: {
                    "title": "Donald Trump: Tags",
                    "description": `${tagInfo.count} total tags.\n**All Available Tags:**\n${tagInfo.tags.join('\n')}`,
                    "timestamp": new Date(),
                    "footer": {
                        "text": "tronalddump Tag List"
                    }
                }
            });
        }
        if (tagInfo.tags.includes(args.join(" "))) {
            return message.channel.send('I\'m *sorry*, this feature is currently broken.')
            fetch(`https://api.tronalddump.io/tag/${encodeURI(args.join(" "))}`)
                .then(res => res.json())
                .then(j => {
                    return message.channel.send({
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
            }
            if (!args.length || true) {
                fetch('https://api.tronalddump.io/random/quote')
                    .then(res => res.json())
                    .then(j => {
                        return message.channel.send({
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
            }
        }
}