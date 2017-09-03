var map;

function initMap() {
    getMarkers();

    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: -12.693858, lng: -38.322884 },
        zoom: 5,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    });
}

function loadJSON(callback) {
    var xobj = new XMLHttpRequest();
    xobj.overrideMimeType("application/json");
    xobj.open('GET', 'data/imported/myjsonfile.json', true);
    //xobj.open('GET', 'data/imported/steamWebApi1000', true);
    xobj.onreadystatechange = function () {
        if (xobj.readyState == 4 && xobj.status == 200) {
            callback(xobj.responseText);
        }
    };

    xobj.send(null);
}

function getMarkers() {
    loadJSON(function (response) {
        var steamWepApiData = JSON.parse(response);

        steamWepApiData.forEach(function (element) {
            var marker = new google.maps.Marker({
                position: new google.maps.LatLng(element.longitude, element.latitude),
                title: element.username,
                map: map
            });

            var infowindow = new google.maps.InfoWindow();

            google.maps.event.addListener(marker, 'click', (function (marker, i) {
                return function () {
                    infowindow.setContent("<b>" + element.mostPlayedGameName + "</b><br/><img src='" + element.mostPlayedGameLogo + "' alt='" + element.mostPlayedGameName + "'>");
                    infowindow.open(map, marker);
                }
            })(marker))
        });

        getHighestOccurrenceGames(steamWepApiData);
    });
}

function getHighestOccurrenceGames(steamWepApiData) {
    var obj = {};

    for (var i = 0, j = steamWepApiData.length; i < j; i++) {
        if (obj[steamWepApiData[i].mostPlayedGameName]) {
            obj[steamWepApiData[i].mostPlayedGameName]++;
        }
        else {
            obj[steamWepApiData[i].mostPlayedGameName] = 1;
        }
    }

    /*obj.sort(function (a, b) {
        return parseFloat(a.price) - parseFloat(b.price);
    }); */

    var keys = Object.keys(obj);
    var largest = Math.max.apply(null, keys.map(x => obj[x]));
    var result = keys.reduce((result, key) => { if (obj[key] === largest) { result.push(key); } return result; }, []);

    //obj = Object.keys(obj).reduce(function (a, b) { return obj[a] > obj[b] ? a : b });

    console.log(result);
}

function getGamesDbData(mostPlayedGameName, callback) {
    var xhr = new XMLHttpRequest();
    xhr.overrideMimeType("text/xml");
    xhr.open("GET", "http://thegamesdb.net/api/GetGame.php?exactname=" + mostPlayedGameName, true);

    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4 && xhr.status == 200) {
            var resposta = xhr.responseText;

            parser = new DOMParser();
            xmlDoc = parser.parseFromString(resposta, "text/xml");
        }
    }

    xhr.send();
}