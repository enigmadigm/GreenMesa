'use strict';

// To all for `import - from '-'` and `export async function function() {}` in modules I must change the eslint sourcetype to module
// and change the package.json tyope to module, then replace all require()s and exports.method/module.exports with the types of
// statements above. mayve one day I could do it because it might look better.

require('dotenv').config();

const xlg = require("./src/xlogger");
const client = require("./src/bot");
process.on('uncaughtException', function (e) {
    xlg.log(e);
    process.exit(1);
});

class Bot {
	public client: any;
	public website: any;
	public config: any;

    constructor(client, website?, config?) {
        this.client = client;
        this.website = website;
        if (config) {
            this.config = config;
        }
    }
}

module.exports = new Bot(client);
