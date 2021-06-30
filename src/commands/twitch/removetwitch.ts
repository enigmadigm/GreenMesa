import { permLevels } from '../../permissions';
import { unsubscribeTwitchSubscription } from "../../website/routes/twitch";
import { MessageEmbed } from "discord.js";
import { Command, GuildMessageProps } from "src/gm";

export const command: Command<GuildMessageProps> = {
    name: "removetwitch",
    aliases: ["rmtwitch"],
    description: {
        short: "remove an existing twitch notifier",
        long: "Remove a Twitch Notifier subscription. You will be prompted to destroy the notifier before the check for its existence. If you do not have a notifier under that UID, you will be told so after clicking confirm.",
    },
    usage: "<streamer>",
    examples: [
        "enigmadigm",
    ],
    args: 1,
    permLevel: permLevels.admin,
    guildOnly: true,
    async execute(client, message, args) {
        try {
            const confirmation = await client.specials.getUserConfirmation(message.channel, [message.author.id], `This will completely remove your Twitch notifier, continue?`, ``, `Aborted deletion process`, true);

            if (!confirmation) {
                return;
            } else {
                const unsubres = await unsubscribeTwitchSubscription(args.join(" "), message.guild.id);
                const finishMessage = new MessageEmbed();
                if (unsubres === true) {
                    finishMessage.setColor(await client.database.getColor("success"))
                        .setDescription(`Your notifier has been removed.`);
                } else if (unsubres === "NO_DATA") {
                    finishMessage.setColor(await client.database.getColor("fail"))
                        .setTitle(`Error`)
                        .setDescription(`Twitch is not responding, please try again later.`);
                } else if (unsubres === "NO_USER") {
                    finishMessage.setColor(await client.database.getColor("fail"))
                        .setTitle(`Error`)
                        .setDescription(`That streamer does not exist.\nQuickly remove streamer with the [dashboard](${client.specials.getDashboardLink(message.guild.id, "twitch")}).`);
                } else if (unsubres === "INVALID") {
                    finishMessage.setColor(await client.database.getColor("fail"))
                        .setTitle(`Error`)
                        .setDescription(`Invalid input.`);
                } else if (unsubres === "NO_SUBSCRIPTION") {
                    finishMessage.setColor(await client.database.getColor("fail"))
                        .setTitle(`Error`)
                        .setDescription(`Your notifier could not be removed, it may not exist.\nView subscriptions from the [dashboard](${client.specials.getDashboardLink(message.guild.id, "twitch")}).`);
                } else {
                    finishMessage.setColor(await client.database.getColor("fail"))
                        .setTitle(`Error`)
                        .setDescription(`Your notifier could not be removed.`)
                        .setFooter(`Try using the dashboard instead`);
                }
                await message.channel.send(finishMessage);
            }
        } catch (error) {
            xlg.error(error);
            await client.specials.sendError(message.channel);
            return false;
        }
    }
}
