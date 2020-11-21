require('./strategies/discord');

const express = require("express");
const passport = require('passport');
const PORT = process.env.WEBSITE_PORT || 3002;
const routes = require('./routes');
const app = express();

app.use('/api', routes);

app.use(passport.initialize());
app.use(passport.session());

app.listen(PORT, () => console.log(`Running on port ${PORT}`));