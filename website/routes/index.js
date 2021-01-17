const auth = require('./auth')
const discord = require('./discord')
const { twitchRouter } = require('./twitch')
const routerBuild = (client) => {
    const router = require('express').Router();
    
    router.use('/auth', auth);
    router.use('/discord', discord(client));
    router.use('/twitch', twitchRouter);
    
    return router;
}

module.exports = routerBuild;