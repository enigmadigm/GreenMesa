/*

This code was greatly expanded from a nodejs example for a receiver that authenticates Twitch's signature:
https://github.com/BarryCarlyon/twitch_misc/blob/master/webhooks/handlers/nodejs/receive.js

*/

const fs = require('fs');
const path = require('path');

// Load configuation
const config = JSON.parse(fs.readFileSync(path.join(
    __dirname,
    '../../auth.json'
))).TWITCH;

// Require depedancies
// express is used for handling incoming HTTP requests "like a webserver"
const router = require('express').Router();
// bodyparser is for reading incoming data
const bodyParser = require('body-parser');
// cypto handles Crpytographic functions, sorta like passwords (for a bad example)
const crypto = require('crypto');
// node-fetch
const fetch = require('node-fetch');
// moment.js
const moment = require('moment');
// url and querystring for parsing url queries
const url = require('url');
const querystring = require('querystring');

let currToken;
let tokenExpiresIn = 0;
setInterval(() => {
    tokenExpiresIn--;
}, 1000);

//const { StaticAuthProvider } = require('twitch-auth');

//const http = require('http').Server(app);
/*app.listen(config.port, function() {
    console.log('Server raised on', config.port);
});*/

// Middleware!
// Express allows whats called middle ware
// it runs before (or after) other parts of the route runs
router.use(bodyParser.json({
    verify: function(req, res, buf/*, encoding*/) {
        // is there a hub to verify against
        req.twitch_hub = false;
        if (req.headers && req.headers['x-hub-signature']) {
            req.twitch_hub = true;

            var xHub = req.headers['x-hub-signature'].split('=');
            // what the hell does this do
            req.twitch_hex = crypto.createHmac(xHub[0], config.hub_secret)
                .update(buf)
                .digest('hex');
            req.twitch_signature = xHub[1];
        }
    }
}));

router.get("/hooks", async (req, res) => {
    if (req.query.pass !== "cantbreakin") return;
    await getOAuth();
    fetch("https://api.twitch.tv/helix/webhooks/subscriptions", {
        method: "GET",
        headers: {
            "Client-ID": `${config.client_id}`,
            "Authorization": `Bearer ${currToken}`
        }
    }).then(res => res.json()).then(body => res.json(body))
})

router.get("/unsubscribe", async (req, res) => {
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
})

// Routes
router
    .route('/')
    .get((req, res) => {
        console.log('Incoming Get request on /');
        // Twitch will send a verfiy to your handler
        // in order to verify that it can be access
        // we'll test if the call is from Twitch
        // the key contats a period so we are using array style access here
        if (req.query['hub.challenge']) {
            console.log('Got a challenge', req.query['hub.challenge']);
            // it's a challenge from Twitch
            // lets acknowledge it
            res.send(encodeURIComponent(req.query['hub.challenge']));
        } else {
            console.log('May be a browser request, no challenge');
            // normally won't get called
            // but we need to return something
            // someone direct called the URL for whatever reason
            // so we'll just OK and be done with it
            res.send('Ok');
        }
    })
    .post((req, res) => {
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
                if (req.query.streamer && req.query.streamer.length) {
                    console.log(req.query.streamer);
                } else {
                    console.log('Received a Twitch payload with no id query param');
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

async function addTwitchWebhook(username, isID = false) {
    //if (!token) token = (await getOAuth()).access_token;
    //if (!token) return false;
    await getOAuth();
    let uid = username;
    if (!isID) {
        uid = await idLookup(username);
    }
    const res = await fetch("https://api.twitch.tv/helix/webhooks/hub", {
        method: 'POST',
        body: JSON.stringify({
            "hub.callback": `${config.callback_domain}/?streamer=${uid.data[0].id}`,
            "hub.mode": "subscribe",
            "hub.topic": `https://api.twitch.tv/helix/streams?user_id=${uid.data[0].id}`,
            "hub.lease_seconds": 864000,
            "hub.secret": config.hub_secret
        }),
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${currToken}`,
            "Client-ID": `${config.client_id}`
        }
    });
    //const json = res.json()
    return res;
}

async function unregisterTwitchWebhook(username) {
    await getOAuth();
	const uid = await idLookup(username);
    const res = await fetch("https://api.twitch.tv/helix/webhooks/hub", {
        method: 'POST',
        body: JSON.stringify({
            "hub.callback": `http://atlasatmos.net:8000/?streamer=${uid.data[0].id}`,
            "hub.mode": "unsubscribe",
            "hub.topic": `https://api.twitch.tv/helix/streams?user_id=${uid.data[0].id}`,
            "hub.secret": config.hub_secret
        }),
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${currToken}`,
            "Client-ID": "3wwssw7s79xqt53x01i7rgnpz1jfgh"
        }
    });
    //const json = res.json()
    return res;
}

async function getOAuth() {
    if (tokenExpiresIn > 60) return;
	const tokres = await fetch(`https://id.twitch.tv/oauth2/token?client_id=${config.client_id}&client_secret=${config.client_secret}&grant_type=client_credentials&scope=user:read:email`, { method: "POST" });
    const tokjson = tokres.json();
    if (!tokjson || !tokjson.access_token) return false;
    currToken = tokjson.access_token;
	//return tokjson;
    
    console.log(currToken)
}

async function idLookup(username) {
    await getOAuth();
	const response = await fetch(`https://api.twitch.tv/helix/users?login=${username}`, {
		method: 'GET',
		headers: {
			"Client-ID": `${config.client_id}`,
            "Authorization": `Bearer ${currToken}`
		}
	})
	const json = response.json();
	return json;
}

setInterval(async () => {
    await getOAuth();
    const response = await fetch("https://api.twitch.tv/helix/webhooks/subscriptions", {
        method: "GET",
        headers: {
            "Client-ID": `${config.client_id}`,
            "Authorization": `Bearer ${currToken}`
        }
    }).catch(console.error);
    const json = response.json();
    // checking to see if any webhooks are registered
    if (json.total > 0) {
        const hooks = json.data;
        // iterating through to renew ones that need it
        for (let i = 0; i < hooks.length; i++) {
            const hook = hooks[i];
            if (moment(hook.expires_at).diff(moment()) <= 86400000) {
                // parsing query strings from the callback url
                const parsedUrl = url.parse(hook.callback);
                const parsedQs = querystring.parse(parsedUrl.query);
                if (parsedQs.streamer) {
                    addTwitchWebhook(parsedQs.streamer, true);
                }
            }
        }
    }
}, 60000)

/*exports.addTwitchWebhook = addTwitchWebhook;
exports.unregisterTwitchWebhook = unregisterTwitchWebhook;
exports.twitchIDLookup = idLookup;*/
module.exports = router;

/*(async () => {
	try {
		startTwitchListening();
		const oares = await getOAuth();
		console.log((await addTwitchWebhook("EnigmaDigm", oares.access_token)))
	} catch(err) {
		console.error(err)
	}
})();*/

