const twitterKeys = require("./twitterKeys.js");
const spotifyKeys = require("./spotifyKeys.js");
const request = require("request");
const fs = require("fs");
const file = "./random.txt";

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
      console.log("Please enter a valid action.  Valid actions are as follows:");
      console.log("my-tweets");
      console.log("spotify-this-song '<song name>'");
      console.log("movie-this '<movie name>'");
      console.log('do-what-it-says');
  }
}

function twitter() {
  // Show last 20 tweets and when they were created
  var params = {screen_name: 'google'};

  twitterKeys.get('statuses/user_timeline', params, function(error, tweets, response) {
    if (!error && response.statusCode === 200) {
      // console.log(tweets);
      for (var i = 0; i < tweets.length; i++) {
        console.log(tweets[i].text);
        console.log(tweets[i].created_at);
        console.log('');
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
        console.log("Artists: " + artists);
      } else {
        console.log("Artist: " + data.artists[0].name);
      }

      console.log("Title: " + data.name);
      console.log("Preview: " + data.preview_url);
      console.log("Album: " + data.album.name);
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

      console.log(JSON.parse(body).Title + " (" + JSON.parse(body).Year + ")");
      console.log("IMDB: " + JSON.parse(body).Ratings[0].Value + " | Rotten Tomatoes: " + JSON.parse(body).Ratings[0].Value);
      console.log(JSON.parse(body).Country + ", " + JSON.parse(body).Language);
      console.log(JSON.parse(body).Plot);
      console.log("Actors: " + JSON.parse(body).Actors);
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
