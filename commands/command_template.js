module.exports = {
    name: '',
    description: '',
    aliases:[],
    usage:"",
    args:false,
    guildOnly:false,
    cooldown: 3,
    ownerOnly: false,
    execute(client, message, args, conn, snekfetch) {
        console.log('haha the template command was somehow executed even though name wasn\'t defined.');
    }
}