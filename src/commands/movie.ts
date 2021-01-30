import xlg from "../xlogger";
import fetch from "node-fetch";
//import { getGlobalSetting } from "../dbmanager";
import getColors from 'get-image-colors';
import { Command } from "src/gm";

const command: Command = {
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
        try {
            if (args.length > 0 && args.length < 11 && args.join("+").length < 200) {
                const sterms = args.join("+").toLowerCase();
                const letters = /^[A-Za-z0-9\s-+'"!@#$%^&*()=:;]+$/; // regular expression testing whether everything matched against contains only upper/lower case letters
                if (letters.test(sterms)) {
                    fetch(`http://www.omdbapi.com/?t=${sterms}&apikey=4f5eed5a`)
                        .then(res => res.json())
                        .then(async j => {

                            if (j.Response == "False" || !j.Title || !j.Year || !j.Plot || !j.imdbID) {
                                message.channel.send({
                                    embed: {
                                        "title": "Error!",
                                        "description": `${j.Error}`,
                                        "color": await client.database?.getColor("fail_embed_color"),
                                        "footer": {
                                            "text": "Movies"
                                        }
                                    }
                                }).catch(console.error);
                            } else {
                                const fields = [];
                                if (j.Rated) {
                                    fields.push({
                                        name: "<:mpaa_sm:757460418573762580> Rated",
                                        value: `${j.Rated}`,
                                        inline: true
                                    });
                                }
                                if (j.BoxOffice) {
                                    fields.push({
                                        name: "🎟️ Box Office",
                                        value: `${j.BoxOffice}`,
                                        inline: true
                                    });
                                }
                                if (j.imdbRating) {
                                    fields.push({
                                        name: "IMDb",
                                        value: `<:imdb_sm:757460717740884098> ${j.imdbRating}/10${j.imdbVotes ? `\n👥 ${j.imdbVotes}` : ''}`,
                                        inline: true
                                    });
                                }
                                if (j.Actors) {
                                    fields.push({
                                        name: "👨‍💼 Cast",
                                        value: j.Actors,
                                        inline: true
                                    });
                                }
                                if (j.Awards) {
                                    fields.push({
                                        name: "🌐 Awards",
                                        value: j.Awards,
                                        inline: true
                                    });
                                }
                                if (j.Genre) {
                                    fields.push({
                                        name: "📕 Genre",
                                        value: `${j.Genre}`,
                                        inline: true
                                    });
                                }
                                if (j.Director) {
                                    fields.push({
                                        name: "🎥 Director",
                                        value: `${j.Director}`,
                                        inline: true
                                    });
                                }
                                if (j.Released) {
                                    fields.push({
                                        name: "📅 Release Date",
                                        value: `${j.Released}`,
                                        inline: true
                                    });
                                }
                                if (j.Runtime) {
                                    fields.push({
                                        name: "🕦 Runtime",
                                        value: `${j.Runtime}`,
                                        inline: true
                                    });
                                }
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                const embed: any = {
                                    title: `🍿 ${j.Title} (${j.Year})`,
                                    description: `${j.Plot}`,
                                    fields,
                                    footer: {
                                        text: `${j.imdbID}${j.Production ? ` | Studio: ${j.Production}` : ''}`
                                    },
                                }
                                if (j.Poster && j.Poster.toLowerCase() !== "n/a") {
                                    const cres = await getColors(j.Poster);
                                    const pcol = cres[0] ? cres[0].num() : await client.database?.getColor("info_embed_color");
                                    embed.image = {
                                        url: j.Poster
                                    }
                                    embed.color = pcol;
                                } else {
                                    embed.color = await client.database?.getColor("info_embed_color");
                                }

                                message.channel.send({ embed }).catch(xlg.error);
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
        } catch (error) {
            xlg.error(error);
            await client.specials?.sendError(message.channel);
            return false;
        }
    }
}

export default command;