import { Command } from "src/gm";
import xlg from "../xlogger";
//import { getGlobalSetting } from "../dbmanager";

export const command: Command = {
    name: 'howtogoogle',
    description: 'get advanced google search help',
    aliases: ['advgoogle', 'advsearch', 'googlehelp'],
    async execute(client, message) {
        const helptext = "__**Refine web searches**__\n\nYou can use symbols or words in your search to make your search results more precise.\n\n- Google Search usually ignores punctuation that isn’t part of a search operator.\n- Don’t put spaces between the symbol or word and your search term. A search for `site:nytimes.com` will work, but `site: nytimes.com` won’t.\n\n__**Refine image searches**__\n\n**Overall Advanced Search**\n- Go to *Advanced Image Search*.\n- Use filters like region or file type to narrow your results.\n- At the bottom, click *Advanced Search*.\n\n**Search for an exact image size**\nRight after the word you're looking for, add the text `imagesize:widthxheight`. Make sure to add the dimensions in pixels.\nExample: `imagesize:500x400`\n\n__**Common search techniques**__\n\n**Search social media**\nPut `@` in front of a word to search social media. For example: `@twitter`.\n\n**Search for a price**\nPut `$` in front of a number. For example: `camera $400`.\n\n**Search hashtags**\nPut `#` in front of a word. For example: `#throwbackthursday`\n\n**Exclude words from your search**\nPut `-` in front of a word you want to leave out. For example, `jaguar speed -car`\n\n**Search for an exact match**\nPut a word or phrase inside quotes. For example, `\"tallest building\"`.\n\n**Search within a range of numbers**\nPut `..` between two numbers. For example, `camera $50..$100`.\n\n**Combine searches**\nPut `\"OR\"` between each search query. For example, `marathon OR race`.\n\n**Search for a specific site**\nPut `\"site:\"` in front of a site or domain. For example, `site:youtube.com` or `site:.gov`.\n**Search for related sites**\nPut `\"related:\"` in front of a web address you already know. For example, `related:time.com`.\n\n**See Google’s cached version of a site**\nPut `\"cache:\"` in front of the site address.\n\n**Important:** Not all search operators return exhaustive results.";
        message.channel.send({
            embed: {
                color: await client.database?.getColor("info_embed_color"),
                title: "Search Google *Advanced*",
                description: helptext,
                footer: {
                    text: "Google Support",
                    iconURL: "https://lh3.googleusercontent.com/4_uYRyYSc0QNUE5vCtpfL-FQ9BfOwPabK0dvsLg1CCbj6O_6BKG8NAMC5fJ202ht7Pc=w96"
                }
            }
        }).catch(xlg.error);
    }
}

