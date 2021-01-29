import { Command } from "src/gm";
import xlg from "../xlogger";

const command: Command = {
    name: 'intro',
    description: {
        short: "provides a *crappy* introduction to the bot",
        long: "Get an introduction to the bot. More information can be found elsewhere, such as the website, the repo, and command info can be found using the `help` command. This command provides some basic information."
    },
    async execute(client, message) {
        try {
        message.channel.send({
            embed: {
                color: 3447003,
                title: "Introduction",
                description: "I, a multidisfunctioning bot, was built by ComradeRooskie#6969, who runs [his Palace (Discord Server)](https://discord.gg/AvXvvSg). This bot can do a bunch of stuff, and bigger and better features are always in development ;).",
                fields: [
                    {
                        name: "Do you have any commands?",
                        value: `*Yes in fact.* Use the \` ${message.gprefix}help \` command to get info on them.`
                    },
                    {
                        name: "What if I have an idea?",
                        value: "If you want to make a request, please open up an issue [here](https://github.com/enigmadigm/greenmesa/issues) (issues don't have to be bugs)."
                    },
                    {
                        name: "How do I find out more?",
                        value: "I have my very own [website under development](https://enigmadigm.com/apps/greenmesa/help) that I hope will be available to help in a greater capacity soon."
                    },
                    {
                        name: "What am I supposed to do?",
                        value: `Again, \`${message.gprefix}help\` will get you on the right path, and don't  get  caught  doing  anything  stupid. This shouldn't be that hard to figure out.`
                    }
                ],
                timestamp: new Date().getTime(),
                footer: {
                    icon_url: client.user?.avatarURL() || undefined,
                    text: `The Intro | See ${message.gprefix}info for app info`
                }
            }
        });
        } catch (error) {
            xlg.error(error);
            await client.specials?.sendError(message.channel);
            return false;
        }
    }
}

export default command;