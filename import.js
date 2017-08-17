var s = require("./steam-config");
var steamCountries = require('./data/steam_countries.min.json');
var counter = 0;

s.getFriendList({
  steamid: '76561198168752057',
  relationship: 'all', //'all' or 'friend'
  callback: function (err, data) {
    data.friendslist.friends.forEach(function (friend) {

      s.getPlayerSummaries({
        steamids: friend.steamid,
        callback: function (err, data) {
          data.response.players.forEach(function (player) {
            var username = player.personaname;
            var countrycode = player.loccountrycode;
            var state, city, longitude, latitude;

            if (countrycode) {
              var country = steamCountries[countrycode];

              if (player.locstatecode) {
                state = country.states[player.locstatecode].name;

                if (player.loccityid) {
                  city = country.states[player.locstatecode].cities[player.loccityid].name;
                  longitude = country.states[player.locstatecode].cities[player.loccityid].coordinates.split(",")[0];
                  latitude = country.states[player.locstatecode].cities[player.loccityid].coordinates.split(",")[1];
                } else {
                  longitude = country.states[player.locstatecode].coordinates.split(",")[0];
                  latitude = country.states[player.locstatecode].coordinates.split(",")[1];
                }
              } else {
                longitude = country.coordinates.split(",")[0];
                latitude = country.coordinates.split(",")[1];
              }
            }

            s.getOwnedGames({
              steamid: friend.steamid,
              callback: function (err, data) {
                if (data) {
                  //Obtém o game com mais tempo de jogo
                  var maxPlaytimeForever = Math.max.apply(Math, data.response.games.map(function (o) { return o.playtime_forever; }))

                  //Obtém o objeto que representa o game
                  var mostPlayedGame = data.response.games.find(function (o) { return o.playtime_forever == maxPlaytimeForever; })

                  s.getSchemaForGame({
                    appid: mostPlayedGame.appid,
                    callback: function (err, data) {

                      if (data.game && countrycode) {
                        var localization = countrycode;

                        if (state) {
                          localization = state + ", " + localization;
                          if (city) {
                            localization = city + ", " + localization;
                          }
                        }

                        console.log("User id: " + friend.steamid);
                        console.log("User name: " + username);
                        console.log("Most played game id: " + mostPlayedGame.appid);
                        console.log("Most played game name: " + data.game.gameName);
                        console.log("Localization: " + localization);

                        if (longitude) {
                          console.log("Longitude: " + longitude);
                          console.log("Latitude: " + latitude);
                        }

                        console.log();
                      }
                    }
                  });
                }
              }
            })
          })
        }
      })
    })
  },
});
