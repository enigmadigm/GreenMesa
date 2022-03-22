import express from 'express'
import { XClient } from 'src/gm'
import auth from './auth.js'
import discord from './discord.js'
import { twitchRouter } from './twitch.js'

export default (client: XClient): express.Router => {
    const router = express.Router();

    router.use('/auth', auth);
    router.use('/discord', discord(client));
    router.use('/twitch', twitchRouter(client));
    
    return router;
}
