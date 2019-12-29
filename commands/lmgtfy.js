module.exports = {
    name: 'lmgtfy',
    description: 'Search for something on the internet',
    aliases:['search', 'google', 's', 'iie'],
    usage:"[explainer: iie] <search terms>",
    args: true,
    guildOnly: false,
    execute(client, message, args) {
        let sengine = "google.com";
        let iie = "";
        if (args[0] == "iie") {
            sengine = "lmgtfy.com";
            iie = "&iie=1";
            args.shift();
        }
        //let sterms = escape(args.join(" "));
        // u can keep the space and do encodeUri/encodeUriComponent
        //let sterms = args.join("%20");
        let sterms = args.join("+");
        //return console.log(`https://lmgtfy.com/?q=${sterms}${iie}`);
        message.channel.send({
            embed: {
                "description": `[Your answer](https://${sengine}/?q=${sterms}${iie})`,
                "color": 15277667,
                "footer": {
                    "text": "LMGTFY"
                }
            }
        }).catch(console.error);
    }
}