const {
    Collection
} = require("discord.js");
const fs = require("fs");
const path = require("path");

class Commands {
    constructor() {
        this.commands = new Collection();
        this.categories = new Collection();
        this.load();
    }

    // ▼▲▼▲▼▲▼▲▼▲▼▲▼▲ for command handler, got this from https://discordjs.guide/command-handling/

    load() {
        const cf = fs.readdirSync(path.join(__dirname, './commands')).filter(file => file.endsWith('.js') && !file.startsWith('[template]'));
        // .filter(file => file.endsWith('.js') && !file.startsWith('[template]'))
        let commNumber = 1;
        let catNumber = 1;
        for (const file of cf) {
            const command = require(`./commands/${file}`);
            // set a new item in the Collection
            // with the key as the command name and the value as the exported module
            this.commands.set(command.name, command);

            // ▲▲▲▲▲ for commands
            // ▼▼▼▼▼ for categories

            let catdat = {
                name: '',
                id: catNumber,
                count: 1
            }

            let catsem = {
                "fun": "🎉",
                "utility": "🔬",
                "moderation": "🛠",
                "misc": "🎃"
            };

            if (Object.keys(catsem).includes(command.category)) {
                catdat.emoji = catsem[command.category];
            } else {
                if (!command.category) catdat.emoji = catsem["misc"];
            }

            if (command.category && typeof command.category === 'string') {
                if (!this.categories.find(c => c.name == command.category)) {
                    catdat.name = command.category;
                    this.categories.set(command.category, catdat);
                    catNumber++;
                } else {
                    this.categories.find(c => c.name == command.category).count++;
                }

            } else {
                if (!this.categories.find(c => c.name == "misc")) {
                    catdat.name = 'misc';
                    this.categories.set('misc', catdat);
                } else {
                    this.categories.find(c => c.name === "misc").count++;
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

module.exports = Commands;
