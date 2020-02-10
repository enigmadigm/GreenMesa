# GreenMesa
This is the repository for a Discord bot known as GreenMesa (GM). The bot was created by, and is still maintained and updated by, Stefan Hauge. GM falls under ownership of EnigmaDigm Holdings, EnDigm Developer branch. More details about the bot can be found in the docs folder, along with all other documentation for GM (minus a few things).

If you are interested in becoming a part of the team and/or helping to develop and expand GM or EnigmaDigm as a whole, go ahead and request to become a contributor or go to [our involvement page that will soon be available](https://digmsl.link/involve1).

Details about apps on EnigmaDigm can soon be found [here](https://enigmadigm.com/apps/). We look forward to seeing you around and hopefully hearing from you.

This bot isn't really built to run on someone else's machine (namedly you who is reading this), but mostly I'm just not going to encourage you to because, well, it's *mine*.

## Ignored files
There are **quite a few** ignored files (found in [.gitignore](.gitignore)) that are essential (more or less) to the bot's function. Especially auth.json, which houses the keys to the engine. For now auth.json is gonna remain a nono file, it may be released with redacted info at some point in the future. If needed (wouldn't know why unless you try to copy the bot for yourself) you could rebuild it for yourself using the bot's code. You **need to find yourself your own bot token** however.

## auth.json
So above I said "ur out of luck" but then I decided, what if even I mess up and forget how to rebuild my auth.json?... or something like that...maybe I took pity. Anyway, if you were able to make sense of that, here's a bit of a template auth.json. I do not gaurantee and will not be held responsible for this being out of date.
```json
{
  "token": "--------your---private---discord---app---token---------",
  "prefix": "(*&%#^@$!(@*&$",
  "ownerID": "your discord snowflake here, you must own the app",
  "ws": {
    "port": number,
    "token": "123456"
  },
  "longLife": 1,
  "wordsDefinedCount": 1,
  "wordsDefined": [
      "this",
      "isnt",
      "required",
      "it",
      "will",
      "be",
      "auto",
      "created",
      "for",
      "you"
  ],
  "plotly": {
    "username": "AccountIJustCreated",
    "key": "SUPERSPECIALKEYTHEYGAVEME"
  },
  "db_config": {
      "host": "location of database (ip), hope you have it set up right",
      "user": "database_user",
      "password": "w1eRd0_daTAba53_p@sW0Rd",
      "database": "database_nam",
      "port": "6969"
   }
}
```
Not that some required fields will be generated for you when the bot is first started or when a command is first run, but feel free to copy them anyway I guess.


Good luck out there pioneers.
-*Stefan*
