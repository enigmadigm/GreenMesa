import { Client, ClientEvents, Collection, Guild, GuildMember, Message, NewsChannel, PermissionString, PresenceStatusData, Snowflake, TextChannel, ThreadChannel } from "discord.js";
import { DBManager } from "./dbmanager";
import * as Specials from "./utils/specials";
import DiscordStrategy from 'passport-discord';
import { MessageServices } from "./services";
import Invites from "./struct/Invites";

export interface XClient extends Client {
    commands: Collection<string, Command>;
    categories: Collection<string, Category>;
    specials: typeof Specials;
    database: DBManager;
    services: MessageServices;
    msgLogging: boolean | string;
    invites: Invites;
}

// export type Command<T = Record<string, any>> = NormalCommand<T> | GuildCommand<T>;
// eslint-disable-next-line @typescript-eslint/ban-types
export type Command<T = {}> = BaseCommand<T> | GuildOnlyCommand<T>;

export interface BaseCommand<T> {
    name: string;
    /**
     * Alternate names to use to call the command
     */
    aliases?: string[];
    /**
     * The help description(s) displayed when calling the help command
     */
    description?: string | {
        short: string,
        long: string
    }
    /**
     * The flags that are allowed to be used for the command
     * 
     * if it is an empty array, all flags will be accepted
     * if it is not defined, no flags will be accepted and they will remain in the arguments array
     * if certain flags are specified in the definition array, only those flags will be allowed in the arguments
     */
    flags?: CommandFlagDefinition[];
    /**
     * NOT FOR NORMAL USE
     */
    category?: string;
    /**
     * Optional usage instructions for the command
     */
    usage?: string;
    /**
     * Options usage examples displayed with the help command
     * and when not being used correctly
     */
    examples?: string[];
    /**
     * Whether arguments should be required, or the number of
     * arguments needed
     * 
     * Flags ARE NOT args
     */
    args?: boolean | number;
    // specialArgs?: number;
    /**
     * The amount of time, in ms, that the user will need to
     * wait to use the command again
     */
    cooldown?: number;
    /**
     * The security level required on the user to execute the
     * command (higher meaning a greater amount of access needed).
     * 
     * Defaults to `'member'` level in guilds and `'trustedMember'` level in DMs.
     */
    permLevel?: number;
    /**
     * Whether the command should be treated as a moderation command
     * and require moderation to be active
     * 
     * This may also involve additional checks on the user in the feature
     */
    moderation?: boolean;
    /**
     * Whether the command should only by allowed to execute in guilds
     * 
     * Uses the {@link GuildMessageProps} type to accommodate for a message object that will definitely include guild info
     */
    guildOnly?: false;
    /**
     * @deprecated change the permissions to a higher level, this was just a shitty if true then don't execute implementation
     */
    ownerOnly?: boolean;
    /**
     * The discord permissions necessary to execute the command
     */
    permissions?: PermissionString[];
    /**
     * Whether the command executor should try to parse meaningful flags from the arguments
     */
    // acceptFlags?: boolean | string[];// i realized that the `flags` descriptor type can basically function the same
    // client: XClient, message: XMessage, args: string[]
    /**
     * The method that will be called to execute the command (what should provide the command's function)
     */
    execute(client: XClient, message: XMessage & T, args: string[], flags: (CommandArgumentFlag)[]): Promise<void | boolean | CommandReturnData>;
}

export interface GuildOnlyCommand<T> extends BaseCommand<T> {
    guildOnly: true;
    /**
     * The method that will be called to execute the command (what should provide the command's function)
     */
    execute(client: XClient, message: XMessage & GuildMessageProps & T, args: string[], flags: (CommandArgumentFlag)[]): Promise<void | boolean | CommandReturnData>;
}

// export interface GuildCommand<T> extends NormalCommand<T> {
//     guildOnly: true;
//     execute(client: XClient, message: XMessage & GuildMessageProps & T, args: string[], flags: (CommandArgumentFlag)[]): Promise<void | boolean | CommandReturnData>;
// }

export type GuildMessageProps = { guild: Guild, member: GuildMember, channel: TextChannel | NewsChannel | ThreadChannel };

