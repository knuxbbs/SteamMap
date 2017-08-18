var s = require("./steam-config");
var steamCountries = require('./data/steam_countries.min.json');
var itemsProcessed = 0;
var counter = 0;
const max = 100;

getSteamWebApiData("76561198168752057", function (newSteamId) {
  itemsProcessed = 0;
  if (newSteamId !== "") getSteamWebApiData(newSteamId);
});

/*
while (counter < 200){
  
}
*/

function getSteamWebApiData(steamid, callback) {  
  s.getFriendList({
    steamid: steamid,
    relationship: 'all', //'all' or 'friend'
    callback: function (err, data1, newSteamId) {
      if (data1.friendslist) {
        data1.friendslist.friends.forEach(function (friend) {

          s.getPlayerSummaries({
            steamids: friend.steamid,
            callback: function (err, data2) {
              if (data2) {
                data2.response.players.forEach(function (player) {
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
                    callback: function (err, data3) {
                      if (data3 && data3.response && data3.response.games) {
                        //Obtém o game com mais tempo de jogo
                        var maxPlaytimeForever = Math.max.apply(Math, data3.response.games.map(function (o) { return o.playtime_forever; }))

                        //Obtém o objeto que representa o game
                        var mostPlayedGame = data3.response.games.find(function (o) { return o.playtime_forever == maxPlaytimeForever; })

                        s.getSchemaForGame({
                          appid: mostPlayedGame.appid,
                          callback: function (err, data4) {

                            if (data4 && data4.game && countrycode) {
                              var localization = countrycode;

                              if (state) {
                                localization = state + ", " + localization;
                                if (city) {
                                  localization = city + ", " + localization;
                                }
                              }

                              console.log(++counter);
                              console.log("User id: " + friend.steamid);
                              console.log("User name: " + username);
                              console.log("Most played game id: " + mostPlayedGame.appid);
                              console.log("Most played game name: " + data4.game.gameName);
                              console.log("Localization: " + localization);

                              if (longitude) {
                                console.log("Longitude: " + longitude);
                                console.log("Latitude: " + latitude);
                              }

                              console.log();
                            }

                            itemsProcessed++;

                            if (itemsProcessed === data1.friendslist.friends.length) {
                              newSteamId = getRandomId(data1);
                              callback(newSteamId);
                            }
                          }
                        })
                      }
                    }
                  })
                })
              }
            }
          })
        })
      }
    }
  })
}

function getRandomId(data) {
  //Obtém id aleatório dentre a lista de amigos para que seja feita nova busca.
  var friendsArray = data.friendslist.friends;
  var newSteamId = friendsArray[Math.floor(Math.random() * friendsArray.length)].steamid;

  if (counter !== max) {
    return newSteamId;
  } else {
    return "";
  }
}