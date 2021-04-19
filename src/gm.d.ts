import { Client, Collection, Message, MessageEmbedOptions, PermissionString } from "discord.js";
import { DBManager } from "./dbmanager";
import * as Specials from "./utils/specials";
import DiscordStrategy from 'passport-discord';
import { MessageServices } from "./services";

export interface XClient extends Client {
    commands: Collection<string, Command>;
    categories: Collection<string, Category>;
    specials: typeof Specials;
    database: DBManager;
    services: MessageServices;
}

export interface Command {
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
    category?: string;
    /**
     * Optional usage instructions for the command
     */
    usage?: string;
    /**
     * Options usage examples displayed with the help command and when not being used correctly
     */
    examples?: string[];
    /**
     * Whether arguments should be required, or the number of arguments needed
     */
    args?: boolean | number;
    // specialArgs?: number;
    cooldown?: number;
    permLevel?: number;
    moderation?: boolean;
    guildOnly?: boolean;
    /**
     * @deprecated
     */
    ownerOnly?: boolean;
    permissions?: PermissionString[];
    execute(client: XClient, message: XMessage, args: string[]): Promise<void | boolean>;
}

export interface RCommand extends Command {
    category: string;
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
    id: string;
    userid: string;
    guildid: string;
    timeAdded: timestamp;
    timeUpdated: timestamp;
    xp: number;
    level: number;
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
    guildid: string;
    roleid: string;
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
    guildid: string;
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
    streamerid: string;
    guildid: string;
    channelid: string;
    streamerlogin: string;
    message: string;
    expires: string;
    delafter: number;
    notified: number;
}

export interface PartialGuildObject extends DiscordStrategy.GuildInfo {
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
    text?: true;
    getInformation?(client: XClient, guildid: string): Promise<string>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    execute(client: XClient, data: any): Promise<void>;
}

export interface UnparsedTimedAction {
    actionid: string;
    exectime: string;
    actiontype: string;
    actiondata: string;
    casenumber: number;
}

export interface TimedAction {
    id: string;
    case?: number;
    time: Date;
    type: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: Record<string, any>;
}

export interface UnmuteActionData {
    guildid: string;
    userid: string;
    roleid: string;
    duration: string;
}

export interface UnbanActionData {
    guildid: string;
    userid: string;
    duration: string;
}

/*export interface UserData {
    userid?: string;
    afk?: string;
    offenses?: number;
    nicknames?: string | null;
}*/

export interface UserDataRow {
    userid: string;
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
    notNested?: boolean;
    customList?: string[];
    option1?: boolean;
    threshold?: number;
    frequency?: number;
}

export interface GuildUserDataRow {
    id?: string;
    userid?: string;
    guildid?: string;
    createdat?: string;
    updatedat?: string;
    offenses?: number;
    warnings?: number;
    bans?: number;
    bio?: string;
    nicknames?: string;
    roles?: string;
    banned?: string;
    modnote?: string;
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
    id: string;
    name: string;
    type: string;
    position: number;
    parentID: string;
    nsfw?: boolean;
    topic?: string;
}

export interface ChannelEndpointData extends GuildsEndpointBase {
    total: number;
    channels: ChannelData[];
}

export interface RoleData {
    id: string;
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
    ignore?: string[];
    /**
     * the roles to automatically give to bots when they join
     */
    botRoles?: string[];
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
    id: number;
    superid: string;
    guildid: string;
    casenumber: number;
    userid: string;
    type: string;
    created: string;
    updated: string;
    duration: number;
    mod: string;
    summary: string;
}

export interface ModActionEditData {
    superid?: string;
    guildid: string;
    casenumber?: number;
    userid: string;
    type?: string;
    duration?: number;
    mod: string;
    summary?: string;
}

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
    authorID: string;
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
    guild: string;
    user: string;
    points: number;
    level: number;
    firstCounted: Date;
    lastGained: Date;
    pointsToGo: number;
    pointsLevelNext: number;
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

export interface TriviaResponse {
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

export interface DashboardMessage {
    outside: string;
    embed: MessageEmbedOptions;
}

export interface MovementData {
    add_channel: string;
    depart_channel: string;
    dm_channel: string;
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
