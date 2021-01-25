import passport from 'passport';
import DiscordStrategy from 'passport-discord';
import { Bot } from 'src/bot';
import { PartialGuildObject } from 'src/gm';

passport.serializeUser((user, done) => {// "these take care of getting the session id ... checking the session id and verifying and getting the user that belongs to it and serializing it to the request"
    done(null, user);
});

// Below I gave up on trying ot type check, I'm just done with it
// eslint-disable-next-line @typescript-eslint/no-explicit-any
passport.deserializeUser<any>(async (obj, done) => {// this needs to search the database for the actual user
    try {
        //console.log(obj);
        const user = await Bot.client.database?.getDashUser(obj.id);
        return user ? done(null, user) : done(null, undefined);
    } catch (error) {
        console.error(error);
        done(error, undefined);
    }
    //done(null, obj);
});

passport.use(new DiscordStrategy({
        clientID: process.env.DASHBOARD_CLIENT_ID || "",
        clientSecret: process.env.DASHBOARD_CLIENT_SECRET || "",
        callbackURL: process.env.DASHBOARD_CALLBACK_URL,
        scope: ['identify', 'guilds']
// eslint-disable-next-line @typescript-eslint/ban-types
}, async (accessToken: string, refreshToken: string, profile: DiscordStrategy.Profile, done: (err?: Error | null, user?: Express.User, info?: object) => void) => {
        //process.nextTick(() => done(null, profile));
        const { id, username, discriminator, avatar, guilds } = profile;
        try {
            //console.log(`Access: ${accessToken} Refresh: ${refreshToken}`)
            const updateUser = await Bot.client.database?.updateDashUser(id, username, discriminator, avatar, <PartialGuildObject[]>guilds);
            if (updateUser && updateUser.affectedRows) {
                const newUser = await Bot.client.database?.getDashUser(id);
                if (newUser && newUser.id) {
                    //console.log("user was processed")
                    //console.log("user found")
                    /*const nuObject = {
                        id: newUser.userid,
                        username: newUser.tag
                    }*/
                    return done(null, newUser);
                } else {
                    //console.log("user not found")
                    return done(null, undefined);
                }
            } else {
                //console.log("user not processed")
            }
        } catch (error) {
            console.error(error);
            return done(error, undefined);
        }
}));
