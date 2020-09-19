const xlg = require('../xlogger');
const { getGlobalSetting } = require("../dbmanager");
const acronyms = require('../acronyms.json');
const commonAcronyms = [
    {
        acronym: 'brb',
        description: 'be right back'
    },
    {
        acronym: 'pog',
        description: 'used to indicate excitement or an epic moment'
    },
    {
        acronym: '<3',
        description: 'broken heart :cry:'
    },
    {
        acronym: 'lol',
        description: 'laugh out loud'
    },
    {
        acronym: 'smh',
        description: 'shaking my head'
    },
    {
        acronym: 'gg',
        description: 'good game'
    },
    {
        acronym: 'lmfao',
        description: 'laughin my flippin ankles off'
    },
    {
        acronym: 'paw',
        description: 'parents are watching'
    },
    {
        acronym: 'bruv',
        description: '\'used as a form of address between men\''
    },
    {
        acronym: 'adih',
        description: 'another day in hec'
    },
    {
        acronym: 'wtf',
        description: 'what the freak'
    },
    {
        acronym: 'kek',
        description: '<:kek1_sm:752106568652292198>'
    },
    {
        acronym: 'TL;DR',
        description: 'too long; didn\'t read'
    },
    {
        acronym: 'dm',
        description: 'direct message'
    },
    {
        acronym: 'irl',
        description: 'in real life'
    },
    {
        acronym: 'nsfw',
        description: 'not safe for work'
    },
    {
        acronym: 'op/c',
        description: 'original poster/content'
    },
    {
        acronym: 'aids',
        description: 'Acquired Immunodeficiency Syndrome'
    }
]

module.exports = {
    name: 'acronyms',
    aliases: ['whatyourkidsaretexting', 'acronym', 'slang', 'abbreviations'],
    description: 'get a list of common messaging acronyms or search over 1550',
    usage: '[acronym]',
    category: 'fun',
    async execute(client, message, args) {
        let fail_embed_color = parseInt((await getGlobalSetting('fail_embed_color'))[0].value);
        let darkred_embed_color = parseInt((await getGlobalSetting('darkred_embed_color'))[0].value);
        
        let acronymNames = acronyms.map(acro => acro.acronym);
        if (args.length) {
            if (acronymNames.includes(args.join(" ").toUpperCase())) {
                let reqAcro = acronyms[acronymNames.indexOf(args.join(" ").toUpperCase())];
                return message.channel.send({
                    embed: {
                        color: darkred_embed_color,
                        description: `\`${reqAcro.acronym}\` 🔹 ${reqAcro.description}`
                    }
                }).catch(xlg.error);
            } else {
                return message.channel.send({
                    embed: {
                        color: fail_embed_color,
                        description: 'that acronym could not be found <3'
                    }
                }).catch(xlg.error);
            }
        }
        return message.channel.send({
            embed: {
                color: darkred_embed_color,
                title: 'what your child is texting',
                description: commonAcronyms.map(acro => `🔹 \`${acro.acronym}\` ⁞ ${acro.description}`).join("\n"),
                footer: {
                    text: 'pog common acronyms'
                }
            }
        }).catch(xlg.error);
    }
}