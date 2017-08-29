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
    xobj.onreadystatechange = function () {
        if (xobj.readyState == 4 && xobj.status == "200") {
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
                title: "Meu ponto personalizado! :-D",
                map: map
            });

            var infowindow = new google.maps.InfoWindow();

            google.maps.event.addListener(marker, 'click', (function (marker, i) {
                return function () {
                    infowindow.setContent("Jogo mais jogado: " + element.mostPlayedGameName);
                    infowindow.open(map, marker);
                }
            })(marker))
        });
    });
}