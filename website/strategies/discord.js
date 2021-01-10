const passport = require('passport');
const DiscordStrategy = require('passport-discord');
const { updateDashUser, getDashUser } = require('../../dbmanager');
//const { conn } = require("../../dbmanager");

passport.serializeUser((user, done) => {// "these take care of getting the session id ... checking the session id and verifying and getting the user that belongs to it and serializing it to the request"
    done(null, user);
});

passport.deserializeUser(async (obj, done) => {// this needs to search the database for the actual user
    try {
        //console.log(obj);
        const user = await getDashUser(obj.id);
        return user ? done(null, user) : done(null, null);
    } catch (error) {
        console.error(error);
        done(error, null);
    }
    //done(null, obj);
});

passport.use(new DiscordStrategy({
        clientID: process.env.DASHBOARD_CLIENT_ID,
        clientSecret: process.env.DASHBOARD_CLIENT_SECRET,
        callbackURL: process.env.DASHBOARD_CALLBACK_URL,
        scope: ['identify', 'guilds']
}, async (accessToken, refreshToken, profile, done) => {
        //process.nextTick(() => done(null, profile));
        const { id, username, discriminator, avatar, guilds } = profile;
        try {
            //console.log(`Access: ${accessToken} Refresh: ${refreshToken}`)
            const updateUser = await updateDashUser(id, username, discriminator, avatar, guilds);
            if (updateUser && updateUser.affectedRows) {
                const newUser = await getDashUser(id);
                if (newUser && newUser.id) {
                    //console.log("user was processed")
                    //console.log("user found")
                    /*const nuObject = {
                        id: newUser.userid,
                        username: newUser.tag
                    }*/
                    return done(null, newUser);
                } else {
                    return done(null, null);
                    //console.log("user not found")
                }
            } else {
                //console.log("user not processed")
            }
        } catch (error) {
            console.error(error);
            return done(error, null);
        }
}));
