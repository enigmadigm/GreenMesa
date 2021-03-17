import { Client, Guild } from 'discord.js';
import xlg from '../../xlogger';
import express from 'express';
import { Bot } from '../../bot';
import { IncomingMessage } from 'http';
import { getMutualGuildsWithPerms } from './discord';
import { XClient } from '../../gm';

/*interface CustomIncoming extends IncomingMessage {
    twitch_signature: string;
}*/

export default function routerBuild(client: XClient): express.Router {
    const router = express.Router();

    router.use(express.json());

    router.get("/*", (req, res) => {
        console.log("y")
        res.send(req.url)
    })

    router.get("/test", (req, res) => {
        res.send({success: true})
    });

    return router;
}
