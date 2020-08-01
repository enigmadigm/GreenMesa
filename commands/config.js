const { getGlobalSetting, editGlobalSettings } = require("../dbmanager");
const xlg = require("../xlogger");
const moment = require("moment");

module.exports = {
    name: 'config',
    description: 'edit config',
    aliases: ['conf'],
    usage: "<view/edit> <name/value/selector/cat>",
    args: false,
    guildOnly: false,
    cooldown: 3,
    ownerOnly: true,
    permLevel: 4,
    /**
     * 
     * @param {discord.Client} client
     * @param {object}         message
     * @param {array}          args
     * @param {object}         conn
     */
    async execute(client, message, args) {
        let fec_gs = await getGlobalSetting("fail_embed_color");
        let fail_embed_color = parseInt(fec_gs[0].value);
        if (!args.length) {
            return message.channel.send({
                embed: {
                    title: "Global Configuration Editing",
                    description: "This command allows for the editing of various configuration variables in the database from the text-line. For it to work, you must supply arguments like `view` or `edit` along with their various selectors. In order to use this command you must be a sys admin.",
                    color: fail_embed_color || 0,
                    footer: {
                        text: "*GlobalSettings"
                    }
                }
            }).catch(xlg.error);
        }
        let iec_gs = await getGlobalSetting("info_embed_color");
        let info_embed_color = parseInt(iec_gs[0].value);
        var argIndex = 0;
        switch (args[argIndex]) {
            case 'view': {
                argIndex++;
                if (!args[argIndex]) {
                    message.channel.send("Please retry and supply a setting name to view.");
                    return false;
                }
                let setting = await getGlobalSetting(args[argIndex]).catch(xlg.error);
                if (!setting) {
                    message.channel.send("The property does not exist. You may create it with the `edit` option.");
                    return false;
                }
                setting = setting[0];
                let updatedby = client.users.cache.get(setting.updatedby);

                let embed = {
                    author: {
                        name: 'Settings',
                        icon_url: client.user.displayAvatarURL()
                    },
                    title: `${setting.name}`,
                    description: `${setting.value}`,
                    fields: [
                        {
                            name: "Description",
                            value: `${setting.description}`,
                            inline: true
                        },
                        {
                            name: "Previous",
                            value: `${setting.previousvalue || "none"}`,
                            inline: true
                        },
                        {
                            name: "Last Updated",
                            value: `${moment(setting.lastupdated).format()}`
                        },
                        {
                            name: "Updated By",
                            value: `${updatedby}`
                        }
                    ],
                    color: info_embed_color || 0,
                    footer: {
                        text: 'Viewing GlobalSettings',
                        icon_url: message.author.displayAvatarURL(),
                    }
                }
                message.channel.send({ embed: embed }).catch(xlg.error);
                break;
            }
            case 'edit': {
                argIndex++;
                if (!args[argIndex] || !args[argIndex+2]) {
                    message.channel.send("Please retry and supply:```\nSELECTOR : SELECTOR VALUE : NEW VALUE\n```");
                    return false;
                }
                let status = await editGlobalSettings(args[argIndex], args[argIndex + 1], message.author, args.slice(argIndex + 2).join("_")).catch(xlg.error);
                let changed = "Updated Setting"
                if (status.changedRows == 0 && status.affectedRows > 0) {
                    changed = "Inserted Setting";
                }
                let embed = {
                    author: {
                        name: 'Settings',
                        icon_url: client.user.displayAvatarURL()
                    },
                    title: changed,
                    description: status.affectedRows + ' settings affected',
                    color: info_embed_color || 0,
                    footer: {
                        text: 'Viewing GlobalSettings',
                        icon_url: message.author.displayAvatarURL(),
                    }
                }
                message.channel.send({ embed: embed }).catch(xlg.error);
                break;
            }
            default: {
                break;
            }
        }
    }
}