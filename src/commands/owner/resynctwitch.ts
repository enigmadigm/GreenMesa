import { permLevels } from '../../permissions';
import { Command } from "src/gm";
import { getFriendlyUptime } from '../../utils/time';
import { parseFriendlyUptime } from '../../utils/parsers';
import { MessageActionRow, MessageButton, CollectorFilter, MessageComponentInteraction, Permissions, MessageEmbed } from 'discord.js';
import { addTwitchWebhook } from '../../website/routes/twitch';
import { MessageButtonStyles } from 'discord.js/typings/enums';

const delay = 1000;
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
async function* delayedLoop(start: number, end: number, increment: number, delay: number) {
    for (let i = start; i < end; i += increment) {
        yield i
        await sleep(delay)
    }
}

export const command: Command = {
    name: "resynctwitch",
    description: {
        short: "disregard",
        long: "Resubscribe to all db-registered Twitch subscriptions.",
    },
    permLevel: permLevels.botMaster,
    async execute(client, message) {
        try {
            const targets = await client.database.getUniqueTwitchSubscriptions();
            if (!targets.length) {
                await client.specials.sendError(message.channel, `**Failure:** No subscriptions to sync`);
                return;
            }
            if (targets.length > 10) {
                const { end: confirm } = await client.specials.getUserConfirmation(message.channel, [message.author.id], `Are you sure you want to proceed?\nThis action affects ${targets.length} users.`, "", undefined, true);
                if (!confirm) {
                    return;
                }
            }

            const loop = delayedLoop(0, targets.length, 1, delay);
            const d = targets.length * delay + 500;
            const t = getFriendlyUptime(d);
            const fu = parseFriendlyUptime(t);
            const etaMessage = await message.channel.send({
                embeds: [{
                    color: await client.database.getColor("info"),
                    description: `**Syncing:** ${targets.length} registrations\n**ETA:** ${fu ? fu : "*should take no time at all*"}`,
                    footer: {
                        text: `Click 🔴 to cancel`,
                    },
                }],
                components: [
                    new MessageActionRow().addComponents(
                        new MessageButton({ customId: "abort", style: MessageButtonStyles.SECONDARY }).setEmoji("🔴")
                    )
                ],
            });
            const cancelOp = () => {
                loop.return();
            }

            // listener for the cancel button
            const filter: CollectorFilter<[MessageComponentInteraction]> = (inter) => {
                if (inter.user.id !== client.user?.id &&
                    inter.customId === 'abort' &&
                    (inter.member?.permissions instanceof Permissions && (inter.member.permissions.bitfield & Permissions.FLAGS.ADMINISTRATOR) === Permissions.FLAGS.ADMINISTRATOR || inter.user.id === message.author.id)) {
                    return true;
                }
                return false;
            };
            const collector = etaMessage.createMessageComponentCollector({ filter, time: d, maxUsers: 1 });
            // await etaMessage.react("🔴");

            collector.on('collect', async () => {
                // const e = new MessageEmbed(etaMessage.embeds[0]).setColor(await client.database.getColor("fail"));
                // await etaMessage.edit(e);
                cancelOp();
            });

            collector.on('end', async () => {
                const e = new MessageEmbed(etaMessage.embeds[0]).setFooter("");
                await etaMessage.edit({ embeds: [e], components: [] });
                cancelOp();
            });

            let cycles = 0;
            for await (const i of loop) {
                const s = targets[i];
                try {
                    await addTwitchWebhook(s.streamerid, true);
                    cycles++;
                } catch (error) {
                    xlg.error(error);
                }
            }

            if (cycles) {
                await message.channel.send({
                    embeds: [{
                        color: await client.database.getColor("success"),
                        description: `Successfully cycled ${cycles} times`
                    }],
                });
            } else {
                await client.specials.sendError(message.channel, `**Failure:** No successful cycles`);
            }
        } catch (e) {
            xlg.error(e);
            await client.specials.sendError(message.channel, `🔴 Execution Error:\n\`\`\`${e}\`\`\``);
        }
    }
}
