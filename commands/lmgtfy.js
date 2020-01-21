module.exports = {
    name: 'lmgtfy',
    description: 'Teach the idiots of Discord how to use Google, or just get a quick search link. Make sure to trust the links in the embed',
    aliases:['search', 'google', 'iie'],
    usage:"[explainer: -e] [plain text link: -t] <search terms>",
    args: true,
    guildOnly: false,
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
        // if (args[0] == "-iie") {
        //     sengine = "lmgtfy.com/";
        //     iie = "&iie=1";
        //     args.shift();
        // }
        //let sterms = escape(args.join(" "));
        // u can keep the space and do encodeUri/encodeUriComponent
        //let sterms = args.join("%20");
        let sterms = args.join("+");
        //return console.log(`https://lmgtfy.com/?q=${sterms}${iie}`);
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
