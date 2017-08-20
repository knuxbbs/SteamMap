var s = require("./steam-config");
var steamCountries = require('./data/steam_countries.min.json');
var fs = require('fs');
var steamUserDataArray = [];
var itemsProcessed = 0;
var counter = 0;
const max = 1000;

getSteamWebApiData("76561198168752057", repeatCallback);

function repeatCallback(newSteamId) {
  itemsProcessed = 0;
  if (newSteamId !== "") {
    getSteamWebApiData(newSteamId, repeatCallback);
  } else {
    console.log("Importação finalizada.");
    writeJsonFile();
  }
}

function writeJsonFile(callback) {
  //Cria arquivo JSON com dados obtidos do webservice
  var json = JSON.stringify(steamUserDataArray);
  fs.writeFile('./data/imported/myjsonfile.json', json, 'utf8', callback);
}

function getSteamWebApiData(steamid, callback) {
  s.getFriendList({
    steamid: steamid,
    relationship: 'all', //'all' or 'friend'
    callback: function (err, data1, newSteamId) {
      if (data1.friendslist) {
        data1.friendslist.friends.forEach(function (friend) {

          itemsProcessed++;

          s.getPlayerSummaries({
            steamids: friend.steamid,
            callback: function (err, data2) {
              if (data2) {
                //TODO: Interromper laço de repetição caso counter > max;
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
                    } else if (country && country.coordinates) {
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

                              //Cria objeto a ser inserido no JSON
                              var steamUserData = getSteamUserData(friend.steamid, username, mostPlayedGame.appid,
                                data4.game.gameName, localization, longitude, latitude);

                              //Verifica se dados do jogador já foram inseridos ao vetor de elementos antes de adicioná-lo
                              var elementPos = steamUserDataArray.map(function (x) { return x.steamid; }).indexOf(friend.steamid);
                              if (!steamUserDataArray[elementPos]) steamUserDataArray.push(steamUserData);

                              console.log(++counter);
                              console.log("User id: " + friend.steamid);
                              console.log("User name: " + username);
                              console.log("Most played game id: " + mostPlayedGame.appid);
                              console.log("Most played game name: " + data4.game.gameName);
                              console.log("Localization: " + localization);
                              console.log("Longitude: " + longitude);
                              console.log("Latitude: " + latitude);
                              console.log();
                            }

                            if (itemsProcessed === data1.friendslist.friends.length) {
                              newSteamId = getRandomId(data1.friendslist.friends);
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
      } else {
        //Obtém id aleatório do vetor de usuários ja importados, caso algum dos usuários não tenha tornado pública a sua lista de amigos.
        newSteamId = getRandomId(steamUserDataArray);
        callback(newSteamId);
      }
    }
  })
}

function getSteamUserData() {
  var steamUserData = {
    steamid: arguments[0],
    username: arguments[1],
    mostPlayedGameId: arguments[2],
    mostPlayedGameName: arguments[3],
    localization: arguments[4],
    longitude: arguments[5],
    latitude: arguments[6]
  };

  return steamUserData;
}

function getRandomId(dataArray) {
  //Obtém id aleatório dentre a lista de amigos para que seja feita nova busca.
  var newSteamId = dataArray[Math.floor(Math.random() * dataArray.length)].steamid;

  if (counter <= max) {
    return newSteamId;
  } else {
    return "";
  }
}