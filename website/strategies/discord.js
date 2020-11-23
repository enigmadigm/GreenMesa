const passport = require('passport');
const DiscordStrategy = require('passport-discord');

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((obj, done) => {
    done(null, obj);
});

passport.use(new DiscordStrategy({
        clientID: process.env.DASHBOARD_CLIENT_ID,
        clientSecret: process.env.DASHBOARD_CLIENT_SECRET,
        callbackURL: process.env.DASHBOARD_CALLBACK_URL,
        scope: ['identify', 'guilds']
}, async (accessToken, refreshToken, profile, done) => {
        process.nextTick(() => done(null, profile));
        console.log("hello world")
}));
