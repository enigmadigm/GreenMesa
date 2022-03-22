import { ClientValuesGuild, DashboardMessage, GuildMessageProps, SkeletonGuildObject, SkeletonRole, XClient, XMessage } from '../gm';
import moment from 'moment';
import { ButtonInteraction, Channel, Collection, CollectorFilter, DMChannel, GuildChannel, GuildMember, Message, MessageActionRow, MessageButton, MessageComponentInteraction, MessageEmbed, MessageEmbedOptions, NewsChannel, PartialDMChannel, Permissions, Snowflake, TextChannel, ThreadChannel } from 'discord.js';
import { Bot } from "../bot.js";
import { combineEmbedText } from './parsers.js';
import { MessageButtonStyles } from 'discord.js/typings/enums';
import { MysqlError } from 'mysql';

export async function sendModerationDisabled(channel: Channel ): Promise<void> {
    if (!channel.isText() || !('guild' in channel)) return;
    const fail_embed_color = await Bot.client.database.getColor("fail");
    await channel.send({
        embeds: [{
            color: fail_embed_color,
            description: `Server moderation in ${channel.guild.name.escapeDiscord()} is currently disabled. Admins must enable moderation features with \`settings moderation enable\`.`
        }]
    });
}

export async function sendError(channel: TextChannel | DMChannel | PartialDMChannel | NewsChannel | ThreadChannel, message?: string, errorTitle: string | boolean = false): Promise<Message> {
    return await channel.send({
        embeds: [{
            color: await Bot.client.database.getColor("fail") || 16711680,
            title: errorTitle ? typeof errorTitle === "string" ? errorTitle : "Error" : undefined,
            description: (message && message.length) ? message : "Something went wrong. ¯\\_(ツ)_/¯"
        }]
    });
}

export async function sendInfo(channel: TextChannel | DMChannel | PartialDMChannel | NewsChannel | ThreadChannel, message: string): Promise<Message> {
    return await channel.send({
        embeds: [{
            color: 0x337fd5/* await Bot.client.database.getColor("info") */,
            description: `<:sminfo:818342088088354866> ${message}`
        }]
    });
}

/**
 * Ensure that the specified number of args is provided by the user. Returns false if not and sends a message in the given channel.
 * 
 * @deprecated Use built-in command feature instead
 */
export async function argsNumRequire(channel: Channel | PartialDMChannel, args: string[], num: number): Promise<boolean> {
    try {
        if (!channel.isText()) return false;
        if (args.length == num) return true;
        const fail_embed_color = await Bot.client.database.getColor("fail");
        channel.send({
            embeds: [{
                color: fail_embed_color,
                description: `The wrong number of arguments was provided.\nThis command requires \` ${num} \` arguments.`
            }]
        });
        return false;
    } catch (error) {
        xlg.error(error);
        return false;
    }
}

export async function argsMustBeNum(channel: Channel | PartialDMChannel, args: string[]): Promise<boolean> {
    try {
        if (!channel.isText()) return false;
        if (!args || !args.length) return false;
        let forResult = true;
        const invalid: string[] = [];// there should only really be one or zero entries
        for (let i = 0; i < args.length; i++) {
            const arg = args[i];
            if (!/^-?[0-9]+(?:\.[0-9]+)?$/.test(arg)) {
                forResult = false;
                invalid.push(arg);
                break;
            }
            const nr = parseInt(arg, 10);
            if (isNaN(nr) || nr > Number.MAX_SAFE_INTEGER || nr < Number.MIN_SAFE_INTEGER) {// if the arg is not a valid number or it is too big
                forResult = false;
                invalid.push(arg);
                break;
            }
        }
        if (!forResult) {
            await channel.send({
                embeds: [{
                    color: await Bot.client.database.getColor("fail"),
                    title: "Invalid Arguments",
                    description: `Some or all arguments must be numbers (floating or integer)\nYou sent: \` ${invalid.map(x => x.escapeDiscord()).join(", ")} \``,
                }],
            });
            return false;
        }
        return true;
    } catch (error) {
        xlg.error(error);
        return false;
    }
}

/**
 * Send a confirmation message that uses buttons to draw a positive negative response
 * @param channel The channel to send the confirmation message in
 * @param acceptFrom A list of user IDs that should be accepted from responses
 * @param text The confirmation question text (overrides default)
 * @param confirmationMessage The text on positive confirmation (overrides default)
 * @param rejectionMessage The text on negative confirmation (overrides default)
 * @param adminOverride Should admin permissions override  (default False)
 * @returns the result of the confirmation
 */
