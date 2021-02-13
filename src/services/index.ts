import { Collection } from "discord.js";
import { MessageService, XClient, XMessage } from "../gm";
import fs from "fs";

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

    async runAll(client: XClient, message: XMessage): Promise<void> {
        try {
            this.services.forEach(async (service: MessageService) => {
                if (!service.disabled && !(service.name?.startsWith("automod_") && message.author.id === client.user?.id)) {
                    await service.execute(client, message);
                }
            });
        } catch (error) {
            console.log(error);
        }
    }

    async runAllAutomod(client: XClient, message: XMessage): Promise<void> {
        try {
            this.services.forEach(async (service: MessageService) => {
                if (service.name?.startsWith("automod_") && !service.disabled && message.author.id !== client.user?.id) {
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
}