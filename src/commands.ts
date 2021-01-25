import { Collection } from "discord.js";
import fs from "fs";
import path from "path";
import { Category, Command } from "./gm";

export class Commands {
	public commands: Collection<string, Command>;
    public categories: Collection<string, Category>;
    private rootCommandPath: string;

    constructor() {
        this.commands = new Collection();
        this.categories = new Collection();
        this.rootCommandPath = path.join(__dirname, './commands/');
        this.load(this.rootCommandPath);
    }

    // ▼▲▼▲▼▲▼▲▼▲▼▲▼▲ for command handler, got this from https://discordjs.guide/command-handling/

    async load(dir: string): Promise<void> {
        const cf = fs.readdirSync(dir).filter(file => !file.startsWith('[template]'));
        // .filter(file => file.endsWith('.js') && !file.startsWith('[template]'))

        // https://stackoverflow.com/a/57088282/10660033
        type tcatsem = {
            [key: string]: string
        }

        const catsem: tcatsem = {
            fun: "🎉",
            utility: "🔬",
            moderation: "🛠",
            misc: "🎃"
        };

        let catNumber = 1;
        const folders = cf.filter(x => fs.lstatSync(dir + x).isDirectory());
        for (const folder of folders) {
            const storedCat = this.categories.find(c => c.name == folder);
            if (storedCat) {
                storedCat.count++;
            } else {
                const catdat: Category = {
                    name: '',
                    id: catNumber,
                    count: 1
                }
    
                if (Object.prototype.hasOwnProperty.call(catsem, folder)) {
                    catdat.emoji = catsem[folder];
                }
    
                catdat.name = folder;
                this.categories.set(folder, catdat);
                catNumber++;
            }

            this.load(dir + folder + "/");
        }

        const cmds = cf.filter(file => file.endsWith('.js'));
        if (cmds.length < 1) {
            console.log(`\x1b[33mWARNING: \x1b[32mno command files in ${dir}\x1b[0m`)
            return;
        }

        let commNumber = 1;
        for (const cmdfile of cmds) {

            const command: Command = await import(`${dir}${cmdfile}`);
            //const command = require(`./commands/${file}`);

            // set a new item in the Collection
            // with the key as the command name and the value as the exported module
            this.commands.set(command.name, command);

            // ▲▲▲▲▲ for commands
            // ▼▼▼▼▼ for categories
            const cpos = dir.replace(this.rootCommandPath, "").split("/");
            if (cpos.length < 1) {
                const storedmisc = this.categories.find(c => c.name === "misc");
                if (storedmisc) {
                    storedmisc.count++;
                } else {
                    this.categories.set("misc", {
                        name: "misc",
                        id: catNumber,
                        count: 1
                    });
                }
            }

            let noName = '';
            if (command.name == "" || command.name == null) {
                noName = ' \x1b[33mWARNING: \x1b[32mthis command has no name, it may not be configured properly\x1b[0m';
            }
            if (!command.execute) {
                noName = ' \x1b[33mWARNING: \x1b[32mthis command has no function, it may not be configured properly\x1b[0m';
            }
            console.log(`${commNumber} - %s$${command.name}%s has been loaded%s`, "\x1b[35m", "\x1b[0m", noName);

            commNumber++;
        }
    }
}
