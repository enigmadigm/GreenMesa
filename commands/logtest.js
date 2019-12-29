module.exports = {
    name: 'logtest',
    description: 'log a test to the console',
    execute(client, message, args) {
        console.log(client.user.username + ` command handling successful (client, message, and args have come through). Args: ${args}`);
    }
}