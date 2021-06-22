import { stringToRole } from '../../utils/parsers';
import { permLevels } from '../../permissions';
import { Command, GuildMessageProps } from "src/gm";

export const command: Command<GuildMessageProps> = {
    name: "rmrole",
    description: {
        short: "remove a role or cleanup roles",
        long: "Remove individual roles or mass delete roles using flag filters.",
    },
    usage: "<@role>",
    args: false,
    flags: [
        {
            f: "e",
            d: "delete empty roles",
        },
        {
            f: "pop",
            d: "remove roles with <= n members",
            v: "1000",
            isNumber: true,
        },
        {
            f: "x",
            d: "roles to exclude from filter deletion",
            v: "123456789012345678,812345678901234567",
            notEmpty: true,
            filter: /^[0-9]{18}(,[0-9]{18})*$/,
        },
    ],
    permLevel: permLevels.admin,
    guildOnly: true,
    moderation: true,
    permissions: ["MANAGE_ROLES"],
    async execute(client, message, args, flags) {
        try {
            if (flags.length) {
                const exclusionFlag = flags.find(x => x.name === "x");
                const exclude = exclusionFlag && exclusionFlag.value ? exclusionFlag.value.split(",") : [];
                const modeFlag = flags[0];
                let c = 0;
                if (modeFlag.name === "e") {
                    const rolesToDelete = message.guild.roles.cache.filter(r => !r.members.size && !exclude.includes(r.id));
                    for (const [, role] of rolesToDelete) {
                        try {
                            if (!role.deleted && role.editable) {
                                await role.delete();
                                c++;
                            }
                        } catch (error) {
                            //
                        }
                    }
                } else if (modeFlag.name === "pop") {
                    if (modeFlag.numberValue > -1) {
                        const rolesToDelete = message.guild.roles.cache.filter(r => r.members.size <= modeFlag.numberValue && !exclude.includes(r.id));
                        for (const [, role] of rolesToDelete) {
                            try {
                                if (!role.deleted && role.editable) {
                                    await role.delete();
                                    c++;
                                }
                            } catch (error) {
                                //
                            }
                        }
                    } else {
                        await message.channel.send(` `);
                    }
                } else {
                    await message.channel.send(`\`${modeFlag.name.escapeDiscord()}\` is no known flag`);
                    return;
                }
                if (c) {
                    await message.channel.send(`${c} roles were deleted`);
                } else {
                    await message.channel.send(`No roles were deleted.`);
                }
            } else if (args.length) {
                const a = args.join(" ");
                const target = stringToRole(message.guild, a, true, true);
                if (!target) {
                    await client.specials.sendError(message.channel, "That role could not be found.");
                    return;
                }
                if (target.name === "@everyone" && target.position === 0) {
                    await client.specials.sendError(message.channel, "@everyone is not a normal role and cannot be deleted");
                    return;
                }
                await target.delete();
                await message.channel.send({
                    embed: {
                        color: await client.database.getColor("success"),
                        description: `Role \`${target.name.escapeDiscord()}\` removed successfully`
                    }
                });
            } else {
                await client.specials.sendError(message.channel, `Arguments or flags are required for this command`);
            }
        } catch (error) {
            xlg.error(error);
            await client.specials.sendError(message.channel, "Failure removing role");
            return false;
        }
    }
}