export interface CommandFlagDefinition {
    /**
     * The name of the flag
     */
    f: string;
    /**
     * The description of the flag
     */
    d: string;
    /**
     * Example value for the flag
     */
    v?: string;
    // aliases?: string[];
    /**
     * Specify if the value must be a number, the command will not be executed if a number value is not provided
     */
    isNumber?: boolean;
    /**
     * Specify if the flag cannot be sent without a value, the command will not be executed if a value is not provided
     */
    notEmpty?: boolean;
    /**
     * A custom filter to validate input
     * If the filter does not match input, the command will not be executed, and a generic "invalid value" error will be displayed
     */
    filter?: RegExp;
}

export interface CommandArgumentFlag {
    name: string;
    value: string;
    numberValue: number;
}

// export interface NumberCommandArgumentFlag extends CommandArgumentFlag {
//     value: number;
// }
// export type GuildMessage = XMessage & { guild: Guild, member: GuildMember };

export interface CommandReturnData {
    content: string;
    result?: boolean;
    embedded?: boolean;
    error?: boolean;
    color?: number;
    emoji?: string;
}

export interface Category {
    name: string;
    id: number;
    count: number;
    emoji?: string;
    commands: Command[];
}

/*export interface ClientSpecials {// NOT USING, JUST DID typeof
    sendModerationDisabled(channel: SendableChannel): Promise<void>;
    sendError(channel: SendableChannel, message: string, errorTitle = false): Promise<void>;
    argsNumRequire(channel: SendableChannel, args: string[], num: number): Promise<boolean>;
    argsMustBeNum(channel: SendableChannel, args: string[]): Promise<boolean>;
}*/

//export type SendableChannel = TextChannel & DMChannel;

//export interface SendableChannel extends TextChannel, DMChannel { }

export interface GlobalSettingRow {
    name: string;
    value: string;
    previousvalue?: string;
    description?: string;
    lastupdated?: string;
    updatedby: string;
    category?: string;
}

export interface SSRow {
    id?: string;

}

export interface ExpRow {
    /**
     * combined snowflakes
     */
    id: string;
    userid: Snowflake;
    guildid: Snowflake;
    /**
     * when their data was first added
     */
    timeAdded: timestamp;
    /**
     * last user exp updated time
     */
    timeUpdated: timestamp;
    /**
     * exp count
     */
    xp: number;
    /**
     * exp level
     */
    level: number;
    /**
     * total number of messages used in calculating the xp
     * not accurate for data aggregated before the count began
     * only a count of messages used once per minute
     */
    msgcount: number;
    /**
     * not used
     * @deprecated
     */
    thinice: 0 | 1;
    /**
     * not used
     * @deprecated
     */
    warnings: number;
    spideySaved: string;
}

export interface PersonalExpRow extends ExpRow {
    rank: number;
}

/*export interface LevelRow {
    id?: string;
    guildid?: string;
    roleid?: string;
    level?: number;
}*/

export interface LevelRolesRow {
    id: string;
    guildid: Snowflake;
    roleid: Snowflake;
    level: number;
}

export interface BSRow {
    updateId: number;
    logDate: Date;
    numUsers: number;
    numGuilds: number;
    numChannels: number;
}

export interface XMessage extends Message {
    gprefix?: string;
    bprefix?: string;
    treatOwner?: true;
    // [index: 'client']: Partial<Omit<XClient, keyof Client>> & Client;
    client: Partial<Omit<XClient, keyof Client>> & Client;
}

export interface InsertionResult {
    fieldCount: number;
    affectedRows: number;
    insertId: number;
    serverStatus: number;
    warningCount: number;
    message: string;
    //protocol41: boolean;
    changedRows: number;
}

export interface GuildSettingsRow {
    id: number;
    guildid: Snowflake;
    property: string;
    value: string;
    previousvalue: string;
}

export interface CmdTrackingRow {
    cmdname: string;
    used: number;
    iscmd: number
}

export interface TwitchHookRow {
    id: string;
    /**
     * The channel ID of the streamer
     */
    streamerid: string;
    /**
     * The ID of the guild to which this sub belongs
     */
    guildid: Snowflake;
    /**
     * The ID of the channel in which notifications should be sent
     */
    channelid: Snowflake;
    /**
     * The UID of the streamer
     */
    streamerlogin: string;
    /**
     * The message to be sent in a notification
     */
    message: string;
    /**
     * The date at which this stream will expire
     * @deprecated subscriptions no longer expire so this is not used
     */
    expires: string;
    /**
     * The configured number of streams the sub should be deleted after
     */
    delafter: number;
    /**
     * Number of notifications received
     */
    notified: number;
    /**
     * The date of the last notification received (not necessarily successfully sent)
     */
    laststream: string;
    subscriptionid: string;
}

