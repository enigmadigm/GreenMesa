import express from 'express';
import passport from 'passport';
const router = express.Router();
const host = process.env.NODE_ENV === "production" ? "" : "http://localhost:3000";

router.get('/discord', passport.authenticate( 'discord' ));

router.get('/discord/redirect', (req, res, next) => {
    return passport.authenticate('discord', (err, user) => {
        if (err) {
            let msg = "";
            if (err.message === `Invalid "code" in request.`) {
                msg = "token";
            }
            const refer = req.get("referrer");
            return res.redirect(`${host}/error?err=${msg}&redirect=${encodeURIComponent(refer || `${host}/dash`)}`);
        }
        if (!user) {
            return res.redirect('/');
        }

        req.logIn(user, function (err) {
            if (err) {
                return next(err);
            }
            next();
        });
    })(req, res, next);
}, (req, res) => {
    if (process.env.NODE_ENV === "production") {
        res.redirect('/menu');
    } else {
        res.redirect('http://localhost:3000/menu');//FIXME: here (can't remember why this needs to be changed)
    }
});

router.get("/", (req, res) => {
    if (req.user) {
        res.send(req.user);
    } else {
        //res.status(401).send({ msg: "Unauthorized: Not Logged In" });
        res.sendStatus(401);
    }
})

export default router;