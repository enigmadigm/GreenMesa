//const { token } = require("../../auth.json");
//const fetch = require("node-fetch");
const { Client } = require('discord.js');

function getMutualGuilds(userGuilds, botGuilds) {
    return userGuilds.filter(g => {
        return botGuilds.find(g2 => (g.id === g2.id) && (g.permissions & 0x20) === 0x20)
    });
}

const routerBuild = (client) => {
    const router = require('express').Router();
    
    router.get('/guilds', (req, res) => {
        if (!req.user) {
            return res.sendStatus(401);
        }
        if (!(client instanceof Client) || !Array.isArray(req.user.guilds) || !req.user.guilds.length) {
            return res.sendStatus(500);
        }
        const mg = getMutualGuilds(req.user.guilds, client.guilds.cache.array());
        res.send(mg);
    });

    router.put("/guilds/:id/prefix", (req, res) => {
        const { prefix } = req.body;
        if (!prefix || typeof prefix !== "string") {
            return res.sendStatus(400);
        }
        const { id } = req.params;
        if (typeof id !== "string" || id.length !== 18 || !/^[0-9]$/.test(id)) {
            return res.sendStatus(400);
        }
    })

    return router;
}

module.exports = routerBuild;