export type PartialGuildObject = DiscordStrategy.GuildInfo & {
    features?: string[];
    permissions_new?: string;
}

export interface DashUserObject {
    id: string;
    tag: string;
    avatar: string;
    guilds: PartialGuildObject[];
}

export interface MessageService {
    name?: string;
    disabled?: true;
    allowNonUser?: true;
    allowDM?: true;
    events: (keyof ClientEvents)[];
    getInformation?(client: XClient, guildid: string): Promise<string>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    execute(client: XClient, event: keyof ClientEvents, ...data: any): Promise<void>;
}

export interface TimedActionRow {
    actionid: string;
    exectime: string;
    actiontype: TimedAction["type"];
    actiondata: string;
    casenumber: number;
}

export type TimedAction = UnmuteAction | UnbanAction;

export interface TimedActionPayload<T = string, D = Record<string, unknown>> {
    id: string;
    case?: number;
    time: Date;
    type: T;
    data: D;
}

export type UnmuteAction = TimedActionPayload<'unmute', {
    guildid: Snowflake;
    userid: Snowflake;
    roleid: Snowflake;
    duration: string;
}>;

export type UnbanAction = TimedActionPayload<'unban', {
    guildid: Snowflake;
    userid: Snowflake;
    duration: string;
}>;

/*export interface UserData {
    userid?: string;
    afk?: string;
    offenses?: number;
    nicknames?: string | null;
}*/

export interface UserDataRow {
    userid: Snowflake;
    createdat?: string;
    updatedat?: string;
    bio?: string;
    afk?: string | null;
    offenses?: number;
    nicknames?: string;
    bans?: number;
}

// 'delete' | 'warn' | 'tempmute' | 'mute' | 'kick' | 'tempban' | 'ban' | 'channelMessage' | 'courtesyMessage';
export interface AutomoduleData {
    /**
     * name of module
     */
    name: string;
    /**
     * whether the module is a text module
     */
    text: boolean;
    /**
     * enable module and override channels
     */
    enableAll: boolean;
    /**
     * channel ids to apply channel effect to
     * 
     * this is an optional property because it will only exist on text modules
     */
    channels?: string[];
    /**
     * effect to apply to channels
     */
    channelEffect?: 'enable' | 'disable';
    /**
     * role ids to apply effect to
     */
    applyRoles: string[];
    /**
     * effect to use roles for
     */
    roleEffect: 'ignore' | 'watch';
    /**
     * The mode of hard punishment.
     */
    punishment?: 'tempmute' | 'mute' | 'kick' | 'tempban' | 'ban';
    /**
     * Time in seconds. This is the amount of time delay for temporary punishments (tempmute, tempban).
     */
    punishTime?: number;
    /**
     * The additional actions to take onViolation. Multiple may be selected.
     */
    actions?: ('delete' | 'warn' | 'channelMessage' | 'courtesyMessage')[];
    /**
     * The number of offenses allowed before punishment.
     */
    offensesOffset?: number;
    /**
     * enable module strict mode if it has one
     */
    strict?: boolean;
    /**
     * if available, only activate module on messages
     */
    onlyOnMessage?: boolean;
    /**
     * ignore bot users if avail
     */
    ignoreBots?: boolean;
    /**
     * send a warning dm as an option
     */
    sendDM?: boolean;
    /**
     * whether nested text should not be used
     */
    notNested?: boolean;
    /**
     * custom user provided list of strings to use
     */
    customList?: string[];
    /**
     * arbitrary option
     */
    option1?: boolean;
    /**
     * number of something to cross
     */
    threshold?: number;
    /**
     * in seconds
     */
    frequency?: number;
}

export interface GuildUserDataRow {
    id?: string;
    userid?: Snowflake;
    guildid?: Snowflake;
    createdat?: string;
    updatedat?: string;
    offenses?: number;
    /**
     * @deprecated
     */
    warnings?: number;
    bans?: number;
    bio?: string;
    nicknames?: string;
    roles?: string;
    banned?: string;
    modnote?: string;
}

