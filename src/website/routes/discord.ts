import { Client, Guild } from 'discord.js';
import xlg from '../../xlogger';
import express from 'express';
import { AutomoduleData, AutomoduleEndpointData, AutoroleEndpointData, GuildItemSpecial, GuildsEndpointData, LevelsEndpointData, PartialGuildObject, RoleData, RoleEndpointData, WarnConf, WarnConfEndpointData, XClient } from 'src/gm';
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

    // GETters

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

    router.get('/guildsall', async (req, res) => {
        if (!req.user) {
            return res.sendStatus(401);
        }
        if (!(client instanceof Client) || !Array.isArray(req.user.guilds) || !req.user.guilds.length) {
            return res.sendStatus(500);
        }
        const allGuilds = await client.specials?.getAllGuilds(client);
        const mg = getMutualGuilds(req.user.guilds, allGuilds ? allGuilds.array() : []);
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
        const allGuilds = await client.specials?.getAllGuilds(client);
        const mg = getMutualGuildsWithPerms(req.user.guilds, allGuilds ? allGuilds.array() : []);
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
        const allGuilds = await client.specials?.getAllGuilds(client);
        const mg = getMutualGuildsWithPerms(req.user.guilds, allGuilds ? allGuilds.array() : []);
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
        const allGuilds = await client.specials?.getAllGuilds(client);
        const mg = getMutualGuildsWithPerms(req.user.guilds, allGuilds ? allGuilds.array() : []);
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

    router.get("/guilds/:id/roles", async (req, res) => {
        const { id } = req.params;
        if (typeof id !== "string" || !/^[0-9]{18}$/g.test(id)) {
            return res.sendStatus(400);
        }
        if (!req.user) {
            return res.sendStatus(401);
        }
        const allGuilds = await client.specials?.getAllGuilds(client);
        const mg = getMutualGuildsWithPerms(req.user.guilds, allGuilds ? allGuilds.array() : []);
        if (!mg.find(x => x.id && x.id === id)) {
            return res.sendStatus(401);
        }
        const g = await client.guilds.fetch(id);
        if (!g) return res.sendStatus(404);

        const roles = g.roles.cache.filter(r => !r.managed && r.name !== "@everyone").map((c) => {
            const data: RoleData = {
                id: c.id,
                name: c.name,
                position: c.position,
                hexColor: c.hexColor
            }
            return data;
        }).sort((a, b) => b.position - a.position);

        try {
            const toSend: RoleEndpointData = {
                id,
                total: roles.length,
                roles
            };
            res.send(toSend);
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
        const allGuilds = await client.specials?.getAllGuilds(client);
        const mg = getMutualGuildsWithPerms(req.user.guilds, allGuilds ? allGuilds.array() : []);
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
        const allGuilds = await client.specials?.getAllGuilds(client);
        const mg = getMutualGuildsWithPerms(req.user.guilds, allGuilds ? allGuilds.array() : []);
        if (!mg.find(x => x.id && x.id === id)) {
            return res.sendStatus(401);
        }
        const g = mg.find(x => x.id === id);
        if (!g) return res.sendStatus(404);

        const mod = await client.database?.getAutoModule(id, name);
        if (!mod) {
            res.sendStatus(500);
            return;
        }

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

    router.get("/guilds/:id/levels", async (req, res) => {
        const { id } = req.params;
        if (typeof id !== "string" || !/^[0-9]{18}$/g.test(id)) {
            return res.sendStatus(400);
        }
        if (!req.user) {
            return res.sendStatus(401);
        }
        const allGuilds = await client.specials?.getAllGuilds(client);
        const mg = getMutualGuildsWithPerms(req.user.guilds, allGuilds ? allGuilds.array() : []);
        if (!mg.find(x => x.id && x.id === id)) {
            return res.sendStatus(401);
        }
        const g = mg.find(x => x.id === id);
        if (!g) return res.sendStatus(404);

        const levellingEnabled = await client.database?.getGuildSetting(g.id, 'xp_levels');
        let enabled = true;
        if (!levellingEnabled || levellingEnabled.value === 'disabled') {
            enabled = false;
        }
        const levelRows = await client.database?.getLevelRoles(g.id) || [];

        try {
            const toSend: LevelsEndpointData = {
                id,
                enabled,
                levels: levelRows
            }
            res.send(toSend);
        } catch (e) {
            xlg.error(e);
            res.sendStatus(500);
        }
    });

    router.get("/guilds/:id/autoroles", async (req, res) => {
        const { id } = req.params;
        if (typeof id !== "string" || !/^[0-9]{18}$/g.test(id)) {
            return res.sendStatus(400);
        }
        if (!req.user) {
            return res.sendStatus(401);
        }
        const allGuilds = await client.specials?.getAllGuilds(client);
        const mg = getMutualGuildsWithPerms(req.user.guilds, allGuilds ? allGuilds.array() : []);
        if (!mg.find(x => x.id && x.id === id)) {
            return res.sendStatus(401);
        }
        const g = mg.find(x => x.id === id);
        if (!g) return res.sendStatus(404);

        const arsRes = await client.database?.getGuildSetting(g.id, 'autoroles');
        const autoroles = [];

        try {
            const toSend: AutoroleEndpointData = {
                id,
                roles: []
            }
            res.send(toSend);
        } catch (e) {
            xlg.error(e);
            res.sendStatus(500);
        }
    });

    router.get("/guilds/:id/warnconf", async (req, res) => {
        try {
            const { id } = req.params;
            if (typeof id !== "string" || !/^[0-9]{18}$/g.test(id)) {
                return res.sendStatus(400);
            }
            if (!req.user) {
                return res.sendStatus(401);
            }
            const allGuilds = await client.specials?.getAllGuilds(client);
            const mg = getMutualGuildsWithPerms(req.user.guilds, allGuilds ? allGuilds.array() : []);
            if (!mg.find(x => x.id && x.id === id)) {
                return res.sendStatus(401);
            }
            const g = mg.find(x => x.id === id);
            if (!g) return res.sendStatus(404);

            const warnConfig = await client.database?.getGuildSetting(id, "warnconfig");
            let conf: WarnConf = {};
            try {
                if (warnConfig) {
                    conf = JSON.parse(warnConfig.value);
                }
            } catch (error) {
                //
            }
            if (!conf.threshold || typeof conf.threshold !== "number" || !conf.punishment || typeof conf.punishment !== "string") {
                await client.database?.editGuildSetting(g, "warnconfig", undefined, true);
                conf = {};
            }

            try {
                const toSend: WarnConfEndpointData = {
                    id,
                    conf: conf
                }
                res.send(toSend);
            } catch (e) {
                xlg.error(e);
                res.sendStatus(500);
            }
        } catch (error) {
            return res.sendStatus(500);
        }
    });

    // PUTters

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
        const allGuilds = await client.specials?.getAllGuilds(client);
        const mg = getMutualGuildsWithPerms(req.user.guilds, allGuilds ? allGuilds.array() : []);
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
        const allGuilds = await client.specials?.getAllGuilds(client);
        const mg = getMutualGuildsWithPerms(req.user.guilds, allGuilds ? allGuilds.array() : []);
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
        const allGuilds = await client.specials?.getAllGuilds(client);
        const mg = getMutualGuildsWithPerms(req.user.guilds, allGuilds ? allGuilds.array() : []);
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
        const allGuilds = await client.specials?.getAllGuilds(client);
        const mg = getMutualGuildsWithPerms(req.user.guilds, allGuilds ? allGuilds.array() : []);
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

    router.put("/guilds/:id/warnconf", async (req, res) => {
        try {
            const { data } = req.body;
            if (!module || !data || typeof data !== "string") {
                return res.sendStatus(400);
            }
            const { id } = req.params;
            if (typeof id !== "string" || !/^[0-9]{18}$/g.test(id)) {
                return res.status(400).send("Bad id");
            }
            if (!req.user) {
                return res.sendStatus(401);
            }
            const allGuilds = await client.specials?.getAllGuilds(client);
            const mg = getMutualGuildsWithPerms(req.user.guilds, allGuilds ? allGuilds.array() : []);
            if (!mg.find(x => x.id && x.id === id)) {
                return res.sendStatus(401);
            }

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const conformsToWarnConf = (o: any): o is WarnConf => {
                return typeof o.threshold === "number" && typeof o.punishment === "string" && typeof o.time === "number";
            }

            let parsedData: WarnConf;
            try {
                parsedData = JSON.parse(data);
                if (!conformsToWarnConf(parsedData)) {
                    return res.sendStatus(400);
                }
            } catch (error) {
                return res.sendStatus(400);
            }

            try {
                const g = await client.guilds.fetch(id);
                const result = await client.database?.editGuildSetting(g, `warnconfig`, JSON.stringify(parsedData));
                if (!result || !result.affectedRows) {
                    return res.sendStatus(500);
                }
                res.send({
                    guild: {
                        id,
                        data: parsedData
                    },
                });
            } catch (e) {
                xlg.error(e);
                res.sendStatus(500);
            }
        } catch (error) {
            xlg.error(error)
            return res.sendStatus(500);
        }
    });

    return router;
}

module.exports = routerBuild;