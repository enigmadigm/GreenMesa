# GreenMesa
This is the repository for a Discord bot known as GreenMesa (GM). This page acts acts as a convenient way for @GalaxySH to store core files and other stuff for the bot. 

The application ***cannot*** merely be cloned and run immediately after installation, it will fail; this app was not built for and has not been fixed to be able to do that smoothly. There are no installers.

Discord Server:<br/>[![AvXvvSg](https://img.shields.io/discord/745670883074637904)](https://discord.gg/AvXvvSg)

---

This bot isn't really built to run on someone else's machine (namedly you who is reading this), but mostly I'm just not going to encourage you to because, well, it's *mine*.

## Ignored files
There are *quite a few* ignored files (found in [.gitignore](.gitignore)) that are essential (more or less) to the bot's function. Especially auth.json, which contains the keys to the engine. `auth.json` is a nono file, and it will stay that way. .

## auth.json (config)
`auth.json` basic template in case there is need of a rebuild. May be out of date.
```json
{
  "prefix": "(*&%#^@$!(@*&$",
  "ownerID": "discord snowflake id here, app must be owned",
  "db_config": {
      "host": "",
      "user": "",
      "password": "w1eRd0_daTAba53_p@sW0Rd",
      "database": "",
      "port": "6969"
   }
}
```
Some required sections of the config file will be generated if not provided (the logging parts), all parts with keys are required.


End.