export async function getUserConfirmation(channel: TextChannel | DMChannel | PartialDMChannel | NewsChannel | ThreadChannel, acceptFrom: Snowflake[], text = "Please confirm", confirmationMessage = "**Confirmed**", rejectionMessage = "**Aborted**", adminOverride = false): Promise<{ end: boolean, msg: Message | null, inter: ButtonInteraction | null }> {
    const cm = await channel.send({
        embeds: [{
            color: 0x337fd5/* await Bot.client.database.getColor("info") */,
            description: `<:sminfo:818342088088354866> ${text}`
        }],
        components: [new MessageActionRow().addComponents(new MessageButton({ customId: "yes", label: "Yes", style: MessageButtonStyles.SUCCESS }), new MessageButton({ customId: "no", label: "No", style: MessageButtonStyles.DANGER }))],
    });
    const alreadyShovedOff: Snowflake[] = [];
    const pushFilter: CollectorFilter<[MessageComponentInteraction]> = async (inter) => {// filters button clicks to ensure only authorized users are permitted to confirm
        if (inter.isButton()) {
            if (
                acceptFrom.includes(inter.user.id) ||
                (adminOverride && inter.member?.permissions instanceof Permissions && (inter.member.permissions.bitfield & 0x8n) === 0x8n)
            ) {
                return true;
            } else {
                if (!alreadyShovedOff.includes(inter.user.id)) {
                    await inter.reply({
                        content: `Mommy says I'm not supposed to talk to you`,
                        ephemeral: true,
                    });
                    alreadyShovedOff.push(inter.user.id);
                } else {
                    await inter.deferUpdate();
                }
                return false;
            }
        } else {
            return false;
        }
    };
    // const pushes = await cm.awaitMessageComponentInteraction({filter: pushFilter, time: 10 * 1000});
    const buttonOption = await cm.awaitMessageComponent({ filter: pushFilter, time: 10 * 1000 }).catch(() => undefined);// wait for responses to the confirmation buttons
    if (!buttonOption || !buttonOption.isButton()) {
        await cm.edit({ embeds: [new MessageEmbed(cm.embeds[0]).setDescription(`**No confirmation**`).setColor(await Bot.client.database.getColor("fail"))], components: [] });
        return { end: false, msg: !cm.deleted ? cm : null, inter: null };
        // return { end: false, msg: cm.deleted ? cm : null, inter: null };
    }
    if (buttonOption.customId === "yes") {
        if (confirmationMessage) {
            await cm.edit({ embeds: [new MessageEmbed(cm.embeds[0]).setDescription(confirmationMessage).setColor(await Bot.client.database.getColor("success"))], components: [] });
        } else if (cm.deletable) {
            await cm.delete();
        }
        return { end: true, msg: !cm.deleted ? cm : null, inter: buttonOption };
        // return { end: true, msg: cm.deleted ? cm : null, inter: buttonOption };
    }
    if (rejectionMessage) {
        await cm.edit({ embeds: [new MessageEmbed(cm.embeds[0]).setDescription(rejectionMessage).setColor(await Bot.client.database.getColor("fail"))], components: [] });
    } else if (cm.deletable) {
        await cm.delete();
    }
    return { end: false, msg: !cm.deleted ? cm : null, inter: buttonOption };
    // return { end: false, msg: cm.deleted ? cm : null, inter: buttonOption };
}

export function timedMessagesHandler(client: XClient): void {//TODO: make this a real handler, integrate with cronjobs or timedactions or something
    setInterval(async () => {
        if (moment().utcOffset(-5).format('M/D HH:mm') == "9/26 21:30") {
            const pcr = await client.database.getGlobalSetting('primchan');
            const primchan = pcr ? await client.channels.fetch(pcr.value as Snowflake) : false;
            if (primchan instanceof TextChannel) {
                primchan.send('happy birthday');
            }
        }
        if (moment().utcOffset(-6).format('M/D HH:mm') == "1/1 00:00") {
            const pcr = await client.database.getGlobalSetting('primchan');
            const primchan = pcr ? await client.channels.fetch(pcr.value as Snowflake) : false;
            if (primchan instanceof TextChannel) {
                primchan.send("Welcome to the New Year (CST) @everyone");
            }
        }
    }, 60000);
}

/*interface MemTypes {
    rss: string;
    heapTotal: string;
    heapUsed: string;
    external: string;
    arrayBuffers: string;
}*/

export function memoryUsage(): string {
    const memTypes = {
        "rss": "RSS ---------------",
        "heapTotal": "HeapTotal ---------",
        "heapUsed": "HeapUsed ----------",
        "external": "External ----------",
        "arrayBuffers": "ArrayBuffers ------"
    };
    return Object.entries(process.memoryUsage()).map(usage => {
        const u = usage[0];
        if (u !== "rss" && u !== "heapTotal" && u !== "heapUsed" && u !== "external" && u !== "arrayBuffers") return;
        const r = (Math.round(usage[1] / 1024 / 1024 * 100) / 100).toFixed().split('.')[0];
        return `${memTypes[u]} ${r}MB`
    }).join("\n");
}

