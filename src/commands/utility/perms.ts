import xlg from "../../xlogger";
import { permLevels } from '../../permissions';
import { Command } from "src/gm";
import { stringToMember } from "../../utils/parsers";
//import { getGlobalSetting } from "../dbmanager";

export const command: Command = {
    name: 'perms',
    aliases: ['mp'],
    description: 'get a list of perms a member has in a channel',
    usage: '[target member]',
    guildOnly: true,
    permLevel: permLevels.trustedMember,
    async execute(client, message, args) {
        try {
            if (!message.guild) return;
            const target = await stringToMember(message.guild, args.join(" "), true, true, true) || message.member || false;
            if (!target) {
                client.specials?.sendError(message.channel, "Invalid target.");
                return;
            }

            message.channel.send({
                embed: {
                    color: await client.database.getColor("info_embed_color"),
                    author: {
                        name: `${target.user.tag}`,
                        icon_url: target.user.displayAvatarURL()
                    },
                    description: `perms for this channel:\n\`\`\`${target.permissionsIn(message.channel).toArray().map(pr => `${pr}`).join("\n") || '*none*'}\`\`\``,
                    footer: {
                        text: `Perm int: ${target.permissionsIn(message.channel).bitfield}`
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

