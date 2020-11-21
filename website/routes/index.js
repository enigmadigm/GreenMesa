const router = require('express').Router();
const auth = require('./auth')
const discord = require('./discord')
const xtwitch = require('./twitch')

router.use('/auth', auth);
router.use('/discord', discord);
router.use('/twitch', xtwitch);

module.exports = router;