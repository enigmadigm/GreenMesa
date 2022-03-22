import { AutomoduleData, MessageService, XClient, XMessage } from "../gm";
import { ClientEvents, Collection, DMChannel, GuildChannel, GuildMember, Message, MessageEmbedOptions, MessageReaction, User } from "discord.js";
import fs from "fs";
import { Bot } from "../bot.js";
import { ordinalSuffixOf } from "../utils/parsers.js";
import { ban, kick, mute, warn } from "../utils/modactions.js";
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

export class MessageServices {
    private services: Collection<string, MessageService>;
    public automods: string[];

    constructor() {
        this.services = new Collection();
        this.automods = [];
    }

    async load(): Promise<void> {
        const serviceFiles = fs.readdirSync(__dirname).filter(file => file.endsWith('.js') && !file.startsWith('[template]') && file !== "index.js")

        for (const file of serviceFiles) {
            const { service } = await import(`file:///${__dirname}/${file}`);
            const name = file.split(".")[0];
            service.name = name;
            this.services.set(name, service);
            xlg.log(`Loaded service: ${name}`);
            if (file.startsWith("automod_")) {
                this.automods.push(name.split("_")[1]);
            }
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any,@typescript-eslint/explicit-module-boundary-types
    async run(client: XClient, mod: string, data: any): Promise<void> {
        try {
            if (!Bot.client) return;
            const serv = this.services.find((s) => s.name === mod);
            if (serv && !serv.disabled) {
                await serv.execute(client, data);
            }
        } catch (error) {
            xlg.error(error);
        }
    }

    /**
     * Better to consider this runAllForACertainEvent
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    runAllForEvent(event: keyof ClientEvents, ...data: any[]): void {//FIXME: executes on bot account reaction
        try {
            if (!Bot.client || !Bot.client.user) return;
            for (const [,service] of this.services) {
                if (service.events.includes(event) &&
                    !service.disabled &&
                    !(
                        service.name?.startsWith("automod_") &&
                        data.some(d => (d instanceof Message && (d.author.id === Bot.client.user?.id || d.channel instanceof DMChannel)) || (d instanceof MessageReaction && (d.message.channel instanceof DMChannel || d.message.author?.id === Bot.client.user?.id)))
                    ) &&
                    (
                        service.allowNonUser ||
                        !((data[0] instanceof Message &&
                            (data[0].author.bot ||
                                data[0].author.system ||
                                data[0].webhookId)) ||
                            (data[1] instanceof User && (data[1].bot || data[1].system)))
                    ) &&
                    (
                        !service.allowDM ||
                        (
                            !data.some(d => 'guild' in d || (d instanceof MessageReaction && (d.message.channel instanceof DMChannel || d.message.author?.id === Bot.client.user?.id))) || (data[0] instanceof Message && !data[0].guild) || (data[0] instanceof MessageReaction && !data[0].message.guild)
                        )
                    )
                ) {
                    service.execute(Bot.client, event, ...data);
                }
            }
        } catch (error) {
            xlg.error(error);
        }
    }

    /**
     * Runs all modules that are text based
     */
    async runAllTextAutomod(client: XClient, message: XMessage): Promise<void> {
        try {
            if (!Bot.client) return;
            for (const [, service] of this.services) {
                if (this.isText(service.name || "") && service.name?.startsWith("automod_") && !service.disabled && message.author.id !== client.user?.id && message.guild) {
                    service.execute(client, "message", message);
                }
            }
            // this.services.forEach(async (service: MessageService) => {
            //     if (service.text && service.name?.startsWith("automod_") && !service.disabled && message.author.id !== client.user?.id) {
            //         await service.execute(client, message);
            //     }
            // });
        } catch (error) {
            xlg.error(error);
        }
    }

    async getInfo(client: XClient, guildid: string, mod: string): Promise<string> {
        const s = this.services.find(x => x.name === mod);
        if (s && s.getInformation) {
            const info = await s.getInformation(client, guildid);
            return info;
        } else {
            return "";
        }
    }

    isText(mod: string): boolean {
        const s = this.services.find(x => x.name === mod);
        return !!(s && (s.events.includes("message") || s.events.includes("messageUpdate") || s.events.includes("messageDelete")));
    }

    async punish<T = unknown>(mod: AutomoduleData, target: GuildMember, data?: T): Promise<void> {
        try {
            if (!mod || !target || !Bot.client.database || !target.guild.me) return;
            const ud = await Bot.client.database.getGuildUserData(target.guild.id, target.id);
            if (!ud.offenses) {
                ud.offenses = 1;
            } else {
                ud.offenses++;
            }
            await Bot.client.database.updateGuildUserData(ud);// updating offense count right away
            const pastOffset = (mod.offensesOffset || 0) < ud.offenses;// dumb (mod.offensesOffset || 0) % ud.offenses
            const ptime = mod.punishTime || 0;
            const pud = await Bot.client.database.getUserData(target.id);
            if (!pud.offenses) {
                pud.offenses = 1;
            } else {
                pud.offenses++;
            }
            if (mod.actions) {
                for (const action of mod.actions) {
                    switch (action) {
                        case "channelMessage": {
                            try {
                                if (mod.text && data instanceof Message && data.channel instanceof GuildChannel && data.guild?.me) {
                                    if (data.channel.permissionsFor(data.guild.me).has("EMBED_LINKS")) {
                                        await data.channel.send({
                                            content: `${target}`,
                                            embeds: [{
                                                color: await Bot.client.database.getColor("warn_embed_color"),
                                                title: `Automod Alert`,
                                                description: `${target} was flagged by the **${mod.name}** module.${!ud.offenses ? "" : `\n**${ordinalSuffixOf(ud.offenses)}** offense`}`
                                            }]
                                        });
                                    } else {
                                        await data.channel.send({
                                            content: `${target} was flagged by the ${mod.name} automod module`,
                                        });
                                    }
                                }
                            } catch (error) {
                                xlg.error(error);
                            }
                            break;
                        }
                        case "courtesyMessage": {
                            try {
                                const e: MessageEmbedOptions = {
                                    color: await Bot.client.database.getColor("warn_embed_color"),
                                    title: `Automod Violation`,
                                    description: `**Server:** ${target.guild.name.escapeDiscord()}\nYou have been found in violation of the ${mod.name} module.${!ud.offenses ? "" : `\n**${ordinalSuffixOf(ud.offenses)}** offense.`}${mod.punishment ? `\n**Punishment:** \`${!pastOffset ? "warn" : mod.punishment}\`` : ""}`,
                                }
                                await target.send({ embeds: [e] });
                            } catch (error) {
                                //
                            }
                            break;
                        }
                        case "delete": {
                            if (mod.text && data instanceof Message) {
                                try {
                                    await data.delete();
                                } catch (error) {
                                    //
                                }
                            }
                            break;
                        }
                        case "warn": {
                            await warn(Bot.client, target, target.guild.me, `Automatic warn triggered by automod:${mod.name}`);
                            break;
                        }
                        default:
                            break;
                    }
                }
            }
            if (pastOffset && target.bannable && target.kickable) {
                switch (mod.punishment) {
                    case "ban": {
                        await ban(Bot.client, target, 0, target.guild.me, `Automatic ban triggered by automod:${mod.name}`);
                        break;
                    }
                    case "kick": {
                        await kick(Bot.client, target, target.guild.me, `Automatic kick triggered by automod:${mod.name}`);
                        break;
                    }
                    case "mute": {
                        await mute(Bot.client, target, 0, target.guild.me, `Automatic mute triggered by automod:${mod.name}`);
                        break;
                    }
                    case "tempban": {
                        await ban(Bot.client, target, ptime * 1000, target.guild.me, `Automatic tempban triggered by automod:${mod.name}`);
                        break;
                    }
                    case "tempmute": {
                        await mute(Bot.client, target, ptime * 1000, target.guild.me, `Automatic tempmute triggered by automod:${mod.name}`);
                        break;
                    }
                    default:
                        mod.punishment = undefined;
                        break;
                }
            }
            await Bot.client.database.updateGuildUserData({
                guildid: target.guild.id,
                userid: target.id,
                offenses: ud.offenses,
                warnings: ud.warnings,
                bans: ud.bans,
            });
            await Bot.client.database.updateUserData({
                userid: target.id,
                offenses: pud.offenses
            });
        } catch (error) {
            xlg.error(error);
        }
    }
}
