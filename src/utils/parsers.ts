// THANK YOU BULLETBOT, A LOT OF THE BASE CODE FOR THESE PARSERS CAME FROM THAT REPO, THEY ARE VERY HELPFUL
// https://www.npmjs.com/package/string-similarity

import { Guild, GuildChannel, GuildMember, Message, MessageEmbed, MessageEmbedOptions, Role, Snowflake, ThreadChannel, User } from "discord.js";
import { CommandArgumentFlag, XClient } from "src/gm";
import { isSnowflake } from "./specials.js";

/**
 * Returns similarity value based on Levenshtein distance.
 * The value is between 0 and 1
 *
 * @param s1 first string
 * @param s2 second string
 * @returns
 */
export function stringSimilarity(s1: string, s2: string): number {
    let longer = s1;
    let shorter = s2;
    if (s1.length < s2.length) {
        longer = s2;
        shorter = s1;
    }
    const longerLength = longer.length;
    if (longerLength == 0) {
        return 1.0;
    }
    return (longerLength - editDistance(longer, shorter)) / parseFloat(longerLength.toString());
}

/**
 * helper function for stringSimilarity
 *
 * @param s1
 * @param s2
 * @returns
 */
function editDistance(s1: string, s2: string) {
    s1 = s1.toLowerCase();
    s2 = s2.toLowerCase();

    const costs = [];
    for (let i = 0; i <= s1.length; i++) {
        let lastValue = i;
        for (let j = 0; j <= s2.length; j++) {
            if (i == 0)
                costs[j] = j;
            else {
                if (j > 0) {
                    let newValue = costs[j - 1];
                    if (s1.charAt(i - 1) != s2.charAt(j - 1))
                        newValue = Math.min(Math.min(newValue, lastValue),
                            costs[j]) + 1;
                    costs[j - 1] = lastValue;
                    lastValue = newValue;
                }
            }
        }
        if (i > 0)
            costs[s2.length] = lastValue;
    }
    return costs[s2.length];
}

/**
 * Executes a RegExp on a string and returns last result of first search if successful
 *
 * @param str String to search in
 * @param regex RegExp to search with
 * @returns
 */
export function extractString(str: string, regex: RegExp): string | undefined {
    const result = regex.exec(str);
    if (!result)
        return undefined;
    return result[result.length - 1];
}

/**
 * Extracts the id from a string and the fetches the User
 *
 * @export
 * @param client the client
 * @param text Text to extract id from
 * @returns User
 */
export async function stringToUser(client: XClient, text: string): Promise<User | undefined> {
    text = extractString(text, /<@!?(\d*)>/) || text;
    try {
        return isSnowflake(text) ? await client.users.fetch(text) || undefined : undefined;
    } catch (e) {
        return undefined;
    }
}

/**
 * Parses string into GuildMember object.
 * If the username isn't accurate the function will use the stringSimilarity method.
 * Can parse following inputs:
 * - user mention
 * - username
 * - nickname
 * - user id
 * - similar username
 *
 * @export
 * @param guild guild where the member is in
 * @param text string to parse
 * @param byUsername if it should also search by username (default true)
 * @param byNickname if it should also search by nickname (default true)
 * @param bySimilar if it should also search by similar username (default true)
 * @returns
 */
