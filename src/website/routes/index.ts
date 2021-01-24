const { Client } = require('discord.js')
const auth = require('./auth')
const discord = require('./discord')
const { twitchRouter } = require('./twitch')
const routerBuild = (client) => {
    if (!(client instanceof Client)) return;
    const router = require('express').Router();
    
    router.use('/auth', auth);
    router.use('/discord', discord(client));
    router.use('/twitch', twitchRouter(client));
    
    return router;
}

module.exports = routerBuild;