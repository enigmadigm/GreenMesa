import { Collection } from "discord.js";
import { MessageService, XClient, XMessage } from "../gm";
import fs from "fs";
import { Bot } from "../bot";

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
            console.log(`Loaded service: ${name}`);
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
            console.log(error);
        }
    }

    async runAll(client: XClient, message: XMessage): Promise<void> {
        try {
            if (!Bot.client) return;
            this.services.forEach(async (service: MessageService) => {
                if (service.text && !service.disabled && !(service.name?.startsWith("automod_") && message.author.id === client.user?.id)) {
                    await service.execute(client, message);
                }
            });
        } catch (error) {
            console.log(error);
        }
    }

    async runAllAutomod(client: XClient, message: XMessage): Promise<void> {
        try {
            if (!Bot.client) return;
            this.services.forEach(async (service: MessageService) => {
                if (service.text && service.name?.startsWith("automod_") && !service.disabled && message.author.id !== client.user?.id) {
                    await service.execute(client, message);
                }
            });
        } catch (error) {
            console.log(error);
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
        if (s && s.text) {
            return true;
        } else {
            return false;
        }
    }
}