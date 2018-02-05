const twitterKeys = require("./twitterKeys.js");
const spotifyKeys = require("./spotifyKeys.js");
const request = require("request");
const inquirer = require("inquirer");
const fs = require("fs");
const file = "./random.txt";
const logFile = "./log.txt";
let input = "";

runLiri();

function runLiri() {
  input = "";
  inquirer.prompt([
    {
      type: "list",
      message: "Choose an action:",
      choices: [
        'my-tweets',
        'spotify-this-song',
        'movie-this',
        'do-what-it-says',
        'exit'
      ],
      name: "action"
    }
  ]).then(function(response) {
    let action = response.action;
    interpretAction(action);
  });
}

function interpretAction(action) {
  switch (action) {
    case 'my-tweets':
      twitter();
      break;
    case 'spotify-this-song':
      if (!input) {
        inquirer.prompt([
          {
            type: "input",
            name: "input",
            message: "What song would you like to search?",
            default: "The Sign"
          }
        ]).then(function(response) {
          input = response.input;
          spotify(input);
        });
      } else {
        spotify(input);
      }
      break;
    case 'movie-this':
      if (!input) {
        inquirer.prompt([
          {
            type: "input",
            name: "input",
            message: "What movie would you like to search?",
            default: "Mr. Nobody"
          }
        ]).then(function(response) {
          input = response.input;
          movie(input);
        });
      } else {
        movie(input);
      }
      break;
    case 'do-what-it-says':
      runRandom();
      break;
    case 'exit':
      logStuff('Thank you for using liri. Have a nice day.')
      return 1;
      break;
  }
}

function twitter() {
  // Show last 20 tweets and when they were created
  let params = {screen_name: 'google'};

  twitterKeys.get('statuses/user_timeline', params, function(error, tweets, response) {
    if (!error && response.statusCode === 200) {
      // console.log(tweets);
      for (var i = 0; i < tweets.length; i++) {
        logStuff(tweets[i].text);
        logStuff(tweets[i].created_at + "\n");
      }
    }
  });
}

function spotify(songName) {
  let trackItem = 0;
  // Hack to grab the right song
  if (songName == 'The Sign') {
    trackItem = 5;
  }

  spotifyKeys.search({ type: 'track', query: songName }, function(error, data) {
    if (!error) {
      data = data.tracks.items[trackItem];
      // console.log(data);

      // If more than one artist, list them all.
      if (data.artists.length > 1) {
        let artists = "";
        for (var i = 0; i < data.artists.length - 1; i++) {
          artists += data.artists[i].name + ", ";
        }
        artists += data.artists[data.artists.length - 1].name;
        logStuff("Artists: " + artists);
      } else {
        logStuff("Artist: " + data.artists[0].name);
      }

      logStuff("Title: " + data.name);
      logStuff("Preview: " + data.preview_url);
      logStuff("Album: " + data.album.name);
    } else {
      return logStuff('Error occurred: ' + error + "\n");
    }
  });
}

function movie(movieName) {
  let queryUrl = "http://www.omdbapi.com/?t=" + movieName + "&y=&plot=short&apikey=trilogy";

  request(queryUrl, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      // console.log(JSON.parse(body));
      logStuff(JSON.parse(body).Title + " (" + JSON.parse(body).Year + ")");
      logStuff("IMDB: " + JSON.parse(body).Ratings[0].Value + " | Rotten Tomatoes: " + JSON.parse(body).Ratings[0].Value);
      logStuff(JSON.parse(body).Country + ", " + JSON.parse(body).Language);
      logStuff(JSON.parse(body).Plot);
      logStuff("Actors: " + JSON.parse(body).Actors);
    } else {
      return logStuff('Error occurred: ' + error + "\n");
    }
  });
}

function runRandom() {
  fs.readFile(file, "utf8", function(error, data) {
    if (!error) {
      let dataArr = data.split(",");
      let action = dataArr[0];
      input = dataArr[1];
      interpretAction(action);
    } else {
      return logStuff('Error occurred: ' + error + "\n");
    }
  });
}

function logStuff(stuff) {
  fs.appendFile(logFile, stuff + '\n', function(err) {
    if (!err) {
      console.log(stuff);
    }
    else {
      return console.log('Error occurred: ' + error + "\n");
    }

  });
}
