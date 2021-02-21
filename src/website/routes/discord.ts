import { Client, Guild } from 'discord.js';
import xlg from '../../xlogger';
import express from 'express';
import { AutomoduleData, AutomoduleEndpointData, GuildItemSpecial, GuildsEndpointData, PartialGuildObject, XClient } from 'src/gm';
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

function getApplicableGuilds(userGuilds: PartialGuildObject[], botGuilds: Guild[]) {
    const validGuilds = userGuilds.filter((guild) => (guild.permissions & 0x20) === 0x20);
    const included: PartialGuildObject[] = [];
    const excluded = validGuilds.filter((guild) => {
        const findGuild = botGuilds.find((g) => g.id === guild.id);
        if (!findGuild) return guild;
        included.push(guild);
    });
    return { excluded, included };
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

        const { excluded, included } = getApplicableGuilds(req.user.guilds, client.guilds.cache.array());
        const guilds: GuildItemSpecial[] = [
            ...excluded.map((e) => {
                const g: GuildItemSpecial = {
                    bot: false,
                    icon: e.icon,
                    id: e.id,
                    name: e.name,
                    owner: e.owner,
                    permissions: e.permissions
                };
                return g;
            }),
            ...included.map((e) => {
                const g: GuildItemSpecial = {
                    bot: true,
                    icon: e.icon,
                    id: e.id,
                    name: e.name,
                    owner: e.owner,
                    permissions: e.permissions
                };
                return g;
            })
        ].sort((a) => a.bot ? -1 : 1);
        const r: GuildsEndpointData = {
            guilds
        }
        res.send(r);
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
            return res.sendStatus(401);
        }
        const mg = getMutualGuildsWithPerms(req.user.guilds, client.guilds.cache.array());
        if (!mg.find(x => x.id && x.id === id)) {
            return res.sendStatus(401);
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
            return res.sendStatus(401);
        }
        const mg = getMutualGuildsWithPerms(req.user.guilds, client.guilds.cache.array());
        if (!mg.find(x => x.id && x.id === id)) {
            return res.sendStatus(401);
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
            return res.sendStatus(401);
        }
        const mg = getMutualGuildsWithPerms(req.user.guilds, client.guilds.cache.array());
        if (!mg.find(x => x.id && x.id === id)) {
            return res.sendStatus(401);
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
            return data;
        }).sort((a, b) => a.position - b.position);

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

    router.get("/guilds/:id/allautomods", async (req, res) => {
        const { id } = req.params;
        if (typeof id !== "string" || !/^[0-9]{18}$/g.test(id)) {
            return res.sendStatus(400);
        }
        if (!req.user) {
            return res.sendStatus(401);
        }
        const mg = getMutualGuildsWithPerms(req.user.guilds, client.guilds.cache.array());
        if (!mg.find(x => x.id && x.id === id)) {
            return res.sendStatus(401);
        }
        const g = await client.guilds.fetch(id);
        if (!g) return res.sendStatus(404);

        const mods = await client.database?.getAllAutoModules(id);
        if (!mods) {
            res.sendStatus(500);
            return;
        }

        /*interface ModData {
            name: string;
            enabled: boolean;
            channels: string[];
        }*/

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

    router.get("/guilds/:id/automod/:name", async (req, res) => {
        const { id, name } = req.params;
        if (typeof id !== "string" || !/^[0-9]{18}$/g.test(id) || typeof name !== "string") {
            return res.sendStatus(400);
        }
        const allMods = client.services?.automods || [];
        if (!(allMods.includes(name))) {
            return res.status(400).send("Module does not exist");
        }
        if (!req.user) {
            return res.sendStatus(401);
        }
        const mg = getMutualGuildsWithPerms(req.user.guilds, client.guilds.cache.array());
        if (!mg.find(x => x.id && x.id === id)) {
            return res.sendStatus(401);
        }
        const g = await client.guilds.fetch(id);
        if (!g) return res.sendStatus(404);

        const mod = await client.database?.getAutoModule(id, name);
        if (!mod) {
            res.sendStatus(500);
            return;
        }

        /*interface ModData {
            name: string;
            enabled: boolean;
            channels: string[];
        }*/

        try {
            const toSend: AutomoduleEndpointData = {
                id,
                automodule: mod
            }
            res.send(toSend);
        } catch (e) {
            xlg.error(e);
            res.sendStatus(500);
        }
    });

    router.put("/guilds/:id/prefix", async (req, res) => {
        const { prefix } = req.body;
        if (!prefix || typeof prefix !== "string") {
            return res.status(400).send("Bad prefix");
        }
        const { id } = req.params;
        if (typeof id !== "string" || !/^[0-9]{18}$/g.test(id)) {
            return res.status(400).send("Bad id");
        }
        if (!req.user) {
            return res.sendStatus(401);
        }
        const mg = getMutualGuildsWithPerms(req.user.guilds, client.guilds.cache.array());
        if (!mg.find(x => x.id && x.id === id)) {
            return res.sendStatus(401);
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
            return res.status(400).send("Invalid moderation");
        }
        const { id } = req.params;
        if (typeof id !== "string" || !/^[0-9]{18}$/g.test(id)) {
            return res.status(400).send("Bad id");
        }
        if (!req.user) {
            return res.sendStatus(401);
        }
        const mg = getMutualGuildsWithPerms(req.user.guilds, client.guilds.cache.array());
        if (!mg.find(x => x.id && x.id === id)) {
            return res.sendStatus(401);
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
            return res.status(400).send("Invalid permnotif");
        }
        const { id } = req.params;
        if (typeof id !== "string" || !/^[0-9]{18}$/g.test(id)) {
            return res.status(400).send("Bad id");
        }
        if (!req.user) {
            return res.sendStatus(401);
        }
        const mg = getMutualGuildsWithPerms(req.user.guilds, client.guilds.cache.array());
        if (!mg.find(x => x.id && x.id === id)) {
            return res.sendStatus(401);
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
        const { module, data } = req.body;
        const allMods = client.services?.automods || [];
        if (!module || !data || typeof module !== "string" || !(allMods.includes(module)) || typeof data !== "string") {
            return res.sendStatus(400);
        }
        const { id } = req.params;
        if (typeof id !== "string" || !/^[0-9]{18}$/g.test(id)) {
            return res.status(400).send("Bad id");
        }
        if (!req.user) {
            return res.sendStatus(401);
        }
        const mg = getMutualGuildsWithPerms(req.user.guilds, client.guilds.cache.array());
        if (!mg.find(x => x.id && x.id === id)) {
            return res.sendStatus(401);
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const conformsToAutomodule = (o: any): o is AutomoduleData => {
            return typeof o.name === "string" && typeof o.text === "boolean" && typeof o.enableAll === "boolean";
        }

        let parsedData: AutomoduleData;
        try {
            parsedData = JSON.parse(data);
            if (!conformsToAutomodule(parsedData)) {
                return res.sendStatus(400);
            }
        } catch (error) {
            return res.sendStatus(400);
        }

        try {
            const g = await client.guilds.fetch(id);
            const result = await client.database?.editGuildSetting(g, `automod_${module}`, JSON.stringify(parsedData));
            if (!result || !result.affectedRows) {
                return res.sendStatus(500);
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