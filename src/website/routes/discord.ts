//const { token } = require("../../auth.json");
//const fetch = require("node-fetch");
import { Client, Guild } from 'discord.js';
//import { setPrefix, getPrefix, getGlobalSetting, getGuildSetting } from '../../dbmanager';
import xlg from '../../xlogger';
import express from 'express';
import { PartialGuildObject, XClient } from 'src/gm';
import { Bot } from 'src/bot';

function getMutualGuilds(userGuilds: PartialGuildObject[], botGuilds: Guild[]) {
    return userGuilds.filter(g => {
        return botGuilds.find(g2 => (g.id === g2.id))
    });
}

function getMutualGuildsWithPerms(userGuilds: PartialGuildObject[], botGuilds: Guild[]) {
    return userGuilds.filter(g => {
        return botGuilds.find(g2 => (g.id === g2.id) && (g.permissions & 0x20) === 0x20)
    });
}

export default function routerBuild (client: XClient): express.Router {
    const router = express.Router();

    router.use(express.json());

    router.get('/guilds', (req, res) => {
        if (!req.user) {
            return res.sendStatus(401);
        }
        if (!(client instanceof Client) || !Array.isArray(req.user.guilds) || !req.user.guilds.length) {
            return res.sendStatus(500);
        }

        const mg = getMutualGuildsWithPerms(req.user.guilds, client.guilds.cache.array());
        res.send({
            guilds: mg,
            user: req.user
        });
    });

    router.get('/guildsall', (req, res) => {
        if (!req.user) {
            return res.sendStatus(401);
        }
        if (!(client instanceof Client) || !Array.isArray(req.user.guilds) || !req.user.guilds.length) {
            return res.sendStatus(500);
        }
        const mg = getMutualGuilds(req.user.guilds, client.guilds.cache.array());
        res.send({
            guilds: mg,
            user: req.user
        });
    });

    router.put("/guilds/:id/prefix", async (req, res) => {
        const { prefix } = req.body;
        if (!prefix || typeof prefix !== "string") {
            return res.status(400).send({ msg: "Bad prefix" });
        }
        const { id } = req.params;
        if (typeof id !== "string" || !/^[0-9]{18}$/g.test(id)) {
            return res.status(400).send({ msg: "Bad id" });
        }
        if (!req.user) {
            return res.status(401).send({ msg: "Not logged in" })
        }
        const mg = getMutualGuildsWithPerms(req.user.guilds, client.guilds.cache.array());
        if (!mg.find(x => x.id && x.id === id)) {
            return res.status(401).send({ msg: "Not authorized to manage guild" })
        }
        try {
            await client.database?.setPrefix(id, prefix);
            res.send({
                guild: {
                    id,
                    prefix
                }
            })
        } catch (e) {
            xlg.error(e);
            res.sendStatus(500);
        }
    });

    router.get("/guilds/:id/config", async (req, res) => {
        const { id } = req.params;
        if (typeof id !== "string" || !/^[0-9]{18}$/g.test(id)) {
            return res.sendStatus(400);
        }
        if (!req.user) {
            return res.status(401).send({ msg: "Not logged in" })
        }
        const mg = getMutualGuildsWithPerms(req.user.guilds, client.guilds.cache.array());
        if (!mg.find(x => x.id && x.id === id)) {
            return res.status(401).send({ msg: "Not authorized to manage guild" })
        }
        const g = await client.guilds.fetch(id);
        if (!g) return res.sendStatus(404);
        const r = await Bot.client.database?.getPrefix(id);
        let prefix = r ? r : false;
        if (!prefix) {
            const r = await client.database?.getGlobalSetting('global_prefix');
            prefix = r ? r.value : "sm";
        }
        if (!prefix) {
            return res.status(500).send({ msg: "Unable to retrieve prefix" });
        }
        const modAllRes = await client.database?.getGuildSetting(id, 'all_moderation');
        let modAll = false;
        if (modAllRes && modAllRes && modAllRes.value === "enabled") {
            modAll = true;
        }
        try {
            res.send({
                id,
                name: g.name,
                prefix,
                icon: g.iconURL(),
                members: g.memberCount,
                moderation: modAll
            });
        } catch (e) {
            xlg.error(e);
            res.sendStatus(500);
        }
    });

    return router;
}

module.exports = routerBuild;