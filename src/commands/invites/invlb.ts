import { permLevels } from '../../permissions';
import { Command, InvitedUserData } from "src/gm";
import { MessageEmbed, MessageEmbedOptions, Snowflake } from "discord.js";
import { PaginationExecutor } from '../../utils/pagination';
import { getDashboardLink } from '../../utils/specials';

export const command: Command = {
    name: "invlb",
    description: {
        short: "inviters leaderboard",
        long: "Get a leaderboard of the top inviters in your server. It shows users ranked by the number of valid invites they have."
    },
    usage: "<@member> [count|list|users]",
    args: 0,
    flags: [
        {
            f: "r",
            d: "view stats relative to the reset date",
        },
    ],
    cooldown: 4,
    permLevel: permLevels.member,
    guildOnly: true,
    permissions: ["MANAGE_GUILD"],
    async execute(client, message) {
        try {
            const data = await client.database.getInvites({ guildid: message.guild.id });
            if (!data.length) {
                await client.specials.sendError(message.channel, `Couldn't fetch invites data`, true);
                return;
            }
            const groupings: { user: Snowflake, invites: InvitedUserData[] }[] = [];// an array of members and their invites data, it only includes member who have an invite count
            for (const invite of data) {// for each invite in the guild, assign it to a grouping (grouping = member)
                const pre = groupings.find(x => x.user === invite.inviter);
                if (pre) {
                    pre.invites.push(invite);
                } else {
                    groupings.push({
                        user: invite.inviter as Snowflake,
                        invites: [invite],
                    });
                }
            }
            if (!groupings.length) {// if there were no invites to assign to userids
                await client.specials.sendError(message.channel, `No invite data to show`, true);
                return;
            }
            const embed: MessageEmbedOptions = {
                color: await client.database.getColor("info"),
                title: `Inviters Leaderboard`,
                description: ``,
            }
            const pages: string[] = [""];
            let pi = 0;
            for (const d of groupings.sort((a, b) => b.invites.length - a.invites.length)) {
                const u = d.user ? message.guild.members.cache.get(d.user)?.user : undefined;
                const tag = d.user ? u ? `${u.tag}${u.bot ? ` [BOT](${getDashboardLink()})` : ""}` : d.invites[0].invitername : `anonymous#0000`;
                const a = `\`${d.invites.length}\`\u200b\`INV\` ${tag}`;
                if (`${pages[pi]}\n${a}`.length > 512) {
                    pi++;
                    pages[pi] = a;
                } else {
                    pages[pi] += `\n${a}`;
                }
            }
            const embeds: MessageEmbed[] = [];
            for (const page of pages) {
                embeds.push(new MessageEmbed(embed).setDescription(embed.description + page));
            }
            await PaginationExecutor.createEmbed(message, embeds, undefined, true);
        } catch (error) {
            xlg.error(error);
            await client.specials.sendError(message.channel);
            return false;
        }
    }
}
