import xlg from "../xlogger";
import { permLevels } from '../permissions';
import { Command } from "src/gm";

export const command: Command = {
    name: "h",
    description: {
        short: "ignore me (must enable)",
        long: "This command must be explicitly enabled to use."
    },
    cooldown: 0,
    permLevel: permLevels.trustedMember,
    guildOnly: true,
    async execute(client, message, args) {
        try {
            if (message.gprefix !== "sm" || args.length || message.content !== "smh") return;// I pretty much only need the last check, but whatever

            const commandEnabledGlobal = await client.database?.getGlobalSetting(`${command.name}_enabled`);
            const commandEnabledGuild = await client.database?.getGuildSetting(message.guild || "", `${command.name}_toggle`);
            if ((commandEnabledGlobal && commandEnabledGlobal.value == 'false') || (!commandEnabledGuild || commandEnabledGuild.value === 'disable')) {
                return;
            }

            message.channel.send("my head");// It kind of annoys me when people say this actually
        } catch (error) {
            xlg.error(error);
            await client.specials?.sendError(message.channel);
            return false;
        }
    }
}
