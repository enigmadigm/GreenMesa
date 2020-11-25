require('./strategies/discord');

const express = require("express");
const passport = require('passport');
const PORT = process.env.WEBSITE_PORT || 3002;
const routes = require('./routes');
const fs = require("fs");
const path = require("path");
const { getTwitchSubsForID } = require("../dbmanager");
//const { configTwitchClient } =require("./routes/twitch")

class MesaWebsite {
    constructor(client) {
        //configTwitchClient(client)
        this.client = client;
        this.app = express();
        
        this.app.get("/", (req, res) => {
            res.sendFile(path.join(__dirname,"./static/index.html"));
        });
        this.app.use(express.static(process.env.DASHBOARD_STATIC_LOC))
        this.app.use(passport.initialize());
        this.app.use(passport.session());
        this.app.use('/api', routes);
        this.app.listen(PORT, () => console.log(`Running on port ${PORT}`));
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
                                    const guild = client.guilds.cache.get(sub.guildid);
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
                    fs.appendFileSync(path.join(
                        __dirname,
                        'webhooks.log'
                    ), JSON.stringify(req.body) + "\n");
                    // pretty print the last webhook to a file
                    fs.appendFileSync(path.join(
                        __dirname,
                        'last_webhooks.log'
                    ), JSON.stringify(req.body, null, 4));
                } else {
                    console.log('The Signature did not match');
                    // the signature was invalid
                    res.send('Ok');
                    // we'll ok for now but there are other options
                }
            } else {
                console.log('It didn\'t seem to be a Twitch Hook');
                // again, not normally called
                // but dump out a OK
                res.send('Ok');
            }
        });
    }

}

module.exports = MesaWebsite;
