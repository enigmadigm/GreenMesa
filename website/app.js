require('./strategies/discord');

//const xlg = require("../xlogger");
const express = require("express");
const passport = require('passport');
const path = require("path");
const PORT = process.env.WEBSITE_PORT || 3002;
const routes = require('./routes');
//const STATIC = process.env.DASHBOARD_STATIC_LOC || "./website/static";
const session = require("express-session");
const MySQLStore = require('express-mysql-session')(session);
const { conn } = require("../dbmanager");
const STATIC = "./static";

class MesaWebsite {
    constructor(client) {
        //configTwitchClient(client)
        this.client = client;
        this.app = express();
        
        this.app.use(session({
            secret: process.env.DASHBOARD_COOKIE_SECRET || "potato",
            cookie: {
                maxAge: 60000 * 60 * 24
            },
            resave: false,
            saveUninitialized: false,
            store: new MySQLStore({}, conn)
        }));
        this.app.use(express.static(path.join(__dirname, STATIC), { index: false, extensions: ['html'] }));// https://stackoverflow.com/a/40201169/10660033
        this.app.use(passport.initialize());
        this.app.use(passport.session());
        this.app.use('/api', routes);
        this.app.set('etag', false);
        this.app.get("/", (req, res) => {
            res.sendFile(path.join(__dirname, STATIC, "index.html"));
        });
        this.app.listen(PORT, () => console.log(`Running on port ${PORT}`));
    }

}

module.exports = MesaWebsite;
