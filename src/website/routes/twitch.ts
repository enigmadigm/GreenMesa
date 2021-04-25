/*

This code was greatly expanded from a nodejs example for a receiver that authenticates Twitch's signature:
https://github.com/BarryCarlyon/twitch_misc/blob/master/webhooks/handlers/nodejs/receive.js

*/

import fs from 'fs';
import path from 'path';

// Load configuation
const config = JSON.parse(fs.readFileSync(path.join( __dirname, '../../../auth.json')).toString()).TWITCH;

// Require depedancies
// express is used for handling incoming HTTP requests "like a webserver"
//const router = require('express').Router();
// bodyparser is for reading incoming data
import bodyParser from 'body-parser';
// cypto handles Crpytographic functions, sorta like passwords (for a bad example)
import crypto from 'crypto';
// node-fetch
import fetch, { Response } from 'node-fetch';
// moment.js
import moment from 'moment';
// url and querystring for parsing url queries
import url from 'url';
import querystring from 'querystring';

// database functions
//import { addTwitchSubscription, getTwitchSubsForID, removeTwitchSubscription } from "../../dbmanager";

import xlg from '../../xlogger';
import { TwitchSearchChannelsReturns, XClient } from 'src/gm';
// discord client
//const Bot = require('../../bot');
//no

import express, { Router } from 'express';
import { IncomingMessage } from 'http';
import { Bot } from '../../bot';
import { Channel, TextChannel } from 'discord.js';

let currToken: string;
let tokenExpiresIn = 0;
setInterval(() => {
    tokenExpiresIn--;
}, 1000);

interface CustomIncoming extends IncomingMessage {
    twitch_hub: boolean;
    twitch_hex: string;
    twitch_signature: string;
}

