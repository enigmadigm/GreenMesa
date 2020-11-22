require('./strategies/discord');

const express = require("express");
const passport = require('passport');
const PORT = process.env.WEBSITE_PORT || 3002;
const routes = require('./routes');

class MesaWebsite {
    constructor(client) {
        this.client = client;
        this.app = express();
        
        this.app.use('/api', routes);
        this.app.use(passport.initialize());
        this.app.use(passport.session());
        this.app.listen(PORT, () => console.log(`Running on port ${PORT}`));
    }

}

module.exports = MesaWebsite;
