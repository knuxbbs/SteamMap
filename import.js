var s = require("./steam-config");
var steam_countries = require('./steam_countries.min.json');
var count = 0;

s.getFriendList({
  steamid: '76561198168752057',
  relationship: 'all', //'all' or 'friend' 
  callback: function (err, data) {
    data.friendslist.friends.forEach(function (user) {

      s.getPlayerSummaries({
        steamids: user.steamid,
        callback: function (err, data) {
          data.response.players.forEach(function (player) {
            var username = player.personaname;
            var country = player.loccountrycode;
            var state = player.locstatecode;
            var city = player.loccityid;
            var longitude = "";
            var latitude = "";

            if (country) {
              var ctrs = steam_countries[country];
              if (state) {
                state = ctrs.states[player.locstatecode].name;
                if(city){
                  city = ctrs.states[player.locstatecode].cities[player.loccityid].name;
                  longitude = ctrs.states[player.locstatecode].cities[player.loccityid].coordinates.split(",")[0];
                  latitude = ctrs.states[player.locstatecode].cities[player.loccityid].coordinates.split(",")[1];
                }
              }
            }

            s.getOwnedGames({
              steamid: user.steamid,
              include_appinfo: true,
              callback: function (err, data) {
                if (data) {
                  //Obtém o game com mais tempo de jogo
                  var res = Math.max.apply(Math, data.response.games.map(function (o) { return o.playtime_forever; }))

                  //Obtém o objeto que representa o game
                  var obj = data.response.games.find(function (o) { return o.playtime_forever == res; })

                  s.getSchemaForGame({
                    appid: obj.appid,
                    callback: function (err, data) {

                      if (data.game) {
                        console.log("User id: " + user.steamid);
                        console.log("User name: " + username);
                        console.log("Most played game id: " + obj.appid);
                        console.log("Most played game name: " + data.game.gameName);
                        console.log("Localization: " + city + ", " + state + ", " + country);
                        if (latitude) console.log("Longitude: " + longitude);
                        if (longitude) console.log("Latitude: " + latitude);
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
    }, this);
  },
});
