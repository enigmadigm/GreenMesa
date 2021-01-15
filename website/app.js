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
const { conn, getTwitchSubsForID } = require("../dbmanager");
const STATIC = "./static";

class MesaWebsite {
    constructor(client) {
        //configTwitchClient(client)
        this.client = client;
        this.app = express();
        
        this.app.listen(PORT, () => console.log(`Running on port ${PORT}`));
        this.app.use('/api', routes);
        this.app.get("/", (req, res) => {
            res.sendFile(path.join(__dirname, STATIC, "index.html"));
        });
        this.app.use(session({
            secret: process.env.DASHBOARD_COOKIE_SECRET || "potato",
            cookie: {
                maxAge: 60000 * 60 * 24
            },
            resave: false,
            saveUninitialized: false,
            store: new MySQLStore({}, conn)
        }));
        this.app.use(express.static(path.join(__dirname, STATIC), {
            index: false,
            extensions: ['html']
        })); // https://stackoverflow.com/a/40201169/10660033
        this.app.use(passport.initialize());
        this.app.use(passport.session());
        this.app.set('etag', false);
        
        // stuff for handling the api endpoint for twitch
        // it is here because it needs access to the bot client
        this.app.post("/api/twitch", async (req, res) => {
            console.log('Incoming Post request on /api/twitch');
            // the middleware above ran
            // and it prepared the tests for us
            // so check if we event generated a twitch_hub
            if (req.twitch_hub) {
                if (req.twitch_hex == req.twitch_signature) {
                    console.log('The signature matched');
                    // the signature passed so it should be a valid payload from Twitch
                    // we ok as quickly as possible
                    res.send('Ok');

                    // you can do whatever you want with the data
                    // it's in req.body
                    try {
                        if (req.query.streamer && req.query.streamer.length) {
                            if (req.body.data && req.body.data.length && req.body.data[0].user_name && req.body.data[0].type === "live") {
                                // twitch sender
                                const subs = await getTwitchSubsForID(req.query.streamer);
                                for (let i = 0; i < subs.length; i++) {
                                    const sub = subs[i];
                                    const guild = await this.client.guilds.fetch(sub.guildid);
                                    if (guild) {
                                        const channel = guild.channels.cache.get(sub.channelid);
                                        if (channel) {
                                            channel.send(`${sub.message || `${req.body.data[0].user_name} just went live!`}\nhttps://twitch.tv/${req.body.data[0].user_name}`)
                                        }
                                    }
                                }
                            }
                        } else {
                            console.log('Received a Twitch payload with no id query param');
                        }
                    } catch (error) {
                        console.error(error)
                    }

                    // write out the data to a log for now
                    /*fs.appendFileSync(path.join(
                        __dirname,
                        'webhooks.log'
                    ), JSON.stringify(req.body) + "\n");*/
                    // pretty print the last webhook to a file
                    /*fs.appendFileSync(path.join(
                        __dirname,
                        'last_webhooks.log'
                    ), JSON.stringify(req.body, null, 4));*/
                } else {
                    console.log('The Signature did not match');
                    // the signature was invalid
                    res.sendStatus(403);
                    //res.send('Ok');// we'll ok for now but there are other options
                }
            } else {
                console.log('It didn\'t seem to be a Twitch Hook');
                // again, not normally called
                res.sendStatus(403);
                //res.send('Ok');// but dump out a OK
            }
        });

        // Since this is the last non-error-handling
        // middleware use()d, we assume 404, as nothing else
        // responded.

        // $ curl http://localhost:3000/notfound
        // $ curl http://localhost:3000/notfound -H "Accept: application/json"
        // $ curl http://localhost:3000/notfound -H "Accept: text/plain"

        this.app.use(function (req, res) {
            res.status(404);

            // respond with html page
            /*if (req.accepts('html')) {// an engine is required here
                res.render('404', {
                    url: req.url
                });
                return;
            }*/

            // respond with json
            if (req.accepts('json')) {
                res.send({
                    error: 'Not found'
                });
                return;
            }

            // default to plain-text. send()
            res.type('txt').send('Not found');
        });

    }

}

module.exports = MesaWebsite;