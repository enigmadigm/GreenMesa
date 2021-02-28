import xlg from "../xlogger";
import { Message, MessageEmbed, MessageEmbedOptions, MessageReaction, User } from "discord.js";

interface PagerEntry {
    /**
     * The message id
     */
    id: string;
    pages: MessageEmbed[];
    currentPageNumber: number;
    currentPage: MessageEmbed;
}

// export class PagerEntry {
//     /**
//      * The message id
//      */
//     id: string;
//     pages: MessageEmbed[];
//     currentPageNumber: number;
//     currentPage: MessageEmbed;
//     public message: Message;

//     constructor() {}
// }

export class PaginationExecutor {
    private static pagers: PagerEntry[] = [];
    public static emojiLeft = "◀";
    public static emojiRight = "▶";

    public static async createEmbed(message: Message, embeds: MessageEmbedOptions[] | MessageEmbed[]): Promise<boolean> {
        try {
            if (!embeds.length) return false;

            const preexisting = this.pagers.find(x => x.id === message.id);
            if (preexisting) {
                this.pagers.splice(this.pagers.indexOf(preexisting));
            }
            const pages: MessageEmbed[] = [];
            for (const embed of embeds) {
                if (!(embed instanceof MessageEmbed)) {
                    pages.push(new MessageEmbed(embed));
                    continue;
                }
                pages.push(embed);
            }
            if (pages.length < 2) {
                await message.channel.send(pages[0]);
            } else {
                const p = new MessageEmbed(pages[0]);
                const current = await message.channel.send(p.setFooter(`1 of ${pages.length}${p.footer?.text ? ` | ${p.footer.text}` : ""}`));
                await current.react(this.emojiLeft);
                await current.react(this.emojiRight);
                this.pagers.push({
                    id: current.id,
                    pages: pages,
                    currentPageNumber: 0,
                    currentPage: pages[0]
                });
            }
            return true;
        } catch (error) {
            xlg.error(error);
            return false;
        }
    }

    public static async paginate(reaction: MessageReaction, user: User): Promise<void> {
        try {
            if (reaction.message.author.id !== reaction.message.client.user?.id || user.id === reaction.message.client.user?.id) return;
            if (reaction.emoji.name !== this.emojiLeft && reaction.emoji.name !== this.emojiRight) return;
            const pager = this.pagers.find(x => x.id === reaction.message.id);
            if (!pager) return;
            const direction = reaction.emoji.name === this.emojiLeft ? -1 : 1;
            pager.currentPageNumber = (pager.currentPageNumber + direction) > -1 ? (pager.currentPageNumber + direction) % pager.pages.length : pager.pages.length - 1;
            const p = new MessageEmbed(pager.pages[pager.currentPageNumber]);
            if (reaction.message.editable) {
                await reaction.message.edit(p.setFooter(`${pager.currentPageNumber + 1} of ${pager.pages.length}${p.footer?.text ? ` | ${p.footer.text}` : ""}`));
            }
            await reaction.users.remove(user);
        } catch (error) {
            xlg.error(error);
        }
    }
}