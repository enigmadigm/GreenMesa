import fetch from 'node-fetch';
import { Command } from 'src/gm';
import xlg from '../../xlogger';
// NOTE: The database that this command is built on seems to be kind of done with updates

export const command: Command = {
    name: 'tronalddump',
    description: {
        short: 'the dumbest things Donald Trump has ever said',
        long: 'The dumbest things Donald Trump has ever said (not curated by me). Get either a random quote, a list of existing tags, or a quote under one of the tags (case sensitive).'
    },
    aliases: ['td', 'tronald'],
    usage: "[tags | specify a tag]",
    cooldown: 2,
    async execute(client, message, args) {
        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const allTags: any = [];
            const tagInfo = await fetch('https://api.tronalddump.io/tag')
                .then(res => res.json())
                .then(j => {
                    for (let i = 0; i < j._embedded.tag.length; i++) {
                        allTags.push(j._embedded.tag[i].value);
                    }
                    return {
                        count: j.total,
                        tags: allTags
                    };
                });
    
            if (!args.length) {
                const r = await fetch('https://api.tronalddump.io/random/quote')
                const j = await r.json();
                message.channel.send({
                    embed: {
                        "title": "Donald Trump",
                        "url": j._links.self.href,
                        "description": j.value,
                        "color": Math.floor(Math.random() * 16777215),
                        "timestamp": j.appeared_at,
                        "footer": {
                            "text": "Tronald Dump: " + j.tags[0] + " | " + j.quote_id
                        }
                    }
                });
                return;
            }
            if (args.length == 1 && args.join(" ").length === 22) {// search for a quote by its id (displayed in the embed)
                const r = await fetch(`https://api.tronalddump.io/quote/${args[0]}`);
                const j = await r.json();
                if (j.status === 404) {
                    message.channel.send(`Quote not found`);
                    return;
                }
                message.channel.send({
                    embed: {
                        "title": "Donald Trump",
                        "url": j._links.self.href,
                        "description": j.value,
                        "color": Math.floor(Math.random() * 16777215),
                        "timestamp": j.appeared_at,
                        "footer": {
                            "text": "Tronald Dump: " + j.tags[0] + " | " + j.quote_id
                        }
                    }
                });
                return;
            }
            if (args[0] == "tags" || args[0] == "subjects" || args[0] == "list") {
                message.channel.send({
                    embed: {
                        "title": "Donald Trump: Tags",
                        "description": `${tagInfo.count} total tags.\n**All Available Tags:**\n${tagInfo.tags.join('\n')}\n***NOTE: tags are case sensitive***`,
                        "timestamp": new Date(),
                        "footer": {
                            "text": "tronalddump Tag List"
                        }
                    }
                });
                return;
            }
    
            // sweet home alabama Js5AQrOsQxmjLrq5F_Os2w
            // ^^^^^^^^^^ April 19 update, I HAVE NO IDEA WHAT THAT IS OR IF IT IS IMPORTANT
            // ^^^^^^^^^^ January 29 update, THIS IS A CODE FOR A POST FROM TRUMP ABOUT INTIMATE RELATIONS WITH HIS DAUGHTER
    
            if (args.length) {
                if (tagInfo.tags.includes(args.join(" "))) {
                    const r = await fetch(`https://api.tronalddump.io/search/quote?tag=${encodeURIComponent(args.join(" "))}&query=`)
                    let j = await r.json();
                    j = j._embedded.quotes[Math.floor(Math.random() * j.count)];
                    message.channel.send({
                        embed: {
                            "title": "Donald Trump",
                            "url": j._links.self.href,
                            "description": j.value,
                            "color": Math.floor(Math.random() * 16777215),
                            "timestamp": j.appeared_at,
                            "footer": {
                                "text": "Tronald Dump: " + j.tags[0] + " | " + j.quote_id
                            }
                        }
                    });
                } else {
                    message.channel.send(`ERROR. You probably sent an invalid tag: ${args.join(" ").toLowerCase()}.\n***NOTE: tags are case sensitive***`);
                }
            }
        } catch (error) {
            xlg.error(error);
            await client.specials?.sendError(message.channel);
            return false;
        }
    }
}

