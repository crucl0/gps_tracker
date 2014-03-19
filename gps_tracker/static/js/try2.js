'use strict';

var map;
var currentLoc;
var newPoint;
var chosen;

function initialize() {

  var mapOptions = {
    zoom: 3,
    center: new google.maps.LatLng(44.618126, 33.540518)
  };
  
  map = new google.maps.Map(document.getElementById('map_canvas'),
      mapOptions);

  drawSavedPoints();
}

function drawSavedPoints(){
  var points = getFromMongo('/points');
  for (var i=0; points[i]; i++) {
    var tmpLatLng = new google.maps.LatLng(points[i].lat, points[i].lng);
    var info = '<h1>' + points[i].gas_station + '</h1>' +
        points[i].description + '<br>' +
        '<a href=/points/'+ points[i]._id + '>details</a>';
        
    var point = new Marker(addMarker(tmpLatLng), addInfoWindow(info));
    point.marker.setTitle(points[i].gas_station);

    point.id = points[i]._id;
    point.description = points[i].description;
    point.gas_station = points[i].gas_station;
  }
}

function addNewPoint() {
  chosen = false;
  map.setOptions({draggableCursor:'crosshair'});
  google.maps.event.addListener(map, 'click', function(event) {
    if (!chosen) {
      var pos = event.latLng;
      if (newPoint) {
        newPoint.infowindow.close();
        newPoint.marker.setPosition(pos);
        newPoint.marker.setVisible(true);
        newPoint.infowindow = addInfoWindow(fillNewForm(pos));
        newPoint.infowindow.open(map, newPoint.marker);
        chosen = true;
      } else {
      newPoint = new Marker(addMarker(pos), addInfoWindow(fillNewForm(pos)));
      newPoint.infowindow.open(map, newPoint.marker);
      newPoint.marker.setDraggable(true);
      map.setOptions({draggableCursor: null});
      chosen = true;    
      }

    google.maps.event.addListener(newPoint.infowindow, 'closeclick', function() {
      newPoint.marker.setVisible(false);
      map.setOptions({draggableCursor: null});
    });

    google.maps.event.addListener(newPoint.marker, 'dragstart', function() {
      newPoint.infowindow.close();
    });

    google.maps.event.addListener(newPoint.marker, 'dragend', function(event) {
      var pos = event.latLng;
      newPoint.infowindow.close();
      newPoint.infowindow = addInfoWindow(fillNewForm(pos));
      newPoint.infowindow.open(map, newPoint.marker);
      map.setOptions({draggableCursor: null});

      google.maps.event.addListener(newPoint.infowindow, 'closeclick', function() {
        newPoint.marker.setVisible(false);
        map.setOptions({draggableCursor: null});
      });
    });

    }
  });
}

function geoLocation(){
 if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      var pos = new google.maps.LatLng(position.coords.latitude,
                                       position.coords.longitude);

      map.setCenter(pos); 
      // map.setZoom(12);

      if (currentLoc) {
        currentLoc.infowindow.close();
        currentLoc.marker.setPosition(pos);
        currentLoc.marker.setVisible(true);
        currentLoc.infowindow = addInfoWindow(fillNewForm(pos));
        currentLoc.infowindow.open(map, currentLoc.marker);
      } else {
      currentLoc = new Marker(addMarker(pos), addInfoWindow(fillNewForm(pos)));
      currentLoc.infowindow.open(map, currentLoc.marker);
      }

      google.maps.event.addListener(currentLoc.infowindow, 'closeclick', function() {
        currentLoc.marker.setVisible(false);
      });
    });

  } else {
    alert('Geolocation is not supported in your browser');
  } 
}

// START of the constructor and methods ===

function addMarker(position) {
  var newMarker = new google.maps.Marker({
    position: position,
    map: map
  });

  return newMarker;
}

function addInfoWindow(message) {
  var newInfoWindow = new google.maps.InfoWindow({
    content: message
  });
  return newInfoWindow;
}

function Marker(marker, infowindow) {
  this.marker = marker;
  this.infowindow = infowindow;

  google.maps.event.addListener(marker, 'click', function() {
    infowindow.open(map, marker);
  });

  return this;
}

// END of the constructor and methods ===

function fillNewForm(pos){
  var templateForm = document.getElementById('form_canvas').innerHTML;
  var formDiv = document.createElement('div');
  formDiv.innerHTML = templateForm;
  formDiv.childNodes[1].lat.value = pos.lat();
  formDiv.childNodes[1].lng.value = pos.lng();
  return formDiv;
}

function getFromMongo(url){
    var request = null;
    request = new XMLHttpRequest();
    request.open('GET', url, false);
    request.send(null);
    var response = JSON.parse(request.responseText);

    return response;
}

google.maps.event.addDomListener(window, 'load', initialize);