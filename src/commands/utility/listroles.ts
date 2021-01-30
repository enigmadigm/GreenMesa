import xlg from "../../xlogger";
import { permLevels } from '../../permissions';
import { Command } from "src/gm";
//import { getGlobalSetting } from "../dbmanager";

export const command: Command = {
    name: 'listroles',
    aliases: ['lsroles'],
    description: 'list all of the roles in the server',
    guildOnly: true,
    permLevel: permLevels.trustedMember,
    async execute(client, message) {
        try {
            if (!message.guild) return;
            const roleArray = message.guild.roles.cache.sort((roleA, roleB) => roleB.position - roleA.position).filter((x) => x.name !== "@everyone").array().map(r => `${message.guild?.roles.cache.get(r.id)}`);
            if (roleArray.join("\n").length > 1024) {
                while (roleArray.join("\n").length > 1010) {
                    roleArray.pop();
                }
                roleArray.push("***...some not shown***")
            }

            message.channel.send({
                embed: {
                    color: await client.database?.getColor("info_embed_color"), //7322774
                    author: {
                        name: `${message.guild.name} Roles`,
                        iconURL: message.guild.iconURL() || undefined
                    },
                    description: `${roleArray.join("\n") || '*none*'}`,
                    footer: {
                        text: `Roles: ${message.guild.roles.cache.array().length}`
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