export interface HomeEndpointData {
    guild: {
        id: string;
        name: string;
    };
}

export interface AutomoduleEndpointData extends GuildsEndpointBase {
    automodule: AutomoduleData;
}

export interface GuildItemSpecial {
    bot: boolean;
    icon: string;
    id: string;
    name: string;
    owner: boolean;
    permissions: number;
}

export interface GuildsEndpointData {
    guilds: GuildItemSpecial[];
}

export interface ChannelData {
    id: Snowflake;
    name: string;
    type: string;
    position: number;
    parentID?: Snowflake;
    nsfw?: boolean;
    topic?: string;
}

export interface ChannelEndpointData extends GuildsEndpointBase {
    total: number;
    channels: ChannelData[];
}

export interface RoleData {
    id: Snowflake;
    name: string;
    hexColor: string;
    position: number;
}

export interface RoleEndpointData extends GuildsEndpointBase {
    total: number;
    roles: RoleData[];
}

export interface XKCDEndpointResponse {
    month: string;
    num: number;
    link: string;
    year: string;
    news: string;
    safe_title: string;
    transcript: string;
    alt: string;
    img: string;
    title: string;
    day: string;
}

export interface AutoroleData {
    disabled?: boolean;
    /**
     * the roles to automatically give people when they join
     */
    roles?: string[];
    // ignore?: string[];// not sure what this property was supposed to be
    /**
     * the roles to automatically give to bots when they join
     */
    botRoles?: string[];
    /**
     * Whether user's roles should be restored when they rejoin the server
     */
    retain?: boolean;
    /**
     * The optional list of roles that should not be restored when users rejoin
     */
    noRetain?: string[];
}

export interface LevelsEndpointData  extends GuildsEndpointBase {
    enabled: boolean;
    levels: LevelRolesRow[];
}

export interface GuildsEndpointBase {
    id: string;
}

export interface AutoroleEndpointData extends GuildsEndpointBase {
    data: AutoroleData;
}

export interface WarnConf {
    punishment?: string;
    threshold?: number;
    time?: number;
}

export interface WarnConfEndpointData extends GuildsEndpointBase {
    conf: WarnConf;
}

export interface ModActionData {
    /**
     * The number of this action following an always-incrementing pattern of all the cases the bot has ever tracked
     */
    id: number;
    /**
     * The super unique key for the case (in case it is ever needed for some reason)
     */
    superid: string;
    /**
     * The id of the guild the case belongs to
     */
    guildid: Snowflake;
    /**
     * The guild-localized case number for the incident (represents the identifier of the case based on a self-incrementing identifier number pattern)
     */
    casenumber: number;
    /**
     * The target's id
     */
    userid: Snowflake;
    /**
     * The tag of the target at the time of the incident
     */
    usertag: string;
    /**
     * The type of action this case represents
     */
    type: string;
    /**
     * When this case entry was created
     */
    created: string;
    /**
     * When this case was last updated
     */
    updated: string;
    /**
     * A timestamp if it is a limited duration event
     */
    endtime?: string;
    /**
     * The moderator's id
     */
    agent: string;
    /**
     * The tag of the moderator at the time of incident
     */
    agenttag: string;
    /**
     * The given reason/case summary for the incident
     */
    summary: string;
    /**
     * A boolean representing whether or not the user was notified of the action taken against them, if necessary
     */
    notified: number;
}

export type ModActionEditData<R = 'guildid' | 'agent' | 'userid'> = Required<Pick<ModActionData, R>> & Partial<Omit<ModActionData, R>>;
/* {
    superid?: string;
    guildid: string;
    casenumber?: number;
    userid: string;
    usertag?: string;// maybe make this required
    type?: string;
    endtime?: string;
    agent: string;
    agenttag?: string;// maybe make this required
    summary?: string;
} */

export interface ServerlogData {
    log_channel: string;
    member_channel: string;
    server_channel: string;
    voice_channel: string;
    messages_channel: string;
    movement_channel: string;
    ignored_channels: string[];
    events: number;
}

//export interface ServerlogEndpointData extends GuildsEndpointBase {}
export type ServerlogEndpointData = ServerlogData;

export interface UserNote {
    id: number;
    authorID: Snowflake;
    author: string;
    content: string;
    created: string;
    updated: string;
}

