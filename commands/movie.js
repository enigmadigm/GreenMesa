const xlg = require("../xlogger");
const fetch = require("node-fetch");
const { getGlobalSetting } = require("../dbmanager");
const getColors = require('get-image-colors');

module.exports = {
    name: 'movie',
    description: {
        short: 'get metadata about a movie',
        long: 'Search for a movie, film, or series. This returns a bunch of neat information on what is found. If you don\'t get the result you want with your search terms, sorry; either try again or resort to your browser.'
    },
    args: true,
    usage: "<movie name>",
    aliases: ['movies', 'imdb', 'films'],
    category: 'fun',
    async execute(client, message, args) {
        if (args.length > 0 && args.length < 11 && args.join("+").length < 200) {
            let sterms = args.join("+").toLowerCase();
            let letters = /^[A-Za-z0-9\s-+'"!@#$%^&*()=:;]+$/; // regular expression testing whether everything matched against contains only upper/lower case letters
            if (letters.test(sterms)) {
                fetch(`http://www.omdbapi.com/?t=${sterms}&apikey=4f5eed5a`)
                    .then(res => res.json())
                    .then(async j => {

                        if (j.Response == "False" || !j.Title || !j.Year || !j.Plot || !j.imdbID) {
                            message.channel.send({
                                embed: {
                                    "title": "Error!",
                                    "description": `${j.Error}`,
                                    "color": parseInt((await getGlobalSetting("fail_embed_color") || ['16711680'])[0].value, 10),
                                    "footer": {
                                        "text": "Movies"
                                    }
                                }
                            }).catch(console.error);
                        } else {
                            var embed = {
                                title: `🍿 ${j.Title} (${j.Year})`,
                                description: `${j.Plot}`,
                                fields: [],
                                footer: {
                                    text: `${j.imdbID}${j.Production ? ` | Studio: ${j.Production}` : ''}`
                                }
                            }
                            if (j.Rated) {
                                embed.fields.push({
                                    name: "<:mpaa_sm:757460418573762580> Rated",
                                    value: `${j.Rated}`,
                                    inline: true
                                });
                            }
                            if (j.BoxOffice) {
                                embed.fields.push({
                                    name: "🎟️ Box Office",
                                    value: `${j.BoxOffice}`,
                                    inline: true
                                });
                            }
                            if (j.imdbRating) {
                                embed.fields.push({
                                    name: "IMDb",
                                    value: `<:imdb_sm:757460717740884098> ${j.imdbRating}/10${j.imdbVotes ? `\n👥 ${j.imdbVotes}` : ''}`,
                                    inline: true
                                });
                            }
                            if (j.Actors) {
                                embed.fields.push({
                                    name: "👨‍💼 Cast",
                                    value: j.Actors,
                                    inline: true
                                });
                            }
                            if (j.Awards) {
                                embed.fields.push({
                                    name: "🌐 Awards",
                                    value: j.Awards,
                                    inline: true
                                });
                            }
                            if (j.Genre) {
                                embed.fields.push({
                                    name: "📕 Genre",
                                    value: `${j.Genre}`,
                                    inline: true
                                });
                            }
                            if (j.Director) {
                                embed.fields.push({
                                    name: "🎥 Director",
                                    value: `${j.Director}`,
                                    inline: true
                                });
                            }
                            if (j.Released) {
                                embed.fields.push({
                                    name: "📅 Release Date",
                                    value: `${j.Released}`,
                                    inline: true
                                });
                            }
                            if (j.Runtime) {
                                embed.fields.push({
                                    name: "🕦 Runtime",
                                    value: `${j.Runtime}`,
                                    inline: true
                                });
                            }
                            if (j.Poster && j.Poster.toLowerCase() !== "n/a") {
                                let cres = await getColors(j.Poster);
                                let pcol = cres[0] ? cres[0].num() : parseInt((await getGlobalSetting("info_embed_color") || ['7322774'])[0].value, 10);
                                embed.image = {
                                    url: j.Poster
                                }
                                embed.color = pcol;
                            } else {
                                embed.color = parseInt((await getGlobalSetting("info_embed_color") || ['7322774'])[0].value, 10);
                            }

                            message.channel.send({ embed: embed }).catch(xlg.error);
                        }

                    }).catch(xlg.error);
            } else {
                message.channel.send({
                    embed: {
                        "title": "Please send a valid movie to look up",
                        "description": "Whatever you entered wasn't found to be valid",
                        "color": 16711680,
                        "footer": {
                            "text": "Movies"
                        }
                    }
                }).catch(console.error);
            }
        } else {
            message.channel.send({
                embed: {
                    "description": "Please limit arguments to **ten** or less words",
                    "color": 16711680,
                    "footer": {
                        "text": "Movies"
                    }
                }
            }).catch(console.error);
        }
    }
}