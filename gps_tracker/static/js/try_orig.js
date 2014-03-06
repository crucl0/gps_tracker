'use strict';
var map;
var marker = null;

function initialize() {
    var mapOptions = {
        center: new google.maps.LatLng(59.213, 39.907),
        zoom: 15,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    map = new google.maps.Map(document.getElementById('map_canvas'),
        mapOptions);

    drawAllPoints();

    google.maps.event.addListener(map, 'click', function(event) {
        var lat = event.latLng.lat();
        var lng = event.latLng.lng();
        var coord = 'Lat=' + lat + '; Lng=' + lng;

        // destroy old marker and form_canvas
        if (marker) {
            marker.setMap(null);
            // document.getElementById('form_canvas').style.display = 'none';
        }

        addMarker(event.latLng);
        addInfoWindow(marker, coord);
    });
}

function drawAllPoints() {
    var points = getFromMongo('/points');
    for (var i=0; points[i]; i++) {
        var tmpLatLng = new google.maps.LatLng(points[i]['lat'], points[i]['lng']);
        addMarker(tmpLatLng);
    }
}

function addMarker(latLng){
    marker = new google.maps.Marker({
        position: latLng,
        map: map
    })
}

function addInfoWindow(marker, message) {
    var infoWindow = new google.maps.InfoWindow({
        content: message
    });

    google.maps.event.addListener(marker, 'click', function () {
        infoWindow.open(map, marker);
        // document.getElementById('form_canvas').style.display = 'block';
    });
}

function getFromMongo(url){
    var request = null;
    request = new XMLHttpRequest(); 
    request.open('GET', url, false);
    request.send(null);
    var response = JSON.parse(request.responseText);

    return response
}


google.maps.event.addDomListener(window, 'load', initialize);