// iannis
/*export function delayedLoop(callback: (arg0: number) => void, start = 0, end = 1, increment = 1, delay = 0): void {
    let i = start;

    const iteration = () => {
        callback(i);
        i += increment;
        if (i < end) setTimeout(iteration, delay);
    }

    iteration();
}*/

/**
 * Get an accurate and universal link to the web dashboard
 */
export function getDashboardLink(guildid?: string, mod?: string): string {
    return `${process.env.DASHBOARD_HOST}/dash/${guildid}${guildid && mod ? `/${mod}` : ""}`
}

/**
 * Get the base URI for the website
 */
export function getBackendRoot(): string {
    return process.env.NODE_ENV === "dev" ? 'http://localhost:3005' : `https://stratum.hauge.rocks`;
}


/**
 * Get the true link to the support server
 */
export function getSupportServer(embed = false): string {
    const link = `https://discord.gg/AvXvvSg`;
    return embed ? `[support server](${link})` : `${link}`;
}

/**
 * Tests whether a string is a stringified 18 character BigInt
 */
export function isSnowflake(o: string): o is Snowflake {
    return (/^[0-9]{18}$/.test(o));
}

/**
 * Tests whether a message has the properties identifying it as inside a guild
 */
export function isGuildMessage (o: XMessage): o is XMessage & GuildMessageProps {
    return o.channel instanceof GuildChannel || o.channel instanceof ThreadChannel;
}

