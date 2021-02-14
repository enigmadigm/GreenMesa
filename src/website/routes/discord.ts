import { Client, Guild } from 'discord.js';
import xlg from '../../xlogger';
import express from 'express';
import { PartialGuildObject, XClient } from 'src/gm';
import { Bot } from '../../bot';
//const { token } = require("../../auth.json");
//const fetch = require("node-fetch");
//import { setPrefix, getPrefix, getGlobalSetting, getGuildSetting } from '../../dbmanager';

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
        if (modAllRes && modAllRes.value === "enabled") {
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

    router.get("/guilds/:id/home", async (req, res) => {
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

        const amRes = await client.database?.getGuildSetting(id, 'access_message');
        let am = false;
        if (amRes && amRes.value === "enabled") {
            am = true;
        }
        try {
            res.send({
                guild: {
                    id,
                    name: g.name,
                },
                home: {
                    permNotif: am
                }
            });
        } catch (e) {
            xlg.error(e);
            res.sendStatus(500);
        }
    });

    router.get("/guilds/:id/channels", async (req, res) => {
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

        interface ChannelData {
            id: string;
            name: string;
            type: string;
            position: number;
            parentID: string;
            nsfw?: boolean;
            topic?: string;
        }

        const channels = g.channels.cache.map((c) => {
            const data: ChannelData = {
                id: c.id,
                name: c.name,
                type: c.type,
                position: c.position,
                parentID: c.parentID || ""
                //parent: c.parent
            }
            if (c.isText()) {
                data.nsfw = c.nsfw;
                data.topic = c.topic || "";
            }
            return 
        })

        try {
            res.send({
                id,
                total: channels.length,
                channels
            });
        } catch (e) {
            xlg.error(e);
            res.sendStatus(500);
        }
    });

    router.get("/guilds/:id/automod", async (req, res) => {
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

        const allMods = client.services?.automods;
        const modConf = await client.database?.getGuildSettingsByPrefix(id, "automod_");
        if (!modConf || !allMods) {
            res.sendStatus(500);
            return;
        }

        /*interface ModData {
            name: string;
            enabled: boolean;
            channels: string[];
        }*/
        const mods = modConf.map((r) => {
            const name = r.property.split("_")[1];
            if (r.value === "all") {
                return {
                    name,
                    enabled: true,
                    channels: []
                }
            }
            const channels = r.value.split(",");
            return {
                name,
                enabled: !!channels.length,
                channels
            }
        }).filter(x => allMods.includes(x.name));
        for (const m of allMods) {
            if (!mods.find(x => x.name === m)) {
                mods.push({
                    name: m,
                    enabled: false,
                    channels: []
                });
            }
        }

        try {
            res.send({
                id,
                modules: mods
            });
        } catch (e) {
            xlg.error(e);
            res.sendStatus(500);
        }
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

    router.put("/guilds/:id/moderation", async (req, res) => {
        const { moderation } = req.body;
        if (!moderation || typeof moderation !== "string" || (moderation !== "true" && moderation !== "false")) {
            return res.status(400).send({ msg: "Invalid moderation" });
        }
        const { id } = req.params;
        if (typeof id !== "string" || !/^[0-9]{18}$/g.test(id)) {
            return res.status(400).send({ msg: "Bad id" });
        }
        if (!req.user) {
            return res.status(401).send({ msg: "Not logged in" });
        }
        const mg = getMutualGuildsWithPerms(req.user.guilds, client.guilds.cache.array());
        if (!mg.find(x => x.id && x.id === id)) {
            return res.status(401).send({ msg: "Not authorized to manage guild" });
        }
        try {
            const g = await client.guilds.fetch(id);
            if (moderation === "true") {
                await client.database?.editGuildSetting(g, "all_moderation", "enabled");
            } else {
                await client.database?.editGuildSetting(g, "all_moderation", undefined, true);
            }
            res.send({
                guild: {
                    id,
                    moderation
                },
                user: req.user,
            });
        } catch (e) {
            xlg.error(e);
            res.sendStatus(500);
        }
    });

    router.put("/guilds/:id/permnotif", async (req, res) => {
        const { permnotif } = req.body;
        if (!permnotif || typeof permnotif !== "string" || (permnotif !== "true" && permnotif !== "false")) {
            return res.status(400).send({ msg: "Invalid permnotif" });
        }
        const { id } = req.params;
        if (typeof id !== "string" || !/^[0-9]{18}$/g.test(id)) {
            return res.status(400).send({ msg: "Bad id" });
        }
        if (!req.user) {
            return res.status(401).send({ msg: "Not logged in" });
        }
        const mg = getMutualGuildsWithPerms(req.user.guilds, client.guilds.cache.array());
        if (!mg.find(x => x.id && x.id === id)) {
            return res.status(401).send({ msg: "Not authorized to manage guild" });
        }
        try {
            const g = await client.guilds.fetch(id);
            if (permnotif === "true") {
                await client.database?.editGuildSetting(g, "access_message", "enabled");
            } else {
                await client.database?.editGuildSetting(g, "access_message", undefined, true);
            }
            res.send({
                guild: {
                    id,
                    permNotif: permnotif
                },
                user: req.user,
            });
        } catch (e) {
            xlg.error(e);
            res.sendStatus(500);
        }
    });

    router.put("/guilds/:id/automod", async (req, res) => {
        const { module, state } = req.body;
        const allMods = client.services?.automods || [];
        if (!module || !state || typeof module !== "string" || !(allMods.includes(module)) || typeof state !== "string") {
            return res.sendStatus(400);
        }
        const { id } = req.params;
        if (typeof id !== "string" || !/^[0-9]{18}$/g.test(id)) {
            return res.status(400).send({ msg: "Bad id" });
        }
        if (!req.user) {
            return res.status(401).send({ msg: "Not logged in" });
        }
        const mg = getMutualGuildsWithPerms(req.user.guilds, client.guilds.cache.array());
        if (!mg.find(x => x.id && x.id === id)) {
            return res.status(401).send({ msg: "Not authorized to manage guild" });
        }

        if (!/^(?:(?:,?[0-9]{18})+|all|disable)$/g.test(state)) {
            return res.sendStatus(400);
        }
        //const val = state.split(",").length ? state.split(",") : state;
        try {
            const g = await client.guilds.fetch(id);
            if (state === "disable") {
                const result = await client.database?.editGuildSetting(g, `automod_${module}`, undefined, true);
                console.log(result);
            } else {
                const result = await client.database?.editGuildSetting(g, `automod_${module}`, state);
                console.log(result);
            }
            res.send({
                guild: {
                    id,
                    module
                },
                user: req.user,
            });
        } catch (e) {
            xlg.error(e);
            res.sendStatus(500);
        }
    });

    return router;
}

module.exports = routerBuild;