import moment from "moment";
import { permLevels } from '../../permissions';
import { Command } from "src/gm";

export const command: Command = {
    name: 'config',
    description: {
        short: `edit config`,
        long: `Using this command you can *currently* edit or view the bot's global settings that are configured in GlobalSetting DB. Settings that are fixed or configured elsewhere cannot be edited here.\n\nRun \`view\` as the first argument and then enter a setting name (must be exact) in order to view current setting and other details.`
    },
    aliases: ['conf'],
    usage: "<view/edit> <name/value/selector/cat>",
    cooldown: 3,
    permLevel: permLevels.botMaster,
    async execute(client, message, args) {
        try {
            const fail_embed_color = await client.database.getColor("fail");
            if (!args.length) {
                await message.channel.send({
                    embeds: [{
                        title: "Global Configuration Editing",
                        description: "This command allows for the editing of various configuration variables in the database from the text-line. For it to work, you must supply arguments like `view` or `edit` along with their various selectors. In order to use this command you must be a sys admin.",
                        color: fail_embed_color || 0,
                        footer: {
                            text: "*GlobalSettings",
                        },
                    }],
                });
                return;
            }
            const info_embed_color = await client.database.getColor("info");
            let argIndex = 0;
            switch (args[argIndex]) {
                case 'view': {
                    argIndex++;
                    if (!args[argIndex]) {
                        await message.channel.send("Please retry and supply a setting name to view.");
                        return;
                    }
                    const setting = await client.database.getGlobalSetting(args[argIndex]);
                    if (!setting) {
                        await message.channel.send("The property does not exist. You may create it with the `edit` option.");
                        return;
                    }

                    await message.channel.send({
                        embeds: [{
                            author: {
                                name: 'Settings',
                                icon_url: client.user?.displayAvatarURL(),
                            },
                            title: `${setting.name}`,
                            description: `${setting.value}`,
                            fields: [
                                {
                                    name: "Description",
                                    value: `${setting.description}`,
                                    inline: true,
                                },
                                {
                                    name: "Previous",
                                    value: `${setting.previousvalue || "none"}`,
                                    inline: true,
                                },
                                {
                                    name: "Last Updated",
                                    value: `${moment(setting.lastupdated).format()}`,
                                },
                                {
                                    name: "Updated By",
                                    value: `<@${setting.updatedby}>`,
                                },
                            ],
                            color: info_embed_color || 0,
                            footer: {
                                text: 'Viewing GlobalSettings',
                                icon_url: message.author.displayAvatarURL(),
                            },
                        }],
                    });
                    break;
                }
                case 'edit': {
                    argIndex++;
                    if (!args[argIndex] || !args[argIndex + 2]) {
                        await message.channel.send("Please retry and supply:```\nSELECTOR : SELECTOR VALUE : NEW VALUE\n```");
                        return false;
                    }
                    const status = await client.database.editGlobalSettings(args[argIndex] === "category" ? "category" : "name", args[argIndex + 1], message.author, args.slice(argIndex + 2).join("_"));
                    if (!status) {
                        await client.specials.sendError(message.channel);
                        return;
                    }
                    let changed = "Updated Setting"
                    if (status.changedRows == 0 && status.affectedRows > 0) {
                        changed = "Inserted Setting";
                    }
                    await message.channel.send({
                        embeds: [{
                            author: {
                                name: 'Settings',
                                icon_url: client.user?.displayAvatarURL(),
                            },
                            title: changed,
                            description: status.affectedRows + ' settings affected',
                            color: info_embed_color || 0,
                            footer: {
                                text: 'Viewing GlobalSettings',
                                icon_url: message.author.displayAvatarURL(),
                            }
                        }],
                    });
                    break;
                }
                default: {
                    break;
                }
            }
        } catch (error) {
            xlg.error(error);
            await client.specials.sendError(message.channel);
            return false;
        }
    }
}
