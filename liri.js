/**
 * Liri Node Application
 */

// Dependencies
// ==================================================

// Set environment variables
require("dotenv").config();
// File system
const fs = require("fs"),
// Inquirer command line utility
inquirer = require("inquirer"),
// Spotify keys
keys = require("./keys"),
// Moment date module
moment = require("moment"),
// Request module
request = require("request"),
// Spotify API
Spotify = require("node-spotify-api");

// Global Variables
// ==================================================

// Command controller
const spotify = new Spotify(keys.spotify);
commandController = {};

// Concert this
commandController["concert-this"] = (artist) => {
    const url = `https://rest.bandsintown.com/artists/${encodeURI(artist)}/events?app_id=codingbootcamp`;
    request(url, concertCall);
};

// Spotify this song
commandController["spotify-this-song"] = (song = "The Sign") => {
    spotify.search({
        type: "track", 
        query: song
    }, (err, data) => {
        if (!err) {
            const {items} = data.tracks;
            items.slice(0, 10).forEach((item) => {
                console.log("--------------------------------------------------");
                console.log("Artist(s):", item.album.artists[0].name);
                console.log("Album:", item.album.name);
                console.log("URL:", item.album.external_urls.spotify);
                console.log("Search:", title(song));
            });
        }
    });
};

// Movie this
commandController["movie-this"] = (movie = "Mr. Nobody") => {
    const url = `http://www.omdbapi.com/?i=tt3896198&apikey=616d8129&t=${encodeURI(movie)}&plot=short`;
    request(url, movieSearch);
};

// Do what it says
commandController["do-what-it-says"] = () => {
    fs.readFile("./random.txt", "utf8", (err, data) => {
        if (!err) {
            commandController["spotify-this-song"](data);
        }
    });
};

// Functions
// ==================================================

// Capitalize word
const capitalize = (word) => `${word.charAt(0).toUpperCase()}${word.substring(1).toLowerCase()}`;

// Title case words
const title = (words) => words.split(" ").map(capitalize).join(" ");

// Concert call
function concertCall(err, res, body) {
    if (!err) {
        const events = JSON.parse(body);
        events.slice(0, 10).forEach((event, i) => {
            const {venue, datetime} = event,
                {name, city, country} = venue,
                formattedDate = moment(datetime).format("MM/DD/YYYY");
            console.log(
                "--------------------------------------------------\n" +
                `${name}\n` +
                `${city}, ${country}\n` +
                `${formattedDate}`
            );
        });
    }
}

// Movie search
function movieSearch(err, res, body) {
    if (!err) {
        const {Title, Year, Ratings, Country, Language, Actors} = JSON.parse(body),
        [{Source: IMDB, Value: IMDBRating},
        {Source: RT, Value: RTRating}] = Ratings;
        console.log("Title:", Title);
        console.log("Year:", Year);
        console.log(`${IMDB} Rating:`, IMDBRating);
        console.log(`${RT} Rating:`, RTRating);
        console.log("Country:", Country);
        console.log("Language:", Language);
        console.log("Actors:", Actors);
    }
}

// Get command
function getCommand() {
    inquirer
        .prompt([
            {
                type: "list",
                name: "command",
                message: "What would you like to do?",
                choices: [
                    "Concert This",
                    "Spotify This Song",
                    "Movie This",
                    "Do What It Says"
                ]
            }
        ])
        .then(getParams)
        .then(executeCommand);
}

// Get parameters
function getParams(input) {
    const command = input.command.replace(/\s/g, "-").toLowerCase();
    let message;
    switch (command) {
        case "concert-this":
            message = "What artist would you like get concert information on?";
            break;
        case "spotify-this-song":
            message = "What song would you like to search for?";
            break;
        case "movie-this":
            message = "What movie title would you like to look up?";
            break;
        default:
            message = "Something went wrong, press 'Ctrl + C' to abort.";
    }
    return {command, message};
}

// Execute command with parameters
function executeCommand({command, message}) {
    if (command === "do-what-it-says") {
        commandController[command]();
    } else {
        inquirer
            .prompt([
                {
                    type: "input",
                    name: "param",
                    message
                }
            ])
            .then((input) => {
                const {param} = input;
                commandController[command](param);
            });
    }
}

// Main
// ==================================================

getCommand();
