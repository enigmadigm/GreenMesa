import { Collection } from "discord.js";
import { MessageService, XClient, XMessage } from "../gm";
import fs from "fs";

export class MessageServices {
    private services: Collection<string, MessageService>;

    constructor() {
        this.services = new Collection();
    }

    async load(): Promise<void> {
        const serviceFiles = fs.readdirSync(__dirname).filter(file => file.endsWith('.js') && !file.startsWith('[template]') && file !== "index.js")

        for (const file of serviceFiles) {
            const { service } = await import(`${__dirname}/${file}`);
            
            this.services.set(file.split(".")[0], service);
            console.log(`Loaded service: ${file}`);
        }
    }

    async runAll(client: XClient, message: XMessage): Promise<void> {
        try {
            this.services.forEach(async (service: MessageService) => {
                if (!service.disabled) {
                    await service.execute(client, message);
                }
            });
        } catch (error) {
            console.log(error);
        }
    }
}