import express from 'express';
import passport from 'passport';
const router = express.Router();

router.get('/discord', passport.authenticate( 'discord' ));

router.get('/discord/redirect', passport.authenticate( 'discord' ), (req, res) => {
    //res.send('200')
    if (process.env.NODE_ENV === "production") {
        res.redirect('/menu');
    } else {
        res.redirect('http://localhost:3000/menu');//TODO: CHANGE THIS
    }
});

router.get("/", (req, res) => {
    if (req.user) {
        res.send(req.user);
        //res.redirect("../app.js")
    } else {
        //res.status(401).send({ msg: "Unauthorized: Not Logged In" });
        res.sendStatus(401);
    }
})

export default router;