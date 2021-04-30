import { Client, ClientOptions } from 'discord.js';
import { Commands } from '../commands';
import { DBManager } from '../dbmanager';
import { XClient } from '../gm';
import { MessageServices } from '../services';
import * as Specials from "../utils/specials";
import config from "../../auth.json"; // Loading app config file

export default class extends Client implements XClient {
    public commands: XClient["commands"];
    public categories: XClient["categories"];
    public specials: typeof Specials;
    public database: DBManager;
    public services: MessageServices;
    public msgLogging = true;

    constructor(options?: ClientOptions) {
        super(options);

        if (typeof config.msgLogging === "string") {
            this.msgLogging = config.msgLogging;
        }
        if (!config.msgLogging) {
            this.msgLogging = false;
        }

        const co = new Commands();
        this.commands = co.commands;
        this.categories = co.categories;
        this.specials = Specials;
        this.services = new MessageServices();
        this.database = new DBManager();
        this.load(co);
    }

    private async load(co: Commands) {
        await co.load(co.rootCommandPath);
        await this.services.load();
        await this.database.handleDisconnect();
    }
}