/*
export type LogObject = Record<LogString, boolean>;
export type LogFlags = Record<LogString, number>;

export type LogString =
    | 'MEMBER_STATE'
    | 'MESSAGE_DELETION'
    | 'MESSAGE_UPDATE'
    | 'ROLE_CREATION'
    | 'ROLE_DELETION'
    | 'CHANNEL_CREATION'
    | 'CHANNEL_DELETION'
    | 'CHANNEL_UPDATE'
    | 'EMOJI_CREATION'
    | 'EMOJI_DELETION'
    | 'NICKNAME_UPDATE'
    | 'MEMBER_UPDATE'
    | 'VOICE_ANY';*/

export interface TwitchSub {
    channel_id: string;
    streamer_id: string;
    streamer_login: string;
    message: string;
    delete_after: number;
    notified: number;
}

type TwitchEndpointData = TwitchSub[];

export interface TwitchSearchChannelsReturns {
    id: string;
    broadcaster_login: string;
    game_id?: string;
    display_name?: string;
    broadcaster_language?: string;
    title?: string;
    thumbnail_url?: string;
    is_live?: boolean;
    started_at?: string;
    tag_ids?: string;
}

export interface FullPointsData {
    guild: Snowflake;
    user: Snowflake;
    /**
     * The current CUMULATIVE TOTAL of points
     */
    points: number;
    /**
     * The current number of RELATIVE POINTS from the last level
     */
    pointsInLevel: number;
    /**
     * The current level
     */
    level: number;
    /**
     * When the first points were earned by this user
     */
    firstCounted: Date;
    /**
     * When points were last earned by this user
     */
    lastGained: Date;
    /**
     * The relative points still needed to go from the current point in the current level to the next level
     */
    pointsToGo: number;
    /**
     * The relative points required to get to the next level from the current level (cum next level) - (cum this level) = (relative to next level)
     */
    pointsLevelNext: number;
    /**
     * The relative points required to level to the current level from the previous level
     */
    pointsLevelNow: number;
}

export interface ClientValuesGuild {
    members: string[];
    channels: string[];
    roles: string[];
    deleted: boolean;
    id: string;
    shardID: number;
    name: string;
    icon: string | null;
    splash: string | null;
    /** may be wrong */
    discoverySplash: string | null;
    region: string;
    memberCount: number;
    large: boolean;
    /** may be wrong */
    features: string[];
    applicationID: string | null;
    afkTimeout: number;
    afkChannelID: string | null;
    systemChannelID: string;
    premiumTier: number;
    premiumSubscriptionCount: number;
    verificationLevel: string;
    explicitContentFilter: string;
    mfaLevel: number;
    joinedTimestamp: number;
    defaultMessageNotifications: string;
    /** may be wrong */
    systemChannelFlags: number;
    maximumMembers: number;
    maximumPresences: number | null;
    approximateMemberCount: number | null;
    approximatePresenceCount: number | null;
    vanityURLCode: string | null;
    vanityURLUses: number | null;
    description: string | null;
    /** may be wrong */
    banner: string | null;
    rulesChannelID: string | null;
    publicUpdatesChannelID: string | null;
    preferredLocale: string;
    ownerID: string;
    /** may be wrong */
    emojis: string[];
    createdTimestamp: number;
    nameAcronym: string;
    iconURL: string | null;
    splashURL: string | null;
    discoverySplashURL: string | null;
    bannerURL: string | null;
}

export interface DashboardMessage {
    outside: string;
    embed: DashboardMessageEmbed;
}

export interface DashboardMessageEmbed {
    title?: string;
    description?: string;
    url?: string;
    timestamp?: number;
    color?: number/*  | [number, number, number] */;
    fields?: {
        order: number;
        name: string;
        value: string;
        inline?: boolean;
    }[];
    files?: string[];
    authorname?: string;
    authorurl?: string;
    authoricon?: string;
    thumbnailurl?: string;
    imageurl?: string;
    videourl?: string;
    footertext?: string;
    footericon?: string;
}

export interface MovementData {
    add_channel: string;
    depart_channel: string;
    add_message: DashboardMessage;
    depart_message: DashboardMessage;
    dm_message: DashboardMessage;
}

export interface MovementEndpointData {
    channels: ChannelData[];
    data: MovementData;
}

