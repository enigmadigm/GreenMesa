import { Snowflake } from "discord.js";
import { StarboardSetting } from "../gm";

export default class implements StarboardSetting {
    public channel: Snowflake;
    public threshold: number;
    public allowSelf: boolean;
    public jumpLink: boolean;
    public allowSensitive: boolean;
    public locked: boolean;
    public ignoredChannels: Snowflake[];
    public starStarred: boolean;
    public emoji: string[];
    public color: number;

    constructor(d: Partial<StarboardSetting> & { channel: Snowflake } = { channel: "" as Snowflake }) {
        const { channel, threshold, allowSelf, jumpLink, allowSensitive, locked, ignoredChannels, starStarred, emoji, color } = d;
        this.channel = channel;
        this.threshold = threshold ?? 3;
        this.allowSelf = allowSelf ?? false;
        this.jumpLink = jumpLink ?? true;
        this.allowSensitive = allowSensitive ?? false;
        this.locked = locked ?? false;
        this.ignoredChannels = ignoredChannels ?? [];
        this.starStarred = starStarred ?? false;
        this.emoji = emoji ?? ["⭐"];
        this.color = color ?? 0x000000;
    }
}