import { Collection, GuildMember, Message, MessageEmbedOptions } from "discord.js";
import { AutomoduleData, MessageService, XClient, XMessage } from "../gm";
import fs from "fs";
import { Bot } from "../bot";
import { ordinalSuffixOf } from "../utils/parsers";
import { ban, kick, mute, warn } from "../utils/modactions";


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
            const { service } = await import(`${__dirname}/${file}`);
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
     * Better to consider this runAllTextServices
     */
    async runAll(client: XClient, message: XMessage): Promise<void> {
        try {
            if (!Bot.client) return;
            for (const [,service] of this.services) {
                if (service.text && !service.disabled && !(service.name?.startsWith("automod_") && message.author.id === client.user?.id) && (service.allowNonUser || !(message.author.bot || message.author.system)) && (!service.guildOnly || message.guild)) {
                    service.execute(client, message);
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
                if (service.text && service.name?.startsWith("automod_") && !service.disabled && message.author.id !== client.user?.id) {
                    service.execute(client, message);
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
        return !!(s && s.text);
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
            const pastOffset = (mod.offensesOffset || 0) < ud.offenses;// dumb (mod.offensesOffset || 0) % ud.offenses
            const ptime = mod.punishTime || 0;
            const pud = await Bot.client.database.getUserData(target.id) || { userid: target.id, afk: "", offenses: 0, nicknames: "" };
            if (!pud.offenses) {
                pud.offenses = 1;
            } else {
                pud.offenses++;
            }
            if (mod.actions) {
                for (const action of mod.actions) {
                    switch (action) {
                        case "channelMessage": {
                            if (mod.text && data instanceof Message) {
                                await data.channel.send({
                                    content: `${target}`,
                                    embed: {
                                        color: await Bot.client.database.getColor("warn_embed_color"),
                                        title: `Automod Alert`,
                                        description: `${target} has been caught by the **${mod.name}** module.${!ud.offenses ? "\nThis is their **first** offense" : `\nThis is their **${ordinalSuffixOf(ud.offenses)}** offense`}`
                                    }
                                });
                            }
                            break;
                        }
                        case "courtesyMessage": {
                            const e: MessageEmbedOptions = {
                                color: await Bot.client.database.getColor("warn_embed_color"),
                                title: `Automod Violation`,
                                description: `**Server:** ${target.guild.name}\nYou were caught in violation of the ${mod.name} module.${!ud.offenses || ud.offenses === 1 ? "\nThis is your **first** offense" : `\nThis is your **${ordinalSuffixOf(ud.offenses)}** offense`}${mod.punishment ? `\n**Punishment:** \`${!pastOffset ? "warn" : mod.punishment}\`` : ""}`
                            }
                            await target.send({ embed: e });
                            break;
                        }
                        case "delete": {
                            if (mod.text && data instanceof Message) {
                                await data.delete();
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
