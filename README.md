<h1 align="center">GreenMesa</h1>

<p align="center">
  <img src="media/greenmesa_logo.png" alt="greenmesa-logo" width="120px" height="120px" style="border-radius:5px"/>
  <br>
  <i>The core of the bot Stratum
    <br>written in Typescript and other languages.</i>
  <br>
</p>

<p align="center">
  <a href="https://stratum.hauge.rocks"><strong>stratum.hauge.rocks</strong></a>
  <br>
</p>

<p align="center">
  <a href="https://circleci.com/gh/angular/workflows/angular/tree/master">
    <img src="https://img.shields.io/github/package-json/v/enigmadigm/greenmesa" alt="App Version" />
  </a>&nbsp;
  <a href="https://stratum.hauge.rocks/dash">
    <img src="https://img.shields.io/website?label=dashboard&url=https%3A%2F%2Fstratum.hauge.rocks%2Fdash" alt="Dash status" />
  </a>&nbsp;
  <a href="https://discord.gg/AvXvvSg">
    <img src="https://img.shields.io/discord/745670883074637904.svg?logo=discord&logoColor=fff&label=Discord&color=7389d8" alt="Discord conversation" />
  </a>&nbsp;
  <a href="https://www.gnu.org/licenses/gpl-3.0.en.html">
    <img src="https://img.shields.io/github/license/enigmadigm/greenmesa" alt="License" />
  </a>&nbsp;
  <a href="https://www.repostatus.org/#active">
    <img src="https://www.repostatus.org/badges/latest/active.svg" alt="Project Status: Active – The project has reached a stable, usable state and is being actively developed." />
  </a>&nbsp;
  <a href="https://deepscan.io/dashboard#view=project&tid=13451&pid=16444&bid=352890">
    <img src="https://deepscan.io/api/teams/13451/projects/16444/branches/352890/badge/grade.svg" alt="DeepScan grade">
  </a>&nbsp;
  <a href="https://lgtm.com/projects/g/enigmadigm/GreenMesa/context:javascript">
    <img alt="Language grade: JavaScript" src="https://img.shields.io/lgtm/grade/javascript/g/enigmadigm/GreenMesa.svg?logo=lgtm&logoWidth=18"/>
  </a>
</p>

<hr>

[@GalaxySH](https://hauge.rocks) uses this repo as a convenient deployment platform.

This application cannot be cloned and run, it will fail; this app was not built to be freely run. There are no installers.

This bot is not tested to run on someone else's machine (namedly you who is reading this). Additionally, you should not run this code on your machine because the Stratum Discord bot already exists.

## Ignored files
There are *a few* ignored files (found in [.gitignore](.gitignore)) that are essential (more or less) to the bot's function, especially `auth.json`. `auth.json` contains the keys to the engine. It is a nono file for viewing, and it will stay that way. Below I provide a template so it can be at least partially reconstructed if needed. The bot should throw errors for all missing parameters that are requested.

## Config files
The application requires various information to function, mostly consisting of API keys. A large portion of the application that requires configuration can be carved out. However, the database is an integral part of the bot's runtime. The database is linked to the applications action automation and recording systems, it also serves analytical purposes.

### `auth.json` 
The outline below serves as a basic template in case there is need of a rebuild. The abstract may be out of date, and it is not guaranteed to include all necessary authentication properties for the current version of the bot.

```json
{
  "prefix": "[(*&%#^@$!(@*&$]",
  "token": "[discord api token]",
  "ownerID": "[owner snowflake of discord app]",
  "db_config": {
      "host": "localhost",
      "user": "[user]",
      "password": "[w1eRd0_daTAba53_p@sW0Rd]",
      "database": "[stratum_database]",
      "port": "3306"
  },
  "plotly": {
    "username": "[username]",
    "key": "[api key]"
  },
  "IBM": {
    "NLPAPIKEY": "[api key]",
    "NLPINSTANCE": "[instance url]"
  },
  "TWITCH": {
    "port": 99999,
    "hub_secret": "[secret]",
    "client_id": "[id]",
    "client_secret": "[logon secret]",
    "callback_domain": "[authentication return url]"
  },
  "OMDB": {
    "key": "[api key]"
  },
  "KUTT": "[api key]",
  "MWKEY": "[api key]",
  "GELBOORU": {
    "key": "[api key]",
    "user": "[uid]"
  },
  "NASA": {
    "key": "[api key]"
  }
}
```

Some necessary elements in the config will be generated if not manually provided (such as passive data logging). Any elements used for authentication must be entered manually. Some update periodically or when bot master commands are run, these sections are being integrated into the database.

### `.env`
Static data, apart from information keyed to API authentication, can be found in the `.env` file (environment variables through `process.env`). All data used to configure the website is stored in environment variables. 
```dockerfile
# The internal port used to host the webserver
WEBSITE_PORT=3005
# The Id of the bot client that the web client will try to authenticate with
DASHBOARD_CLIENT_ID=[Snowflake]
# The secret to send the user with to the Discord authentication screen, it is returned on authentication
DASHBOARD_CLIENT_SECRET=[secret key]
# URL for redirect after authentication with Discord
DASHBOARD_CALLBACK_URL=/api/auth/discord/redirect
# Where static files should be served from during development
DASHBOARD_STATIC_LOC="[path to static files on the development server]"
# The secret (key) used to sign cookies for MySQL sessions
DASHBOARD_COOKIE_SECRET=[some jumble of characters]
# Where the React app should be served from (different from the API server)
DASHBOARD_HOST=http://localhost:3000
# Set the environment mode (development or production)
NODE_ENV=dev
# The bot permissions to request by default during authentication
PERMS_DEFAULT=2147483639n
```

End.
