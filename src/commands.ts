import { Collection } from "discord.js";
import fs from "fs";
import path from "path";
import { Category, Command } from "./gm";

export class Commands {
	public commands: Collection<string, Command>;
    public categories: Collection<string, Category>;
    public rootCommandPath: string;
    private commandNumber: number;

    constructor() {
        this.commands = new Collection();
        this.categories = new Collection();
        this.rootCommandPath = path.join(__dirname, './commands/');
        this.commandNumber = 1;
        //this.load(this.rootCommandPath);
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
                    count: 1,
                    commands: []
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

        for (const cmdfile of cmds) {
            const { command } = await import(`${dir}${cmdfile}`);
            if (!command) {
                console.log(`$ ${this.commandNumber} - \x1b[33mWARNING: \x1b[32mno command contained in this file, it will not work\x1b[0m`);
                continue;
            }

            if (!command.permissions) {//TODO: Requiring the SEND_MESSAGES perm by default, I may want to change this in the future
                command.permissions = ["SEND_MESSAGES", "EMBED_LINKS"];
            }
            if (!command.permissions.includes("SEND_MESSAGES")) {
                command.permissions.push("SEND_MESSAGES");
            }
            if (!command.permissions.includes("EMBED_LINKS")) {
                command.permissions.push("EMBED_LINKS");
            }

            //const command = require(`./commands/${file}`);

            // ▲▲▲▲▲ for commands
            // ▼▼▼▼▼ for categories
            const cpos = dir.replace(this.rootCommandPath, "").split("/");
            cpos.pop();
            if (cpos.length < 1 || !cpos[0]) {// if no directory structure for the command can be found, default to misc
                const storedmisc = this.categories.find(c => c.name === "misc");
                if (storedmisc) {
                    storedmisc.count++;
                    storedmisc.commands.push(command)
                } else {
                    this.categories.set("misc", {
                        name: "misc",
                        id: catNumber,
                        count: 1,
                        commands: [command],
                        emoji: "🎃"
                    });
                }
                //if (!command.category) {// this would be an overriding block
                    command.category = "misc";
                //}
            } else {// if a directory structure can be established, set the command's category to it's containing folder
                const storedcat = this.categories.find(c => c.name === cpos[cpos.length - 1]);
                if (storedcat) {
                    storedcat.count++;
                    storedcat.commands.push(command);
                } else {
                    this.categories.set(cpos[cpos.length - 1], {
                        name: cpos[cpos.length - 1],
                        id: catNumber,
                        count: 1,
                        commands: [command]
                    });
                }
                //if (!command.category) {
                    command.category = cpos[cpos.length - 1];
                //}
            }

            // set a new item in the Collection
            // with the key as the command name and the value as the exported module
            this.commands.set(command.name, command);

            let warnText = '';
            if (command.name == "" || command.name == null) {
                warnText = ' \x1b[33mWARNING: \x1b[32mthis command has no name, it may not be configured properly\x1b[0m';
            }
            if (!command.execute) {
                warnText = ' \x1b[33mWARNING: \x1b[32mthis command has no function, it may not be configured properly\x1b[0m';
            }
            console.log(`$ ${this.commandNumber} - %s$${command.name}%s has been loaded%s`, "\x1b[35m", "\x1b[0m", warnText);

            this.commandNumber++;
        }
    }
}