export interface CommandsEndpointData {
    commands: CommandConf[];
    global: CommandsGlobalConf;
    channels: ChannelData[];
    roles: RoleData[];
    mod_role: string;
}

export interface CmdConfEntry {
    conf: CommandsGlobalConf;
    commands: CommandConf[];
}

export interface CommandsGlobalConf {
    overwites_ignore?: string[];
    /**
     * channels allow or disallow
     */
    channel_mode?: boolean;
    /**
     * channels applying the effect
     */
    channels?: string[];
    /**
     * roles allow or disallow
     */
    role_mode?: boolean;
    /**
     * roles applying the effect
     */
    roles?: string[];
    /**
     * Send that the command is disabled in chat
     */
    respond?: boolean;
    /**
     * notify the user if they don't have the internal permissions to run the command
     */
    perm_notif?: boolean;
}

export interface CommandConf {
    /**
     * name of the command
     */
    name: string;
    /**
     * whether the command can be interacted with at all
     */
    enabled: boolean;
    /**
     * channels allow or disallow
     */
    channel_mode: boolean;
    /**
     * channels applying the effect
     */
    channels: string[];
    /**
     * roles allow or disallow
     */
    role_mode: boolean;
    /**
     * roles applying the effect
     */
    roles: string[];
    /**
     * admin, moderator, member, etc
     */
    level?: number;
    confined?: boolean;
    description?: string;
    description_short?: string;
    description_edited?: string;
    /**
     * the official cooldown
     */
    default_cooldown: number;
    /**
     * the edited cooldown
     */
    cooldown?: number;
    category?: string;
    /**
     * access at a certain experience level
     */
    exp_level?: number;
    /**
     * whether the conf is not a default and has been created as an overwrite
     */
    overwrite: boolean;
}

export interface CmdHistoryRow {
    invocation_id: string;
    command_name: string;
    message_content: string;
    guildid: string;
    userid: Snowflake | null;
    messageid: Snowflake;
    channelid: Snowflake;
    invocation_time: string;
}

export interface InvitedUserData {// data for the people that have joined and were tracked by an invite
    id: number;
    guildid: Snowflake;
    inviteat: string;
    invitee: string;
    inviteename: string;
    inviter: string;
    invitername: string;
    code: string;
}

export interface InviteData {// data for the actual invites that are in use for the guild
    inviter: string;
    uses: number;
    code: string;
    channel: string;
    members: number;
}

export interface InviteStateData {
    guildid: Snowflake;
    invites: InviteData[];
    rewards?: Record<number, InviteLevelReward>;
    reset_at?: string;
}

export interface InviteLevelReward {
    level: number;
    mode: string;
    value: string;
    attachment?: string;
}

export interface StoredPresenceData {
    /**
     * dnd, offline, etc
     */
    status: PresenceStatusData;
    /**
     * the description
     */
    name: string;
    /**
     * watching, listening, etc
     */
    type: ExcludeEnum<ActivityTypes, 'CUSTOM'>;
    /**
     * afk value for the api, not really sure what it does
     */
    afk?: boolean;
    /**
     * whether to deactivate these stored values and use the hardcoded default
     */
    useDefault?: boolean;
}

export interface SkeletonGuildObject {
    id: Snowflake;
    name: string;
    icon: string | null;
    owner: Snowflake;
    ownerName?: string;
}

export interface SkeletonRole {
    id: Snowflake;
    color: number;
    hexColor: string;
    position: number;
    hoist: boolean;
    createdTimestamp: number;
    editable: boolean;
    name: string;
    mentionable: boolean;
}

// export interface SkeletonUserObject {// i literally accidentally made this, it isn't currently being used but it could be in the future for other broadcast methods
//     id: Snowflake;
//     tag: string;
//     profile: string;
//     created: string;
// }

export interface StarboardSetting {
    channel: Snowflake;
    threshold: number;
    allowSelf: boolean;
    jumpLink: boolean;
    allowSensitive: boolean;
    locked: boolean;
    ignoredChannels: Snowflake[];
    starStarred: boolean;
    emoji: string[];
    color: number;
}

export interface StarredMessageData {
    messageid: Snowflake;
    guildid: Snowflake;
    channelid: Snowflake;
    authorid: Snowflake;
    stars: number;
    locked: 0 | 1;
    nsfw: 0 | 1;
    postid: string;
    postchannel: string;
}

