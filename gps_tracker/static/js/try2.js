'use strict';
var google;
var map;
var marker;
var infowindow;

function initialize() {
  var mapOptions = {
    zoom: 15
  };
  map = new google.maps.Map(document.getElementById('map_canvas'),
      mapOptions);
  geoLocation();
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


function geoLocation() {
  // Try HTML5 geolocation
  if(navigator.geolocation) {

    navigator.geolocation.getCurrentPosition(function(position) {
      var pos = new google.maps.LatLng(position.coords.latitude,
                                       position.coords.longitude);

      map.setCenter(pos);
      var form = fillNewForm(pos);
      marker = placeMarker(pos, form);
      if (infowindow) infowindow.close();
      marker.infowindow = addInfoWindow(marker, form).open(map, marker);
    }, function() {
      handleNoGeolocation(true);
    });
  } else {
    // Browser doesn't support Geolocation
    handleNoGeolocation(false);
  }
  return marker;
}

function fillNewForm(pos){
  var templateForm = document.getElementById("form_canvas").innerHTML;
  var formDiv = document.createElement("div");
  formDiv.innerHTML = templateForm;
  formDiv.firstChild;
  formDiv.childNodes[1].lat.value = pos.lat();
  formDiv.childNodes[1].lng.value = pos.lng();
  return formDiv;
}

function placeMarker(location, info) {
  if ( marker ) {
    marker.setPosition(location);
  } else {
      marker = new google.maps.Marker({
      position: location,
      map: map,
      infowindow: new google.maps.InfoWindow({
      content: info}),
      draggable: false,
      });

      google.maps.event.addListener(marker, "click", function() {
        infowindow.open(map, marker);
    });
  }
  return marker;
}


function addInfoWindow(marker, message) {
     infowindow = new google.maps.InfoWindow({
        content: message
    });

    return infowindow;
}

google.maps.event.addDomListener(window, 'load', initialize);