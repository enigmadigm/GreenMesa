import express from 'express'
import { XClient } from 'src/gm'
import auth from './auth'
import discord from './discord'
import { twitchRouter } from './twitch'

export default (client: XClient): express.Router => {
    const router = express.Router();

    router.use('/auth', auth);
    router.use('/discord', discord(client));
    router.use('/twitch', twitchRouter(client));
    
    return router;
}
