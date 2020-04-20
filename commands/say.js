module.exports = {
    name: 'say',
    description: 'Make the bot say something. *currently public, may change*',
    args: true,
    usage: "<bot message>",
    guildOnly: true,
    execute(client, message, args) {
        message.delete().catch();
        message.channel.send(args.join(" "));
    }
}