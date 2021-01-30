import xlg from "../xlogger";
import { permLevels } from '../permissions';
//import { getGlobalSetting } from "../dbmanager";
import { default as fetch } from "node-fetch";
import config from "../../auth.json";
import { Command } from "src/gm";
import { DMChannel } from "discord.js";

// https://github.com/Elementalmp4/GeraldCore/blob/master/commands/rule34.js

const command: Command = {
    name: "rule34",
    aliases: ["r34"],
    description: {
        short: "get a rule34 image",
        long: "**NSFW**. Get an image from rule34. Categories to come soon."
    },
    category: "nsfw",
    usage: "[tag]",
    args: false,
    specialArgs: 1,
    permLevel: permLevels.member,
    guildOnly: true,
    async execute(client, message, args) {
        try {
            if (message.channel instanceof DMChannel) return;
            // Checking to make sure the channel has nsfw enabled
            if (!message.channel.nsfw) {
                client.specials?.sendError(message.channel, "channel not nsfw");
                return;
            }

            const url = `https://gelbooru.com/index.php?page=dapi&s=post&q=index&pid=${Math.floor(Math.random() * 100)}&json=1&api_key=${config.GELBOORU.key}&user_id=${config.GELBOORU.user}`;
            let j;
            if (args.length) {
                const res = await fetch(url);
                j = await res.json();
            } else {
                const res = await fetch(url);
                j = await res.json();
            }
            if (!j || !j.length) {
                client.specials?.sendError(message.channel, "Could not retrieve r34");
                return;
            }

            const post = j[Math.floor(Math.random() * j.length)];
            if (!post.file_url) {
                client.specials?.sendError(message.channel, "No image");
                return;
            }

            const embed = {
                color: await client.database?.getColor("info_embed_color"),
                title: 'have some r34',
                url: post.source,
                image: {
                    url: post.file_url
                }
            };

            message.channel.send({ embed: embed });

        } catch (error) {
            xlg.error(error);
            await client.specials?.sendError(message.channel);
            return false;
        }
    }
}

export default command;