export async function stringToMember(guild: Guild, text: string, byUsername = true, byNickname = true, bySimilar = true): Promise<GuildMember | undefined> {
    if (!text) return undefined;
    text = extractString(text, /<@!?(\d*)>/) || extractString(text, /([^#@:]{2,32})#\d{4}/) || text;

    // guild.members.cache = await guild.members.fetch();

    // by id
    try {
        let member = guild.members.cache.get(text as Snowflake);
        if (!member && byUsername)
        // by username
        member = guild.members.cache.find(x => x.user.username == text || x.user.tag == text);
        if (!member && byNickname)
        // by nickname
        member = guild.members.cache.find(x => x.nickname == text);
        
        if (!member && bySimilar) {
            // closest matching username
            member = guild.members.cache.reduce((prev, curr) => {
                return (stringSimilarity(curr.user.username, text) > stringSimilarity(prev?.user.username || "", text) ? curr : prev);
            });
            if (stringSimilarity(member?.user.username || "", text) < 0.4) {
                member = undefined;
            }
        }
        if (!member) {
            member = await guild.members.fetch(text as Snowflake);
        }
        return member;
    } catch (error) {
        xlg.error(`Err while parsing (stringToMember): `, error);
        return;
    }
}

/**
 * Parses a string into a Role object or a String for 'everyone' or 'here'.
 * If the role name isn't accurate the function will use the stringSimilarity method.
 * Can parse following input:
 * - here / everyone name
 * - @here / @everyone mention
 * - role name
 * - role mention
 * - role id
 * - similar role name
 *
 * @export
 * @param guild guild where the role is in
 * @param text string to parse
 * @param [byName=true] if it should also search by name (default true)
 * @param [bySimilar=true] if it should also search by similar name (default true)
 * @returns
 */
export function stringToRole(guild: Guild, text: string, byName = true, bySimilar = true): Role | undefined {
    text = extractString(text, /<@&(\d*)>/) || text;

    // by id
    let role = guild.roles.cache.get(text as Snowflake);
    if (!role && byName) {
        // by name
        role = guild.roles.cache.find(x => x.name == text);
    }
    if (!role && bySimilar) {
        // closest matching name
        role = guild.roles.cache.reduce((prev, curr) => {
            return (stringSimilarity(curr.name, text) > stringSimilarity(prev?.name || "", text) ? curr : prev);
        });
        if (stringSimilarity(role?.name || "", text) < 0.4) {
            role = undefined;
        }
    }
    return role;
}

/**
 * Parses a string into a Channel object.
 * Can parse following input:
 * - channel mention
 * - channel id
 * - channel name
 * - similar channel name
 *
 * @export
 * @param guild guild where channel is in
 * @param text string to parse
 * @returns
 */
export function stringToChannel(guild: Guild, text: string, byName = true, bySimilar = true): GuildChannel | ThreadChannel | undefined {
    if (!guild || !text) return undefined;
    text = extractString(text, /<#(\d*)>/) || text;

    let channel = guild.channels.cache.get(text as Snowflake);
    if (!channel && byName) channel = guild.channels.cache.find(x => x.name == text);
    if (!channel && bySimilar) {
        // closest matching name
        channel = guild.channels.cache.reduce((prev, curr) => {
            return (stringSimilarity(curr.name, text) > stringSimilarity(prev?.name || "", text) ? curr : prev);
        });
        if (stringSimilarity(channel?.name || "", text) < 0.4) {
            channel = undefined;
        }
    }
    return channel;
}

/**
 * Parses a string into a JSON object for Embed.
 *
 * @export
 * @param text string to parse
 * @returns
 */
export function stringToEmbed(text: string): MessageEmbed | null {
    let embed = null;
    try {
        //text = text.replace(/(\r\n|\n|\r|\t| {2,})/gm, '');
        embed = JSON.parse(text);
    } catch (e) {
        return null;
    }
    return embed
}

/**
 * converts milliseconds into a string. Examples:
 * - 3m 4s
 * - 20d 30m
 * - 0s
 * - 1d 1h 1m 1s
 *
 * @export
 * @param duration duration in milliseconds
 * @returns
 */
export function durationToString(duration: number): string {

    const ms = duration % 1000;
    duration = (duration - ms) / 1000;
    const seconds = duration % 60;
    duration = (duration - seconds) / 60;
    const minutes = duration % 60;
    duration = (duration - minutes) / 60;
    const hours = duration % 24;
    duration = (duration - hours) / 24;
    const days = duration % 365;
    duration = (duration - days) / 365;
    const years = duration;

    let durationString = '';

    if (years != 0) durationString += `${years} ${years > 1 ? "years" : "year"} `;
    if (days != 0) durationString += `${days} ${days > 1 ? "days" : "day"} `;
    if (hours != 0) durationString += `${hours} ${hours > 1 ? "hours" : "hour"} `;
    if (minutes != 0) durationString += `${minutes} ${minutes > 1 ? "minutes" : "minute"} `;
    if (seconds != 0) durationString += `${seconds} ${seconds > 1 ? "seconds" : "second"}`;

    if (durationString == '') durationString = '0s';

    return durationString.trim();
}

export function parseFriendlyUptime(t: { hours: number, minutes: number, seconds: number, days: number, milliseconds: number }): string {
    const th = t.hours + (t.days * 24);
    const tm = t.minutes;
    const ts = Math.ceil(t.seconds + (t.milliseconds / 1000));
    const ttypes = ["hours", "minutes", "seconds"];
    if (!th)
        ttypes.splice(ttypes.indexOf("hours"), 1);
    if (!tm)
        ttypes.splice(ttypes.indexOf("minutes"), 1);
    if (!ts)
        ttypes.splice(ttypes.indexOf("seconds"), 1);
    const tt = [th, tm, ts].filter(x => x > 0).map((x, i, xt) => {
        return `${x} ${ttypes[i]}${i !== (xt.length - 1) ? (xt.length > 1 && xt.length - 2 === i ? `${xt.length > 2 ? "," : ""} and ` : ", ") : ""}`;
    });
    return tt.join("");
}

/**
 * Convert a string to title case (capitalize every word split by a delimiter)
 * @param str The string to onvert to title case
 * @param altDelim A delimiter regex to use contrary to the default " "
 * @returns A string in titlecase
 */
export function titleCase(str: string, altDelim?: RegExp): string {
    if (str === "nsfw") {
        return "NSFW";
    }
    const splitStr = str.toLowerCase().split(altDelim ?? ' ');
    for (let i = 0; i < splitStr.length; i++) {
        // You do not need to check if i is larger than splitStr length, as your for does that for you
        // Assign it back to the array
        splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
    }
    // Directly return the joined string
    return splitStr.join(' ');
}

/**
 * Capitalizes the first letter in a string
 * @param string String to capitalize
 */
export function capitalize(str: string | undefined): string {
    const s = str || "";
    if (!s[0]) {
        return s;
    }
    return s[0].toUpperCase() + s.substring(1);
}


export function randomIntFromInterval(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

/**
 * Parse hyphen flagged options that occur at the beginning of an options array
 */
export function parseOptions(opts: string[]): string[] {
    const n = opts.reduce((p, c, ci) => {
        const condition = (pcv: string) => pcv.startsWith("-") && pcv.length < 20;
        if (p.length === ci && condition(c)) {
            //useArgs.push(c);
            p.push(c);
        }
        return p;
    }, <string[]>[]);
    opts.splice(0, n.length);
    return n;
}

/**
 * Parse hyphen flagged arguments that occur at the beginning of a string
 *
 * const flags = parseLongArgs(args);
 * args = args.join(" ").slice(flags.taken.join(" ").length).trim().split(" ");// trim the provided argument array to disclude the parsed flags
 * @param toParse the pre-split arguments (assuming space delimited) from commands
 * @returns a list of specified options
 */
export function parseLongArgs(toParse: string[]): { flags: CommandArgumentFlag[], taken: string[] } {
    // a side effect of the regex i chose to use is the possible return of flag values wrapped in double quotations
    // the fat is trimmed below in the exec loop
    const a = toParse.join(" ");
    const opts: CommandArgumentFlag[] = [];
    // const matcher = /(?<!.)--?([A-Za-z]){1,30}(?:=("[\w\s]*"|[\w]+))?(?![^\s])/g;// x.replace(/^"(x*)"$/, "{0}")
    const matcher = /(?<![^\s])--?([A-Za-z]{1,100})(?:=("[\w\s<@#&!>$*()\-=+^%:';[\]{}\\|\u{1f300}-\u{1f5ff}\u{1f900}-\u{1f9ff}\u{1f600}-\u{1f64f}\u{1f680}-\u{1f6ff}\u{2600}-\u{26ff}\u{2700}-\u{27bf}\u{1f1e6}-\u{1f1ff}\u{1f191}-\u{1f251}\u{1f004}\u{1f0cf}\u{1f170}-\u{1f171}\u{1f17e}-\u{1f17f}\u{1f18e}\u{3030}\u{2b50}\u{2b55}\u{2934}-\u{2935}\u{2b05}-\u{2b07}\u{2b1b}-\u{2b1c}\u{3297}\u{3299}\u{303d}\u{00a9}\u{00ae}\u{2122}\u{23f3}\u{24c2}\u{23e9}-\u{23ef}\u{25b6}\u{23f8}-\u{23fa}]*"|[\w<@#&!>$*()\-=+^%:';[\]{}\\|\u{1f300}-\u{1f5ff}\u{1f900}-\u{1f9ff}\u{1f600}-\u{1f64f}\u{1f680}-\u{1f6ff}\u{2600}-\u{26ff}\u{2700}-\u{27bf}\u{1f1e6}-\u{1f1ff}\u{1f191}-\u{1f251}\u{1f004}\u{1f0cf}\u{1f170}-\u{1f171}\u{1f17e}-\u{1f17f}\u{1f18e}\u{3030}\u{2b50}\u{2b55}\u{2934}-\u{2935}\u{2b05}-\u{2b07}\u{2b1b}-\u{2b1c}\u{3297}\u{3299}\u{303d}\u{00a9}\u{00ae}\u{2122}\u{23f3}\u{24c2}\u{23e9}-\u{23ef}\u{25b6}\u{23f8}-\u{23fa}]+))?(?![^\s])/gu;// x.replace(/^"(x*)"$/, "{0}")
    // const matcher = /(?<![^\s])--?([A-Za-z]{1,100})(?:=(?:"([\w\s<@#&!>$*()\-=+^%:';[\]{}\\|]*)"|([\w<@#&!>$*()\-=+^%:';[\]{}\\|]+)))?(?![^\s])/g;// this regex will not return any flag values wrapped in  
    let match;
    let matchCycle = 0;
    let currentStartingIndex = 0;
    const taken: string[] = [];
    while ((match = matcher.exec(a)) !== null) {// getting the next flag match
        if (!matchCycle && match.index) {// if the match begins at a non-zero index, but there have not been previous matches in front of it
            break;
        }
        if (new RegExp(matcher).exec(a.slice(currentStartingIndex).trim())?.index) {// if the current match does not begin after some non-matching material
            // (i assume, i did not write down the process when i initially scripted this)
            break;
        }
        const g1 = match[1] || "";
        const g2 = match[2] ? match[2].replace(/^"(.*)"$/, "$1") : "";
        const numVal = g2 && /^(?:[0-9]+(?:\.[0-9]+)?|0x[0-9A-Za-z]{6})$/.test(g2) ? /^[0-9]+(?:\.[0-9]+)?$/.test(g2) ? parseInt(g2, 10) : parseInt(g2, 16) : 0;
        opts.push({
            name: g1,
            value: g2,
            numberValue: numVal,
        });
        // a = a.slice(match.index + match[0].length)
        taken.push(match[0]);
        matchCycle++;
        currentStartingIndex = match.index + match[0].length;
    }
    // toParse = toParse.slice(taken.join(" ").length - 1);// trim the provided argument array to disclude the parsed flags
    // toParse = toParse.join(" ").slice(taken.join(" ").length).trim().split(" ");
    // ^ apparently this reference ends at reassignment
    return { flags: opts, taken: taken };
}

/**
 * Get the suffix of any given number combined with the number.
 * @param i number to get suffix of
 * @returns number with suffix attached
 */
export function ordinalSuffixOf(i: number): string {
    const j = i % 10,
        k = i % 100;
    if (j == 1 && k != 11) {
        return i + "st";
    }
    if (j == 2 && k != 12) {
        return i + "nd";
    }
    if (j == 3 && k != 13) {
        return i + "rd";
    }
    return i + "th";
}

// title ?: string;
// description ?: string;
// url ?: string;
// timestamp ?: Date | number;
// color ?: ColorResolvable;
// fields ?: EmbedFieldData[];
// files ?: (MessageAttachment | string | FileOptions)[];
// author ?: Partial<MessageEmbedAuthor> & { icon_url?: string; proxy_icon_url?: string };
// thumbnail ?: Partial<MessageEmbedThumbnail> & { proxy_url?: string };
// image ?: Partial<MessageEmbedImage> & { proxy_url?: string };
// video ?: Partial<MessageEmbedVideo> & { proxy_url?: string };
// footer ?: Partial<MessageEmbedFooter> & { icon_url?: string; proxy_icon_url?: string };

// export function conformsToField(o: any): o is EmbedFieldData {
//     if (typeof o === "undefined") {
//         return true;
//     }
//     return 'name' in o && 'value' in o && typeof o.name === "string" && typeof o.value === "string" && (typeof o.inline === "undefined" || typeof o.inline === "boolean");
// }

// export function conformsToFooter(o: any): o is MessageEmbedFooter {
//     return true;
// }

// // eslint-disable-next-line @typescript-eslint/no-explicit-any
// export function conformsToEmbed(o: Record<string, any>): o is MessageEmbedOptions {
//     if (typeof o !== "object") {
//         return false;
//     }
//     const isTitle = typeof o.title === "string" || typeof o.title === "undefined";
//     const isDescription = typeof o.description === "string" || typeof o.description === "undefined";
//     const isURL = typeof o.url === "string" || typeof o.url === "undefined";
//     const isTimestamp = typeof o.timestamp === "number" || o.timestamp instanceof Date || typeof o.timestamp === "undefined";
//     const isColor = typeof o.color === "undefined" || !!Util.resolveColor(o.color);
//     const isFields = typeof o.fields === "undefined" || ('fields' in o && Array.isArray(o.fields) && o.fields.every((x) => conformsToField(x)));
//     const isFooter = typeof o.footer === "undefined" || conformsToFooter(o.footer);
//     return isTitle && isDescription && isURL && isTimestamp && isColor && isFields;
// }

/**
 * Turn a normal message from discord into a single string of text, this will join elements like strings in embeds together into a more parseable form
 * @param m the message to parse
 * @returns a string representing the entire message
 */
export function combineMessageText(m: Message, space = 0): string {
    let t = "";
    if (m.content) {
        t += m.content;
    }
    if (m.embeds && m.embeds.length && m.embeds[0]) {
        const e = m.embeds[0];
        const combinedEmbed = combineEmbedText(e, space);
        if (combinedEmbed) {
            t += combinedEmbed;
        }
    }
    return t;
}

export function combineEmbedText(e: MessageEmbedOptions | MessageEmbed, space = 0): string {
    let t = "";
    if (e.author && e.author.name) {
        if (space) {
            t += space === 1 ? " " : "\n";
        }
        t += e.author.name;
    }
    if (e.title) {
        if (space) {
            t += space === 1 ? " " : "\n";
        }
        t += e.title;
    }
    if (e.description) {
        if (space) {
            t += space === 1 ? " " : "\n";
        }
        t += e.description;
    }
    if (e.fields && e.fields.length) {
        e.fields.forEach(f => {
            if (f.name) {
                if (space) {
                    t += space === 1 ? " " : "\n";
                }
                t += f.name;
            }
            if (f.value) {
                if (space) {
                    t += space === 1 ? " " : "\n";
                }
                t += f.value;
            }
        });
    }
    if (e.footer) {
        if (e.footer.text) {
            if (space) {
                t += space === 1 ? " " : "\n";
            }
            t += e.footer.text;
        }
    }
    return t;
}
