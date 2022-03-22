import { permLevels } from '../../permissions.js';
import { Command } from "src/gm";
import { stringToMember } from '../../utils/parsers.js';
import { MessageEmbed, MessageEmbedOptions } from 'discord.js';
import { PaginationExecutor } from '../../utils/pagination.js';
import moment from 'moment';

export const command: Command = {
    name: "record",
    description: {
        short: "get user malefactions",
        long: "Get the 'criminal' record of a certain user. The record is an aggregation of most moderator actions taken against a user.",
    },
    usage: "[@member]",
    args: false,
    cooldown: 3,
    permLevel: permLevels.trustedMember,
    moderation: true,
    guildOnly: true,
    async execute(client, message, args) {
        const a = args.join(" ");
        const target = (await stringToMember(message.guild, a, true, true, true)) ?? message.member;
        // if (!target) {
        //     await client.specials.sendError(message.channel, `I'm afraid that's not a valid member`);
        //     return;
        // }
        const infractions = await client.database.getModActionsByUser(target.guild.id, target.id);
        if (!infractions) {
            await client.specials.sendError(message.channel, `I couldn't find any infractions for ${target}`);
            return;
        }

        const pageBase: MessageEmbedOptions = {
            author: {
                name: `Moderation Record`,
                iconURL: target.user.displayAvatarURL(),
            },
            title: `${target.user.tag.escapeDiscord()}`,
            footer: {
                text: `ID: ${target.id}`,
            },
        };

        const warns = infractions.filter(x => x.type === "warn");
        const bans = infractions.filter(x => x.type === "ban");
        const unbans = infractions.filter(x => x.type === "unban");
        const kicks = infractions.filter(x => x.type === "kick");
        const mutes = infractions.filter(x => x.type === "mute");
        const unmutes = infractions.filter(x => x.type === "unmute");
        const others = infractions.filter(x => ![...warns, ...bans, ...unbans, ...kicks, ...mutes, ...unmutes].map(x2 => x2.id).includes(x.id));

        const statsPage = new MessageEmbed(pageBase)
            .setDescription(`**Total:** \`${infractions.length}\`\n\n${warns.length ? `**Warns:** \`${warns.length}\`\n` : ""}${bans.length ? `**Bans:** \`${bans.length}\`\n` : ""}${unbans.length ? `**Unbans:** \`${unbans.length}\`\n` : ""}${kicks.length ? `**Kicks:** \`${kicks.length}\`\n` : ""}${mutes.length ? `**Mutes:** \`${mutes.length}\`\n` : ""}${unmutes.length ? `**Unmutes:** \`${unmutes.length}\`\n` : ""}**Other:** \`${others.length}\``);
        
        const historyPages: MessageEmbed[] = [new MessageEmbed(pageBase).setDescription("")];
        let pi = 0;
        for (const d of infractions.sort((a, b) => moment(a.created).unix() - moment(b.created).unix() )) {
            const t = `\`${d.casenumber}\` \`${d.type}\``;
            if (`${historyPages[pi].description}\n${t}`.length > 512 || `${historyPages[pi].description}\n${t}`.split("\n").length > 20) {
                pi++;
                historyPages[pi] = new MessageEmbed(pageBase);
                historyPages[pi].setDescription(`${t}`);// possibly have some other header content to put before first infraction?
            } else {
                historyPages[pi].setDescription(`${historyPages[pi].description}\n${t}`);
            }
        }
        // const embeds: MessageEmbed[] = [];
        // for (const page of pages) {
        //     embeds.push(new MessageEmbed(embed).setDescription(embed.description + page));
        // }

        await PaginationExecutor.createEmbed(message, [statsPage, ...historyPages], undefined, true);
    }
}
