import { Command } from "src/gm";
import { permLevels } from '../../permissions';
import { stringToChannel, stringToMember } from "../../utils/parsers";
import { DMChannel, MessageEmbedOptions, Permissions, PermissionString, TextChannel } from "discord.js";

export const command: Command = {
    name: "permsfrom",
    aliases: ["pf"],
    description: {
        short: "find from where perms are inherited",
        long: "Find all of the sources a permission is inherited from. This will search both the roles the member has and the permission overwrites of any channel."
    },
    usage: "<@member> <permission> [channel]",
    examples: [
        "@Darth SEND_MESSAGES #mod-chat",
    ],
    args: true,
    cooldown: 1,
    permLevel: permLevels.mod,
    guildOnly: true,
    permissions: ["MANAGE_CHANNELS", "MANAGE_ROLES"],
    async execute(client, message, args) {
        try {
            if (!message.guild || message.channel instanceof DMChannel) return;
            const target = await stringToMember(message.guild, args[0], true, true, true);
            if (!target) {
                await message.channel.send(`Target not found`);
                return;
            }
            args.shift();
            if (!args.length) {
                await message.channel.send(`You need to provide a permission flag.\nFormat it like \`SEND_MESSAGES\` or \`MANAGE_SERVER\`.`);
                return;
            }
            const flag = <PermissionString>args[0].toUpperCase();
            const flags = Object.keys(Permissions.FLAGS);
            // const isKeyOfFlag = (s: string): s is PermissionString => {
            //     return flags.includes(flag);
            // }
            if (!flags.includes(flag)) {
                await message.channel.send(`${flag} is not a valid flag, go look them up.\nhttps://discord.com/developers/docs/topics/permissions#permissions-bitwise-permission-flags`);
                return;
            }
            const bit = Permissions.FLAGS[flag];
            args.shift();
            let channel = message.channel;
            if (args.length) {
                const c = stringToChannel(message.guild, args[0], true, true);
                if (c && c instanceof TextChannel) {
                    channel = c;
                } else {
                    await message.channel.send(`Sorry, that's not a valid channel. You can leave it out if you want.`);
                    return;
                }
            }
            const tRoles = target.roles.cache;
            const originatingRoles = tRoles.filter(x => {
                return ((x.permissions.bitfield & bit) === bit);
            });
            const relevantOverwrites = channel.permissionOverwrites.filter(x => (x.allow.has(bit) || x.deny.has(bit)) && (x.type === "member" ? x.id === target.id : target.roles.cache.has(x.id)));
            const originatingOverwrites = relevantOverwrites.filter(x => x.allow.has(bit));
            const disallowingOverwrites = relevantOverwrites.filter(x => x.deny.has(bit));
            const embed: MessageEmbedOptions = {
                color: await client.database.getColor("info"),
                author: {
                    name: `Permission Inheritance`,
                    iconURL: target.user.avatarURL() || "",
                },
                description: `**Permission:** \`${flag}\`\n**Target:** ${target.user.tag} ${target}\n**Channel:** ${channel}`,
                fields: [],
            }
            if (!channel.permissionsFor(target)?.has(bit)/* !originatingRoles.size && !originatingOverwrites.size */) {
                embed.fields?.push({
                    name: `Absent`,
                    value: `${target} does not have this permission${!originatingRoles.size && !relevantOverwrites.size ? ` because no role or overwrite they have allows it` : (disallowingOverwrites.find(x => x.type === "member") ? ` because they have a personal overwrite in ${channel} denying it` : (disallowingOverwrites.find(x => x.type === "role") ? ` because the overwrite for ${tRoles.get(disallowingOverwrites.first()?.id || "")} denies it` : ``))}`,
                });
            } else {
                if (originatingRoles.size) {
                    embed.fields?.push({
                        name: `Originating Roles`,
                        value: `${originatingRoles.map(r => ` - ${r} - ${r.id}`).join("\n")}`,
                    });
                }
                if (originatingOverwrites.size) {
                    embed.fields?.push({
                        name: `Originating Overwrites`,
                        value: `${originatingOverwrites.map(o => ` - ${o.type === "member" ? `Overwrite for ${target}` : `${message.guild?.roles.cache.find(x => x.id === o.id)}`} - ${o.id}`).join("\n")}`,
                    });
                }
            }
            await message.channel.send({ embed });
        } catch (error) {
            xlg.error(error);
            await client.specials?.sendError(message.channel);
            return false;
        }
    }
}