export const shards = {
    /**
     * Send a message through all of the sharded clients that will send from the client that has the desired channel
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    sendMessageAll(m: Record<string, any>, cid: Snowflake): void {
        if (Bot.client.shard) {
            Bot.client.shard.broadcastEval((client, { m, cid }) => {
                const c = client.channels.cache.get(cid);
                if (c && c.isText()) {
                    c.send(JSON.stringify(m))
                }
            }, { context: { m, cid } });
        }
    },
    /**
     * Retrieves all of the guilds that belonging to a client if the client is sharded. It will asynchronously fetch all guilds from each of the shards and reduce them to one array. The values returned from the shards are not normal guild objects. They are reduced guild object.
     * @param client the client to retrieve the guilds from
     * @returns all guilds cached in the client's shards
     */
    async getAllGuilds(): Promise<ClientValuesGuild[] | false> {
        if (!Bot.client.shard) {
            return false;
        }
        const reductionFunc = (p: ClientValuesGuild[], c: ClientValuesGuild[]) => {
            for (const bg of c) {
                p.push(bg);
            }
            return p;
        };
        const values = await <Promise<ClientValuesGuild[][]>>Bot.client.shard.fetchClientValues("guilds.cache");
        if (!values) {
            return false;
        }
        const guilds = values.reduce(reductionFunc, <ClientValuesGuild[]>[]);
        if (!guilds) {
            return false;
        }
        return guilds;
    },
    async getAllChannels(): Promise<Channel[] | false> {
        if (!Bot.client.shard) {
            return false;
        }
        const reductionFunc = (p: Channel[], c: Channel[]): Channel[] => {
            for (const chan of c) {
                p.push(chan);
            }
            return p;
        };
        const clientValuesResponse = <Channel[][]>(await Bot.client.shard.fetchClientValues("channels.cache"));//TODO: does this break?
        const channels = clientValuesResponse?.reduce(reductionFunc, []);
        if (!channels) {
            return false;
        }
        return channels;
    },
    async getGuildRoles(gid: Snowflake): Promise<SkeletonRole[] | false> {
        if (!Bot.client.shard) {
            return false;
        }
        const roles = await Bot.client.shard.broadcastEval((client, { gid }) => {
            try {
                const g = client.guilds.cache.get(gid);
                if (g) {
                    const roles: SkeletonRole[] = g.roles.cache
                        .filter(x => !x.deleted)
                        .map(x => {
                            return {
                                id: x.id,
                                color: x.color,
                                hexColor: x.hexColor,
                                position: x.rawPosition,
                                hoist: x.hoist,
                                createdTimestamp: x.createdTimestamp,
                                name: x.name,
                                mentionable: x.mentionable,
                                editable: x.editable,
                            };
                        });
                    return roles;
                }
                return [];
            } catch (error) {
                //
            }
        }, { context: { gid } });
        const availableRoles: SkeletonRole[] = [];
        for (const ra of roles) {
            if (ra && ra.length) {
                for (const r of ra) {
                    availableRoles.push(r);
                }
            }
        }
        return availableRoles;
    },
    async getMutualGuilds(uid: Snowflake): Promise<SkeletonGuildObject[] | false> {
        if (!Bot.client.shard) {
            return false;
        }
        // const getMutual = function (c: Client): SkeletonGuildObject[] | void {
        //     try {
        //         console.log("called:",uid)
        //         const mutualGuilds: SkeletonGuildObject[] = c.guilds.cache.filter(x => !!x.members.cache.get(uid)).map(x => {
        //             return {
        //                 name: x.name,
        //                 id: x.id,
        //                 icon: x.iconURL(),
        //                 owner: x.ownerID,
        //             }
        //         });
        //         return mutualGuilds;
        //     } catch (error) {
        //         //
        //     }
        // };
        const r: (SkeletonGuildObject[] | void)[] = await Bot.client.shard.broadcastEval((client, id) => {
            try {
                const mutualGuilds: SkeletonGuildObject[] = client.guilds.cache
                    .filter(x => !!x.members.cache.get(id))
                    .map(x => {
                        return {
                            name: x.name,
                            id: x.id,
                            icon: x.iconURL(),
                            owner: x.ownerId,
                        }
                });
                return mutualGuilds;
            } catch (error) {
                //
            }
        }, { context: uid });
        const mut: SkeletonGuildObject[] = [];
        for (const ga of r) {
            if (ga) {
                for (const g of ga) {
                    mut.push(g);
                }
            }
        }
        return mut;
        // return false;
    },
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isDashboardMessage(o: Record<string, any>): o is DashboardMessage {
    return typeof o.add_channel === "string"
        && typeof o.dm_channel === "string"
        && typeof o.depart_channel === "string"
        && 'add_message' in o
        && 'dm_message' in o
        && 'depart_message' in o;
}

type MC = { content: string | undefined, embed: MessageEmbed | undefined };
export function assembleDashboardMessage(m: DashboardMessage): MC {
    const e: MessageEmbedOptions = {
        author: {
            iconURL: m.embed.authoricon,
            name: m.embed.authorname,
        },
        thumbnail: {
            url: m.embed.thumbnailurl,
        },
        color: m.embed.color,
        url: m.embed.url,
        timestamp: m.embed.timestamp,
        title: m.embed.title,
        description: m.embed.description,
        fields: m.embed.fields?.map(x => {
            return { name: x.name, value: x.value, inline: x.inline };
        }),
        image: {
            url: m.embed.imageurl,
        },
        video: {
            url: m.embed.videourl,
        },
        footer: {
            text: m.embed.footertext,
            iconURL: m.embed.footericon,
        },
    };
    return {
        content: m.outside || undefined,
        embed: combineEmbedText(e).length ? new MessageEmbed(e) : undefined,
    };
}

export const ChannelTypeKey = {
    GUILD_CATEGORY: {
        pretty: "Category",
    },
    GUILD_VOICE: {
        pretty: "Voice",
        emoji: "<:voice_channel:828153551154315275>",
    },
    GUILD_STAGE_VOICE: {
        pretty: "Stage Voice",
        emoji: "<:voice_channel:828153551154315275>",
    },
    GUILD_STORE: {
        pretty: "Store",
        emoji: "<:text_channel:828153514315612230>",
    },
    GUILD_TEXT: {
        pretty: "Text",
        emoji: "<:text_channel:828153514315612230>",
    },
    GUILD_NEWS: {
        pretty: "News",
        emoji: "<:text_channel:828153514315612230>",
    },
    GUILD_NEWS_THREAD: {
        pretty: "News Thread",
        emoji: "<:text_channel:828153514315612230>",
    },
    GUILD_PRIVATE_THREAD: {
        pretty: "Private Thread",
        emoji: "<:text_channel:828153514315612230>",
    },
    GUILD_PUBLIC_THREAD: {
        pretty: "Public Thread",
        emoji: "<:text_channel:828153514315612230>",
    },
};

//  https://stackoverflow.com/a/42618403/10660033
export function isMysqlError(err: unknown): err is MysqlError {
    const e = err as Partial<MysqlError>;
    return 'code' in e && 'errno' in e && 'fatal' in e;
}

export function isNodeError(err: unknown): err is Error {
    const e = err as Partial<Error>;
    return 'name' in e && 'message' in e;
}

export function findLastMessage(member: GuildMember): Message | false {
    const lastChannel = member.guild.channels.cache.filter((c) => !!(c.isText() && c.messages.cache.find(m => m.author.id === member.id))).reduce<Collection<string, NewsChannel | TextChannel | ThreadChannel>>((p, c) => {
        const f = p.first();
        if (f && f.createdAt < c.createdAt) {
            p.delete(c.id);
            return p;
        } else {
            return p;
        }
    }).first();
    const lastMessage = lastChannel?.id ? lastChannel.messages.cache.find(m => m.author.id === member.id) : false;
    return lastMessage ? lastMessage : false;
}
