const twitterKeys = require("./twitterKeys.js");
const spotifyKeys = require("./spotifyKeys.js");
const request = require("request");
const fs = require("fs");
const file = "./random.txt";
const logFile = "./log.txt";

var action = process.argv[2];
var input;
if (process.argv[3]) {
  input = process.argv[3];
}

run();

function run() {
  switch (action) {
    case 'my-tweets':
      twitter();
      break;
    case 'spotify-this-song':
      if (input) {
        spotify(input);
      } else {
        spotify('The Sign');
      }
      break;
    case 'movie-this':
      if (input) {
        movie(input);
      } else {
        movie('Mr. Nobody');
      }
      break;
    case 'do-what-it-says':
      runRandom();
      break;
    default:
      logStuff("Please enter a valid action.  Valid actions are as follows:");
      logStuff("my-tweets");
      logStuff("spotify-this-song '<song name>'");
      logStuff("movie-this '<movie name>'");
      logStuff('do-what-it-says');
  }
}

function twitter() {
  // Show last 20 tweets and when they were created
  var params = {screen_name: 'google'};

  twitterKeys.get('statuses/user_timeline', params, function(error, tweets, response) {
    if (!error && response.statusCode === 200) {
      // console.log(tweets);
      for (var i = 0; i < tweets.length; i++) {
        logStuff(tweets[i].text);
        logStuff(tweets[i].created_at);
        logStuff('');
      }
    }
  });
}

function spotify(songName) {
  let trackItem = 0;

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
      return console.log('Error occurred: ' + error);
    }

  });

}

function movie(movieName) {
  var queryUrl = "http://www.omdbapi.com/?t=" + movieName + "&y=&plot=short&apikey=trilogy";

  request(queryUrl, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      // console.log(JSON.parse(body));

      logStuff(JSON.parse(body).Title + " (" + JSON.parse(body).Year + ")");
      logStuff("IMDB: " + JSON.parse(body).Ratings[0].Value + " | Rotten Tomatoes: " + JSON.parse(body).Ratings[0].Value);
      logStuff(JSON.parse(body).Country + ", " + JSON.parse(body).Language);
      logStuff(JSON.parse(body).Plot);
      logStuff("Actors: " + JSON.parse(body).Actors);
    }

  });
}

function runRandom() {
  fs.readFile(file, "utf8", function(error, data) {
    if (!error) {
      var dataArr = data.split(",");
      action = dataArr[0];
      input = dataArr[1];
      run();
    } else {
      return console.log(error);
    }
  });
}

function logStuff(stuff) {
  fs.appendFile(logFile, stuff + '\n', function(err) {
    if (err) {
      console.log(err);
    }
    else {
      console.log(stuff);
    }

  });
}
