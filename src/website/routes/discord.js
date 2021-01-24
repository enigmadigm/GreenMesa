//const { token } = require("../../auth.json");
//const fetch = require("node-fetch");
const { Client } = require('discord.js');
const { setPrefix, getPrefix, getGlobalSetting, getGuildSetting } = require('../../dbmanager');
const xlg = require('../../xlogger');
const express = require('express');

function getMutualGuilds(userGuilds, botGuilds) {
    return userGuilds.filter(g => {
        return botGuilds.find(g2 => (g.id === g2.id))
    });
}

function getMutualGuildsWithPerms(userGuilds, botGuilds) {
    return userGuilds.filter(g => {
        return botGuilds.find(g2 => (g.id === g2.id) && (g.permissions & 0x20) === 0x20)
    });
}

const routerBuild = (client) => {
    if (!(client instanceof Client)) return;
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
            await setPrefix(id, prefix);
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
        let prefix = await getPrefix(id);
        if (!prefix) {
            prefix = (await getGlobalSetting('global_prefix'))[0].value;
        }
        if (!prefix) {
            return res.status(500).send({ msg: "Unable to retrieve prefix" });
        }
        const modAllRes = await getGuildSetting(id, 'all_moderation');
        let modAll = false;
        if (modAllRes && modAllRes[0] && modAllRes[0].value === "enabled") {
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