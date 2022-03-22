import fetch from "node-fetch";
import getColors from 'get-image-colors';
import { Command, MovieAPIResponse } from "src/gm";
import { MessageEmbedOptions } from "discord.js";
import * as config from "../../../auth.json" assert {type: "json"};

export const command: Command = {
    name: 'movie',
    description: {
        short: 'get metadata about a movie',
        long: 'Search for a movie, film, or series. This gets a bunch of neat information on what is found. If you don\'t get the result you want with your search terms, sorry; either try again or resort to your browser.'
    },
    args: true,
    usage: "<movie name>",
    aliases: ['movies', 'imdb', 'films'],
    async execute(client, message, args) {
        if (!args.length.between(0, 11) || args.join("+").length > 200) {
            await message.channel.send({
                embeds: [{
                    description: "Please limit arguments to **ten** or less words",
                    color: 16711680,
                    footer: {
                        text: "Movies",
                    },
                }],
            });
            return;
        }
        const sterms = args.join("+").toLowerCase();
        const letters = /^[A-Za-z0-9\s-+'"!@#$%^&*()=:;]+$/; // regular expression testing whether everything matched against contains only upper/lower case letters
        if (!letters.test(sterms)) {
            await message.channel.send({
                embeds: [{
                    "title": "Please send a valid movie to look up",
                    "description": "Whatever you entered had some unfriendy characters",
                    "color": 16711680,
                    "footer": {
                        "text": "Movies",
                    },
                }],
            });
            return;
        }
        const r = await fetch(`http://www.omdbapi.com/?t=${sterms}&apikey=${config.OMDB.key}&r=json`)
        const j = await r.json() as MovieAPIResponse;

        if (j.Response == "False") {
            await message.channel.send({
                embeds: [{
                    title: "Error!",
                    description: `${j.Error}`,
                    color: await client.database.getColor("fail"),
                    footer: {
                        text: "Movies",
                    },
                }],
            });
            return;
        }
        if (!j.Title || !j.Year || !j.Plot || !j.imdbID) {
            await message.channel.send({
                embeds: [{
                    title: "Error!",
                    description: `Incomplete movie data`,
                    color: await client.database.getColor("fail"),
                    footer: {
                        text: "Movies",
                    },
                }],
            });
            return;
        }
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
        const embed: MessageEmbedOptions = {
            title: `🍿 ${j.Title} (${j.Year})`,
            description: `${j.Plot}`,
            fields,
            footer: {
                text: `${j.imdbID}${j.Production ? ` | Studio: ${j.Production}` : ''}`
            },
        }
        if (j.Poster && j.Poster.toLowerCase() !== "n/a") {
            const cres = await getColors(j.Poster);
            const pcol = cres[0] ? cres[0].num() : await client.database.getColor("info");
            embed.image = {
                url: j.Poster
            }
            embed.color = pcol;
        } else {
            embed.color = await client.database.getColor("info");
        }

        await message.channel.send({ embeds: [embed] });
    }
}
