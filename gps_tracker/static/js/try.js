'use strict';
var google;
var map;
var marker;

function initialize() {
    var mapOptions = {
        center: new google.maps.LatLng(59.213, 39.907),
        zoom: 15,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        streetViewControl: false,
        panControl: false,
        zoomControlOptions: {
            style: google.maps.ZoomControlStyle.LARGE,
            position: google.maps.ControlPosition.LEFT_BOTTOM
        }
    };

    map = new google.maps.Map(document.getElementById('map_canvas'),
        mapOptions);

    drawAllPoints();

    google.maps.event.addListener(map, 'click', function (event) {
        var coords = event.latLng;
        var newForm = document.getElementById('form_canvas');

        document.getElementById('form_canvas').style.display = 'block';

        document.getElementById('lat').value = coords.lat();
        document.getElementById('lng').value = coords.lng();

        if (!marker.fromDB) {
            marker.setMap(null);
        }
        addMarker(coords);
        addInfoWindow(marker, newForm).open(map, marker);
        }
    );
}

function drawAllPoints() {
    var points = getFromMongo('/points');
    for (var i=0; points[i]; i++) {
        var tmpLatLng = new google.maps.LatLng(points[i].lat, points[i].lng);
        addMarker(tmpLatLng);
        marker.fromDB = true;
        var info = '<h1>' + points[i].gas_station + '</h1>' +
        points[i].description + '<br>' +
        '<a href=/points/'+ points[i]._id + '>details</a>';
        addInfoWindow(marker, info);
    }
}

function addMarker(latLng){
    marker = new google.maps.Marker({
        position: latLng,
        map: map
    });
}

function addInfoWindow(marker, message) {
    var infoWindow = new google.maps.InfoWindow({
        content: message
    });

    google.maps.event.addListener(marker, 'click', function () {
        infoWindow.open(map, marker);
    });

    return infoWindow;
}

function getFromMongo(url){
    var request = null;
    request = new XMLHttpRequest();
    request.open('GET', url, false);
    request.send(null);
    var response = JSON.parse(request.responseText);

    return response;
}

function postToMongo(){
    var request = null;
    var data = {
        lat: document.getElementById('lat').value,
        lng: document.getElementById('lng').value,
        gas_station: document.getElementById('gas_station').value,
        description: document.getElementById('description').value
    };

    request = new XMLHttpRequest();

    request.open('POST', '/points', false);
    request.setRequestHeader('Content-type', 'application/json');
    request.send(JSON.stringify(data));
}

google.maps.event.addDomListener(window, 'load', initialize);
