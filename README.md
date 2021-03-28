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
  </a>
</p>

<hr>

[@GalaxySH](https://hauge.rocks) uses this repo as a convenient deployment platform.

This application cannot be cloned and run, it will fail; this app was not built to be freely run. There are no installers.

This bot is not tested to run on someone else's machine (namedly you who is reading this). Additionally, you should not run this code on your machine because the Stratum Discord bot already exists.

## Ignored files
There are *a few* ignored files (found in [.gitignore](.gitignore)) that are essential (more or less) to the bot's function, especially `auth.json`. `auth.json` contains the keys to the engine. It is a nono file for viewing, and it will stay that way. Below I provide a template so it can be at least partially reconstructed if needed. The bot should throw errors for all missing parameters that are requested.

## auth.json (config)
`auth.json` basic template in case there is need of a rebuild. May be out of date. Does not include all necessary auth properties.
```json
{
  "prefix": "[(*&%#^@$!(@*&$]",
  "ownerID": "[owner snowflake of discord app]",
  "db_config": {
      "host": "localhost",
      "user": "[user]",
      "password": "[w1eRd0_daTAba53_p@sW0Rd]",
      "database": "[stratum_database]",
      "port": "3306"
   }
}
```
Some sections of the config file will be generated if not provided (the logging parts), all parts with keys are required. There are some parts that update periodically or when commands are run, these sections are slowly moving towards being integrated in the db.

## Docker

Don't try to use the Docker files. They do not do anything.


End.
