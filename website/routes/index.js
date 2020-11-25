const router = require('express').Router();
const auth = require('./auth')
const discord = require('./discord')
const { twitchRouter } = require('./twitch')

router.use('/auth', auth);
router.use('/discord', discord);
router.use('/twitch', twitchRouter);

module.exports = router;