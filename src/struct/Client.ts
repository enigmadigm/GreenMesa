import { Client, ClientOptions } from 'discord.js';
import { Commands } from '../commands.js';
import { DBManager } from '../dbmanager.js';
import { XClient } from '../gm';
import { MessageServices } from '../services/index.js';
import * as Specials from "../utils/specials.js";
import config from "../../auth.json" assert {type: "json"}; // Loading app config file
import Invites from './Invites.js';

export default class extends Client implements XClient {
    public commands: XClient["commands"];
    public categories: XClient["categories"];
    public specials: typeof Specials;
    public database: DBManager;
    public services: MessageServices;
    public msgLogging = true;
    public invites: Invites;

    constructor(options: ClientOptions) {
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
        this.invites = new Invites(this);
        this.services = new MessageServices();
        this.database = new DBManager();
        this.load(co);
    }

    private async load(co: Commands) {
        await this.database.handleDisconnect();
        await co.load(co.rootCommandPath);
        await this.services.load();
        xlg.log(`Loading completed`)
    }
}
