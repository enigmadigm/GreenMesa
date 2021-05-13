
import { permLevels } from '../../permissions';
import { Command } from "src/gm";
import { MessageEmbedOptions } from "discord.js";
import { PaginationExecutor } from "../../utils/pagination";
//import { getGlobalSetting } from "../dbmanager";
const maxlen = 15;

export const command: Command = {
    name: 'listroles',
    aliases: ['lsroles'],
    description: 'list all of the roles in the server',
    guildOnly: true,
    permLevel: permLevels.trustedMember,
    async execute(client, message) {
        try {
            if (!message.guild) return;
            //const roles = await message.guild.roles.fetch();
            const roleArray = message.guild.roles.cache
                .sort((roleA, roleB) => roleB.position - roleA.position)
                .filter((x) => x.name !== "@everyone")
                .array()
                .map(r => {
                    const role = message.guild?.roles.cache.get(r.id);
                    if (role) {
                        return `${role.position + 1} ${role}`
                    } else {
                        return `unknown role`
                    }
                });
            const roleOverflowArray: string[][] = [];
            let runs = 0;
            if (roleArray.length > maxlen || roleArray.join("\n").length > 1024) {
                while (roleArray.length) {
                    runs++;
                    if (runs > 10000) {
                        break;
                    }
                    const overRoles: string[] = [];
                    while (overRoles.length <= maxlen && overRoles.join("\n").length <= 1024) {
                        overRoles.push(roleArray[0]);
                        roleArray.shift();
                    }
                    roleOverflowArray.push(overRoles);
                }
            } else {
                roleOverflowArray.push(roleArray);
            }

            const pages: MessageEmbedOptions[] = [];
            for (const page of roleOverflowArray) {
                const e: MessageEmbedOptions = {
                    color: await client.database.getColor("info"), //7322774
                    author: {
                        name: `${message.guild.name} Roles`,
                        iconURL: message.guild.iconURL() || undefined
                    },
                    description: `${page.join("\n") || '*none*'}`,
                    footer: {
                        text: `Roles: ${message.guild.roles.cache.array().length}`
                    }
                };
                pages.push(e);
            }

            PaginationExecutor.createEmbed(message, pages);
        } catch (error) {
            xlg.error(error);
            await client.specials?.sendError(message.channel);
            return false;
        }
    }
}

