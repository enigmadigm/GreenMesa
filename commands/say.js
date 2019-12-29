module.exports = {
    name: 'say',
    description: 'Make the bot say something. This is currently open to the public, it may not always be this way.',
    args: true,
    usage: "<what you want the bot to say>",
    guildOnly: true,
    execute(client, message, args) {
        // makes the bot say something and delete the message. As an example, it's open to anyone to use. EDIT:
        // if say is empty the bot makes up something.
        if (args.length > 0) {
            // To get the "message" itself we join the `args` back into a string with spaces:
            const sayMessage = args.join(" ");
            // Then we delete the command message (sneaky, right?). The catch just ignores the error with a cute smiley thing.
            message.delete().catch(O_o => {});
            //not sure where I got this from (forgetting my edit: message.edit.catch(O_o=>{});
            // And we get the bot to say the thing:
            message.channel.send(args.join(" "));
        } else {
            // Else statement activated if user did not enter any parameters
            //cannot edit a message authored by another user =!=!= NOTE =!=!=
            //message.edit("ig idk");
            // Deleting command message from requesting user to make it look "cooler"
            message.delete().catch(O_o => {});
            // Telling user that the bot can't say anything without something to say
            message.channel.send("Ha! No. You need to tell me what to say.");
        }

    }
}