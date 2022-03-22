import { permLevels } from '../../permissions.js';
import { Command, GuildMessageProps } from "src/gm";
import { MessageEmbedOptions, Permissions } from "discord.js";
import { PaginationExecutor } from "../../utils/pagination.js";
const maxlen = 15;// maximum number of roles to be displayed at one time

export const command: Command<GuildMessageProps> = {
    name: 'listroles',
    aliases: ['lsroles'],
    description: {
        short: `display roles in the server`,
        long: `Display the full list of roles in the server. This command is restricted to trusted members (lvl 1 PA) so that users interested in raiding the server do not have easy access to view roles.`,
    },
    flags: [
        {
            f: "e",
            d: "display roles with mention anything perms",
        },
        {
            f: "nonman",
            d: "list only non-managed roles (bot roles)",
        },
        {
            f: "vacant",
            d: "list only vacant (unassigned) roles",
        }
    ],
    guildOnly: true,
    permLevel: permLevels.trustedMember,
    async execute(client, message, args, flags) {
        try {
            const everyoneMentionableFlag = flags.find(x => x.name === "e" && !x.value);
            const nonManagedFlag = flags.find(x => x.name === "nonman" && !x.value);
            const vacantFlag = flags.find(x => x.name === "vacant" && !x.value)
            const roleArray = message.guild.roles.cache
                .sort((roleA, roleB) => roleB.position - roleA.position)
                .filter((x) => x.name !== "@everyone" && (!everyoneMentionableFlag || (x.permissions.bitfield & Permissions.FLAGS.MENTION_EVERYONE) === Permissions.FLAGS.MENTION_EVERYONE) && (!nonManagedFlag || !x.managed) && (!vacantFlag || !x.members.size))
                .map((r, i, c) => {
                    const prefix = `${c.size}`.split(/./).map(() => "0").join("").slice(0, `${c.size}`.length - `${r.position}`.length);
                    return `\`${prefix}${r.position}\` ${r} *${r.id}*`;
                });
            const roleCount = roleArray.length;
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
                        text: `Roles: ${roleCount}${everyoneMentionableFlag ? " • Can Mention Everyone" : ""}`
                    }
                };
                pages.push(e);
            }

            await PaginationExecutor.createEmbed(message, pages);
        } catch (error) {
            xlg.error(error);
            await client.specials.sendError(message.channel);
            return false;
        }
    }
}
