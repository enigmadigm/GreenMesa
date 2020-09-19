module.exports = {
    name: 'lmgtfy',
    description: 'teach an idiot how to google, or just get a search link',
    aliases:['search', 'google', 'iie'],
    usage:"[explainer: -e] [plain text link: -t] <search terms>",
    args: true,
    guildOnly: false,
    category: 'fun',
    execute(client, message, args) {
        let sengine = "google.com/search";
        let iie = "";
        let plainText = false;
        if (args.join(' ').startsWith('-e -t') || args.join(' ').startsWith('-t -e')) {
            sengine = "lmgtfy.com/";
            iie = "&iie=1";
            args.shift();
            args.shift();
            plainText = true;
        } else if (args[0] == '-e') {
            sengine = "lmgtfy.com/";
            iie = "&iie=1";
            args.shift();
        } else if (args[0] == '-t') {
            plainText = true;
            args.shift();
        } else {
            plainText = false;
        }
        let sterms = args.join("+");
        if (plainText == true) {
            message.channel.send(`https://${sengine}?q=${sterms}${iie}`).catch(console.error);
        } else {
            message.channel.send({
                embed: {
                    "description": `[Your answer](https://${sengine}?q=${sterms}${iie})`,
                    "color": 15277667
                }
            }).catch(console.error);
        }
    }
}