// export type ChannelTypeKeyData = Record<ChannelTypes, {
//     pretty: string;
//     indicator?: string;
// }>

export type GdShortenerResponse = {shorturl: string} | {errorcode: number; errormessage: string};

//  https://stackoverflow.com/a/42618403/10660033
// export interface MySQLError {
//     code: string;
// }

/**
 * https://docs.kutt.it/#tag/links/paths/~1links/post
 */
export interface KuttPostResponse {
    address: string;
    banned: boolean;// False
    created_at: string;//Zulu Time Format (date-time format)
    id: string;// uuid
    link: string;
    password: boolean;// False
    target: string;
    description: string;
    updated_at: string;// date-time
    visit_count: number;
}

/**
 * Thanks NotGrey
 * 
 * https://search-xkcd.mfwowocringe.repl.co/search/{query}
 */
export interface XKCDSearchResponse {
    /**
     * "Success" if successful
     */
    status: string;
    /**
     * The comic number
     */
    id: number;
}

export interface TronaldTagResponse {
    count: number;
    total: number;
    _embedded: {
        tag: TronaldTag[];
    };
}

export interface TronaldTag {
    /**
     * date-time
     */
    created_at: string;
    /**
     * date-time
     */
    updated_at: string;
    /**
     * The actual tag
     */
    value: string;
    _links: {
        self: {
            href: string;
        }
    }
}

export type TronaldRandomResponse = TronaldQuote

export interface TronaldQuote {
    /**
     * date-time
     */
    appeared_at: string;
    /**
     * date-time
     */
    created_at: string;
    /**
     * unique identifier
     */
    quote_id: string;
    tags: string[];
    /**
     * date-time
     */
    updated_at: string;
    value: string;
    /**
     * metadata
     */
    _embedded: {
        author: {
            author_id: string;
            bio: string | null;
            created_at: string;
            name: string;
            slug: string;
            updated_at: string;
            _links: {
                self: {
                    href: string;
                };
            };
        }[];
        source: {
            created_at: string;
            filename: string | null;
            quote_source_id: string;
            remarks: string | null;
            updated_at: string;
            url: string;
            _links: {
                self: {
                    href: string;
                };
            };
        }[];
    };
    _links: {
        self: {
            href: string;
        };
    };
}

export type TronaldQuoteResponse = TronaldAPIErrorResponse | TronaldQuote;

export type TronaldSearchResponse = TronaldAPIErrorResponse | {
    count: number;
    total: number;
    _embedded: {
        quotes: TronaldQuote[];
    };
    _links: {
        self: {
            href: string;
        };
        first: {
            href: string;
        };
        prev: {
            href: string;
        };
        next: {
            href: string;
        };
        last: {
            href: string;
        };
    };
}

export interface TronaldAPIErrorResponse {
    /**
     * date-time
     */
    timestamp: string;
    /**
     * 404 most likely in this type
     */
    status: number;
    /**
     * Most likely "Not Found"
     */
    error: string;
    message: string;
    /**
     * Should be "/quote/" or "/search/quote"
     */
    path: string;
}

export interface TriviaCategory {
    id: number;
    name: string;
}

export interface TriviaAPICategoriesResponse {
    trivia_categories: TriviaCategory[];
}

export interface TriviaAPIResponse {
    response_code: 0 | 1 | 2 | 3 | 4;
    results: {
        category: string;
        type: string;
        difficulty: string;
        question: string;
        correct_answer: string;
        incorrect_answers: string[];
    }[];
}

export interface TriviaAPITokenResponse {
    response_code: number;
    response_message: string;
    token: string;
}

export type MovieAPIResponse = {
    Title?: string;
    Year?: string;
    Rated?: string;
    Released?: string;
    Runtime?: string;
    Genre?: string;
    Director?: string;
    Writer?: string;
    Actors?: string;
    Plot?: string;
    Language?: string;
    Country?: string;
    Awards?: string;
    Poster?: string;
    Ratings?: {
        Source: string;
        Value: string;
    }[];
    Metascore?: string;
    imdbRating?: string;
    imdbVotes?: string;
    imdbID?: string;
    Type?: string;
    DVD?: string;
    BoxOffice?: string;
    Production?: string;
    Website?: string;
    Response: "True";
} | {
    Response: "False";
    Error: string;
};