export function twitchRouter(client: XClient): Router {
    const router = express.Router();

    // Middleware!
    // Express allows whats called middle ware
    // it runs before (or after) other parts of the route runs
    router.use(bodyParser.json({
        verify(req: CustomIncoming, res, buf/*, encoding*/) {
            // is there a hub to verify against
            req.twitch_hub = false;
            if (req.headers && req.headers['x-hub-signature'] && typeof req.headers['x-hub-signature'] === "string") {
                req.twitch_hub = true;

                const xHub = req.headers['x-hub-signature'].split('=');
                // what the hell does this do
                req.twitch_hex = crypto.createHmac(xHub[0], config.hub_secret)
                    .update(buf)
                    .digest('hex');
                req.twitch_signature = xHub[1];
            }
        }
    }));

    router.get("/hooks", async (req, res) => {
        if (req.query.pass !== "cantbreakin") return res.sendStatus(401);
        await getOAuth();
        if (!currToken || !currToken.length) return res.send("bad token");
        fetch("https://api.twitch.tv/helix/webhooks/subscriptions?first=100", {
            method: "GET",
            headers: {
                "Client-ID": `${config.client_id}`,
                "Authorization": `Bearer ${currToken}`
            }
        }).then(res => res.json()).then(body => res.json(body))
    });

    router.get("/search", async (req, res) => {
        try {
            if (typeof req.query.q !== "string" || !req.query.q) {
                return res.sendStatus(400);
            }
            const first = typeof req.query.l === "string" && parseInt(req.query.l, 10) < 101 ? parseInt(req.query.l, 10) : 10;
            // if (!req.user) {
            //     return res.sendStatus(401);
            // }
            const q = decodeURIComponent(req.query.q);
            await getOAuth();
            if (!currToken || !currToken.length) return res.send("bad token");
            const r = await fetch(`https://api.twitch.tv/helix/search/channels?query=${encodeURIComponent(q)}&first=${first}`, {
                method: "GET",
                headers: {
                    "Client-ID": `${config.client_id}`,
                    "Authorization": `Bearer ${currToken}`
                }
            });
            const j: { data: TwitchSearchChannelsReturns[], pagination: { cursor: string } } = await r.json();
            if (j.data) {
                return res.json(j.data);
            }
            res.json(j);
        } catch (error) {
            res.sendStatus(500);
        }
    });
    
    /*router.get("/unsubscribe", async (req, res) => {
        if (req.query.pass !== "cantbreakin") return;
        const who = req.query.u;
        if (!who) {
            res.send("Username not specified")
            console.log("unsub u not specified");
            return
        }
        await getOAuth();
        await unregisterTwitchWebhook(who);
        res.send(`Unsubscribed from: ${who}`)
    })*/

    // Routes
    router.get('/', (req, res) => {
        console.log('Incoming Get request on /api/twitch');
        // Twitch will send a verfiy to your handler
        // in order to verify that it can be access
        // we'll test if the call is from Twitch
        // the key contats a period so we are using array style access here
        if (req.query['hub.challenge'] && typeof req.query['hub.challenge'] === "string") {
            console.log('Got a challenge', req.query['hub.challenge']);
            // it's a challenge from Twitch
            // lets acknowledge it
            res.send(encodeURIComponent(req.query['hub.challenge']));
        } else {
            console.log('Apparent unauthorized request at API endpoint for Twitch');
            // normally won't get called
            // but we need to return something
            // someone direct called the URL for whatever reason
            res.sendStatus(401);// it is unauthorized, so treating it as such
            //res.send('Ok');// so we'll just OK and be done with it
        }
    });

    // stuff for handling the api endpoint for twitch (post)
    router.post("/", async (req, res) => {
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
                        if (req.body.data && req.body.data.length && req.body.data[0].user_name && req.body.data[0].type === "live" && typeof req.query.streamer === "string") {
                            // twitch sender
                            const subs = await Bot.client.database.getTwitchSubsForID(req.query.streamer);
                            if (subs) {
                                for (let i = 0; i < subs.length; i++) {
                                    const sub = subs[i];
                                    const channels = await client.specials?.getAllChannels(client);
                                    if (channels) {
                                        const channel = channels.find(c => c.id === sub.channelid);
                                        if (channel) {
                                            const name = req.body.data[0].user_name;
                                            const link = `https://twitch.tv/${req.body.data[0].user_name}`;
                                            const msg = sub.message || "";
                                            const message = `${msg.replace(/\{name\}/g, name).replace(/\{link\}/g, link) || `${name} just went live!`}${!/\{link\}/g.exec(msg)?.length ? `\n${link}` : ""}`;
                                            client.shard?.broadcastEval(`
                                            const c = this.channels.cache.get('${sub.channelid}');
                                            if (c && c.send) {
                                                c.send(\`${message}\`)
                                            }
                                            `);
                                            // channel.send(\`${ sub.message || `${req.body.data[0].user_name} just went live!` }\nhttps://twitch.tv/${req.body.data[0].user_name}\`)
                                            //channel.send(`${sub.message || `${req.body.data[0].user_name} just went live!`}\nhttps://twitch.tv/${req.body.data[0].user_name}`)
                                            if (sub.delafter > -1 && sub.delafter <= sub.notified) {
                                                Bot.client.database.removeTwitchSubscription(sub.streamerid, sub.guildid);
                                            } else {
                                                Bot.client.database.incrementTwitchNotified(sub.guildid);
                                            }
                                        }
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
            } else {
                console.log('The Signature did not match');
                // the signature was invalid
                res.sendStatus(401);
                //res.send('Ok');// we'll ok for now but there are other options
            }
        } else {
            console.log('It didn\'t seem to be a Twitch Hook');
            // again, not normally called
            res.sendStatus(401);
            //res.send('Ok');// but dump out a OK
        }
    });

    return router;
}

export async function addTwitchWebhook(username: string, isID = false, guildid?: string, targetChannel?: Channel, message?: string, editing = false, delafter = -1): Promise<boolean | 'ID_NOT_FOUND' | 'ALREADY_EXISTS'> {
    //if (!token) token = (await getOAuth()).access_token;
    //if (!token) return false;
    await getOAuth();
    let uid;
    if (isID) {
        uid = await idLookup(username, true);
    } else {
        uid = await idLookup(username);
    }
    if (!uid || !uid.data || !uid.data[0] || !uid.data[0].id) return "ID_NOT_FOUND";
    let preexists = false;
    if (guildid) {
        const existingSubs = await Bot.client.database.getTwitchSubsForID(uid.data[0].id);
        if (existingSubs && existingSubs.length > 0) {
            for (let i = 0; i < existingSubs.length; i++) {
                const sub = existingSubs[i];
                if (sub.streamerid === uid.data[0].id && guildid === sub.guildid) {
                    preexists = true;
                    if (!editing) {
                        await addTwitchWebhook(uid.data[0].id, true);
                        return "ALREADY_EXISTS";
                    }
                }
            }
        }
    }

    if (!preexists) {
        const res = await fetch("https://api.twitch.tv/helix/webhooks/hub", {
            method: 'POST',
            body: JSON.stringify({
                "hub.callback": `${config.callback_domain}/api/twitch?streamer=${uid.data[0].id}`,
                "hub.mode": "subscribe",
                "hub.topic": `https://api.twitch.tv/helix/streams?user_id=${uid.data[0].id}`,
                "hub.lease_seconds": 864000,// 864000
                "hub.secret": config.hub_secret
            }),
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${currToken}`,
                "Client-ID": `${config.client_id}`
            }
        });
        if (!res) return false;
    }

    if (guildid && targetChannel && targetChannel instanceof TextChannel) {
        const subRes = await Bot.client.database.addTwitchSubscription(uid.data[0].id, guildid, targetChannel.id, 864000 * 1000, message, uid.data[0].display_name || uid.data[0].login, delafter);
        if (!subRes) return false;
        if (uid.data[0].display_name || uid.data[0].login) {
            targetChannel.send(`This is a test message for the set Twitch notification.\nhttps://twitch.tv/${uid.data[0].display_name || uid.data[0].login}`);
        } else {
            targetChannel.send("This is a test message for the set Twitch notification.");
        }
    }

    return true;
}

export async function unregisterTwitchWebhook(username: string): Promise<Response> {
    await getOAuth();
	const uid = await idLookup(username);
    const res = await fetch("https://api.twitch.tv/helix/webhooks/hub", {
        method: 'POST',
        body: JSON.stringify({
            "hub.callback": `${config.callback_domain}/?streamer=${uid.data[0].id}`,
            "hub.mode": "unsubscribe",
            "hub.topic": `https://api.twitch.tv/helix/streams?user_id=${uid.data[0].id}`,
            "hub.secret": config.hub_secret
        }),
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${currToken}`,
            "Client-ID": `${config.client_id}`
        }
    });
    return res;
}

export async function unsubscribeTwitchWebhook(username: string, guildid: string): Promise<boolean | string> {
    await getOAuth();
    const uid = await idLookup(username);
    if (!uid) {
        return "NO_DATA";
    }
    if (uid.status === 400 || !uid.data) {
        return "INVALID";
    }
    if (!uid.data[0] || !uid.data[0].id) {
        return "NO_USER";
    }
    /*if () {
        return false;
    }*/
    const remres = await Bot.client.database.removeTwitchSubscription(uid.data[0].id, guildid)
    if ((remres || remres === 0) && remres < 1) {
        return "NO_SUBSCRIPTION";
    }
    return true;
}

async function getOAuth() {
    try {
        if (tokenExpiresIn > 60) return;
        const result = await fetch(`https://id.twitch.tv/oauth2/token?client_id=${config.client_id}&client_secret=${config.client_secret}&grant_type=client_credentials&scope=user:read:email`, { method: "POST" })
        const j = await result.json()
        if (!j || !j.access_token) {
            console.log("couldn't retrieve access token");
            return false;
        }
        currToken = j.access_token;
    } catch (error) {
        console.error(error)
    }
}

async function idLookup(username: string, isid = false) {
    await getOAuth();
    let lquery = "login";
    if (isid) {
        lquery = "id";
    }
	const response = await fetch(`https://api.twitch.tv/helix/users?${lquery}=${username}`, {
		method: 'GET',
		headers: {
			"Client-ID": `${config.client_id}`,
            "Authorization": `Bearer ${currToken}`
		}
	})
    const json = await response.json();
	return json;
}

/*async function startHookExpirationManagement() {
    return null;
}*/
setInterval(async () => {
    try {
        await getOAuth();
        const response = await fetch("https://api.twitch.tv/helix/webhooks/subscriptions?first=100", {
            method: "GET",
            headers: {
                "Client-ID": `${config.client_id}`,
                "Authorization": `Bearer ${currToken}`
            }
        });
        const json = await response.json();
        // checking to see if any webhooks are registered
        if (json.total > 0) {
            const hooks = json.data;
            // iterating through to renew ones that need it
            for (let i = 0; i < hooks.length; i++) {
                const hook = hooks[i];
                //console.log(`time: ${moment(hook.expires_at).diff(moment()) <= 86400000} ${moment(hook.expires_at).diff(moment()) - 86400000}`)
                const dff = moment(hook.expires_at).diff(moment());
                //console.log(`${dff} < 86400000`)
                if (dff <= 86400000) {
                    // parsing query strings from the callback url
                    const parsedUrl = url.parse(hook.callback);
                    const parsedQs = querystring.parse(parsedUrl.query || "");
                    if (parsedQs.streamer && typeof parsedQs.streamer === "string") {
                        await addTwitchWebhook(parsedQs.streamer, true);
                    }
                }
            }
        }
    } catch (error) {
        xlg.error(error);
    }
}, 60000)

/*exports.addTwitchWebhook = addTwitchWebhook;
exports.unregisterTwitchWebhook = unregisterTwitchWebhook;
exports.twitchIDLookup = idLookup;*/
//startHookExpirationManagement();
//exports.twitchRouter = router;
//exports.addTwitchWebhook = addTwitchWebhook;
//exports.unregisterTwitchWebhook = unregisterTwitchWebhook;
//exports.unsubscribeTwitchWebhook = unsubscribeTwitchWebhook;
//exports.configTwitchClient = configTwitchClient;

/*(async () => {
	try {
		startTwitchListening();
		const oares = await getOAuth();
		console.log((await addTwitchWebhook("EnigmaDigm", oares.access_token)))
	} catch(err) {
		console.error(err)
	}
})();*/

