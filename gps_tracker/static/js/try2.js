'use strict';
var google;
var map;
var marker;

function initialize() {
  var mapOptions = {
    zoom: 15
  };
  map = new google.maps.Map(document.getElementById('map_canvas'),
      mapOptions);

  // Try HTML5 geolocation
  if(navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      var pos = new google.maps.LatLng(position.coords.latitude,
                                       position.coords.longitude);

      map.setCenter(pos);
        var currentPosition = addMarker(pos);

        marker.icon = 'http://maps.google.com/mapfiles/kml/pushpin/red-pushpin.png';
        marker.title = 'Click to add this point';
        marker.infowindow = addInfoWindow(currentPosition, fillNewForm(pos));
        document.getElementById('form_canvas').style.display = 'block';
      
    }, function() {
      handleNoGeolocation(true);
    });
  } else {
    // Browser doesn't support Geolocation
    handleNoGeolocation(false);
  }

  var allMarkers = dbMarkers();
}


function handleNoGeolocation(errorFlag) {
  if (errorFlag) {
    var content = 'Error: The Geolocation service failed.';
  } else {
    var content = 'Error: Your browser doesn\'t support geolocation.';
  }

  var options = {
    map: map,
    position: new google.maps.LatLng(60, 105),
    content: content
  };

  var infowindow = new google.maps.InfoWindow(options);
  map.setCenter(options.position);
}


function getFromMongo(url){
    var request = null;
    request = new XMLHttpRequest();
    request.open('GET', url, false);
    request.send(null);
    var response = JSON.parse(request.responseText);
    return response;
}


function addMarker(latLng){
    marker = new google.maps.Marker({
        position: latLng,
        map: map,
        fromDB: false,
        icon: null,
        title: null
    });
    return marker;
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


function fillNewForm(pos){
  var newForm = document.getElementById('form_canvas');
  document.getElementById('lat').value = pos.lat();
  document.getElementById('lng').value = pos.lng();
  return newForm;
}


function dbMarkers(){
  var pool = [];
  var points = getFromMongo('/points');
  for (var i=0; i<points.length;i++){
    var pointID = points[i]._id;
    var tmpLatLng = new google.maps.LatLng(points[i].lat, points[i].lng);
    var marker = addMarker(tmpLatLng);
    marker.id = pointID;
    marker.fromDB = true;
    marker.title = points[i].gas_station;
    // marker.icon = 'http://maps.google.com/mapfiles/kml/paddle/red-stars.png';
    pool.push(marker);
    var info = '<h1>' + points[i].gas_station + '</h1>' +
      'Odometer: '+ points[i].odometer + '<br>' +
      points[i].description + '<br>' +
      '<a href=/points/'+ pointID + '>details</a>';
    marker.infowindow = addInfoWindow(marker, info);

  }
  return pool;
}


function postToMongo(){
    var request = null;
    var data = {
        lat: document.getElementById('lat').value,
        lng: document.getElementById('lng').value,
        gas_station: document.getElementById('gas_station').value,
        odometer: document.getElementById('odometer').value,
        description: document.getElementById('description').value
    };

    request = new XMLHttpRequest();

    request.open('POST', '/points', false);
    request.setRequestHeader('Content-type', 'application/json');
    request.send(JSON.stringify(data));
    marker.fromDB = true;
    marker.infowindow.close();
    marker.infowindow = null;
    marker.setIcon(null);
    marker.title = data.gas_station + ' added';

    var info = '<h1>' + data.gas_station + '</h1>' +
      'Odometer: '+ data.odometer + '<br>' +
      data.description + '<br>';
    marker.infowindow = addInfoWindow(marker, info);
    marker.infowindow.open(map, marker);
}

google.maps.event.addDomListener(window, 'load', initialize);