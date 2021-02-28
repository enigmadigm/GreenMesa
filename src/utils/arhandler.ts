import { GuildMember } from "discord.js";
import { AutoroleData, XClient } from "../gm";
import xlg from "../xlogger";
//const { getGlobalSetting } = require("../dbmanager");

// if (!message.channel.permissionsFor(message.guild.me).has(["SEND_MESSAGES"]) || !message.channel.manageable)

export async function potatoRoler(member: GuildMember): Promise<void> {
    try {
        if (member.guild.id !== "725784760366006353") return;
        if (member.user.bot) {
            await member.roles.add("747934781756670045");
            return;
        }
        await member.roles.add("754071177156100136");
    } catch (error) {
        xlg.error(error);
    }
}

export class AutoRoler {
    private client: XClient;

    constructor(client: XClient) {
        this.client = client;
    }

    async editAR(guildid: string, data: AutoroleData): Promise<boolean> {
        try {
            const g = this.client.guilds.cache.get(guildid);
            if (!g) return false;
            const d = JSON.stringify(data);
            await this.client.database?.editGuildSetting(g, `autorole_${data.name}`, d);
            return false;
        } catch (error) {
            xlg.error(error);
            return false;
        }
    }

    async removeAR(guildid: string, name: string): Promise<void> {
        try {
            const g = this.client.guilds.cache.get(guildid);
            if (!g) return;
            await this.client.database?.editGuildSetting(g, `autorole_${name}`, undefined, true);
        } catch (error) {
            xlg.error(error);
        }
    }
}