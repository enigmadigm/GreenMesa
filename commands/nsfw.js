// what ass (nsfw)
function nsfwAss() {
    var rand = ['bath_pussy.jpg', '18709885.jpg', '20976328.jpg', 'tumblr_p1p28gKz7o1ui7kc0o1_1280.jpg', 'hailee_steinfeld_naked_ass.jpg', 'real-bad-ideas-for-the-weekend-2545.jpg'];
    return "media/" + rand[Math.floor(Math.random() * rand.length)];
}

function nsfwPussy() {
    var rand = ['19041137.gif', 'hailee_steinfeld_naked_ass.jpg', 'bath_pussy.jpg', 'tumblr_p1p28gKz7o1ui7kc0o1_1280.jpg', 'hailee_steinfeld_naked_ass.jpg', 'O0AhK.jpg', 'jessicaalba.jpg', 'JessicaAlbaHardcoreSexFuckedinPussy.png', 'guerlain.jpg', 'girls-masterbating.jpg'];
    return "media/" + rand[Math.floor(Math.random() * rand.length)];
}

module.exports = {
    name: 'nsfw',
    description: 'technically this one shouldn\'t be here',
    args: true,
    usage: "<ass/pussy/...>",
    execute(client, message, args) {
        if (args[0] == "ass") {
            message.channel.send({ files: [nsfwAss()] }).catch(console.error);
        } else if (args[0] == "pussy") {
            message.channel.send({ files: [nsfwPussy()] }).catch(console.error);
        }
        /*if (typeof args[0] == 'undefined') {
            message.channel.send("Please supply an argument (e.g. ass, pussy), and you will be given the content.");
        }*/
    }
}