'use strict';

var map;
var currentLoc;
var newPoint;
var point;
var chosen;
var intervalID;
var markersPool = [];

function initialize() {

  var mapOptions = {
    zoom: 12,
  };
  
  map = new google.maps.Map(document.getElementById('map_canvas'),
      mapOptions);
  
  drawSavedPoints(); 
}


function drawSavedPoints() {
  var points = getFromMongo('/points');
  if (points == 0) {
    navigator.geolocation.getCurrentPosition(function(position) {
      var pos = new google.maps.LatLng(position.coords.latitude,
                                       position.coords.longitude);
      map.setCenter(pos);
    });
  } else {
  for (var i=0; points[i]; i++) {
    var tmpLatLng = new google.maps.LatLng(points[i].lat, points[i].lng);
    var info = '<div id="fromDB"><h1>' + points[i].gas_station + '</h1>' +
        points[i].description + '<br>' +
'<span class="delButton" onclick=deleteFromMongo("'+points[i]._id+'")>Delete this point</span>';
        
    var point = new Marker(addMarker(tmpLatLng), addInfoWindow(info));
    point.marker.setTitle(points[i].gas_station);

    point.id = points[i]._id;
    point.description = points[i].description;
    point.gas_station = points[i].gas_station;
    markersPool.push(point);
  }
  map.setCenter(point.marker.getPosition());
  }
}

function addNewPoint() {
  if (currentLoc) {
    currentLoc.close();
    stopTimer();
  }

  chosen = false;
  map.setOptions({draggableCursor:'crosshair'});
  google.maps.event.addListener(map, 'click', function(event) {
    if (!chosen) {
      var pos = event.latLng;
      if (newPoint && !newPoint.added) {
        newPoint.refresh();
        newPoint.marker.setPosition(pos);
        chosen = true;
      } else {
      newPoint = new Marker(addMarker(pos), addInfoWindow(fillNewForm(pos)));
      newPoint.infowindow.open(map, newPoint.marker);
      newPoint.marker.setDraggable(true);
      newPoint.added = true;
      map.setOptions({draggableCursor: null});
      chosen = true;
      }

    google.maps.event.addListener(newPoint.infowindow, 'closeclick', function() {
      newPoint.marker.setVisible(false);
      map.setOptions({draggableCursor: null});
      // chosen = true;
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
// return newPoint;
}

function stopTimer() {
  clearInterval(intervalID);
}

function relocate() {
  navigator.geolocation.getCurrentPosition(function(position) {
    var pos = new google.maps.LatLng(position.coords.latitude,
                                       position.coords.longitude);
   
    currentLoc.marker.setPosition(pos);
    document.getElementById('lat').value = pos.lat();
    document.getElementById('lng').value = pos.lng();
  });
}

function geoLocation() {
 if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      if (newPoint){
      newPoint.close();
      }

      var pos = new google.maps.LatLng(position.coords.latitude,
                                       position.coords.longitude);

      map.setCenter(pos);

      if (currentLoc) {
        currentLoc.refresh();
        intervalID = setInterval(relocate, 5000);
      } else {

        currentLoc = new Marker(addMarker(pos), addInfoWindow(fillNewForm(pos)));
        currentLoc.infowindow.open(map, currentLoc.marker);
        intervalID = setInterval(relocate, 5000);
      }

      google.maps.event.addListener(currentLoc.infowindow, 'closeclick', function() {
        currentLoc.marker.setVisible(false);
        stopTimer();
      });
    });
      return currentLoc;
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
  this.pos = marker.getPosition();
  this.infowindow = infowindow;
  this.refresh = function() {
    this.infowindow.close();
    this.marker.setPosition(this.pos);
    this.marker.setVisible(true);
    this.infowindow = addInfoWindow(fillNewForm(this.pos));
    this.infowindow.open(map, this.marker);
  };
  this.close = function() {
    this.infowindow.close();
    this.marker.setVisible(false);
  };

  google.maps.event.addListener(marker, 'click', function() {
    infowindow.open(map, marker);
  });

  return this;
}

// END of the constructor and methods ===

function fillNewForm(pos) {
  var templateForm = document.getElementById('form_canvas').innerHTML;
  var formDiv = document.createElement('div');
  formDiv.id = 'form_div';
  formDiv.innerHTML = templateForm;
  formDiv.childNodes[1].lat.value = pos.lat();
  formDiv.childNodes[1].lng.value = pos.lng();
  return formDiv;
}

function getFromMongo(url) {
    var request = null;
    request = new XMLHttpRequest();
    request.open('GET', url, false);
    request.send(null);
    var response = JSON.parse(request.responseText);

    return response;
}

function postToMongo() {
    var data = {
        lat: document.getElementById('lat').value,
        lng: document.getElementById('lng').value,
        gas_station: document.getElementById('gas_station').value,
        description: document.getElementById('description').value
    };

    var request = new XMLHttpRequest();

    request.open('POST', '/points', false);
    request.setRequestHeader('Content-type', 'application/json');
    request.send(JSON.stringify(data));

    var response = JSON.parse(request.responseText);

    var pos = new google.maps.LatLng(response.lat, response.lng);
    var info = '<div id="fromDB"><h1>' + response.gas_station + '</h1>' +
        response.description + '<br>' +
        '<br><span class="delButton" onclick=deleteFromMongo("'+response._id+'")>Delete this point</span>'+
        '</div>';

    if (newPoint) {
      newPoint.close();
    } else if (currentLoc) {
      currentLoc.close();
    }
    point = new Marker(addMarker(pos), addInfoWindow(info));
    point.marker.setTitle = response.gas_station;
    point.infowindow.open(map, point.marker);
    point.id = response._id;
    markersPool.push(point);
    return point;
}


function deleteFromMongo(id) {
  var request = null;
  var pointToDelete = {'id': id};
  var url = '/points/' + id;
  request = new XMLHttpRequest();
  request.open('DELETE', url, false);
  request.setRequestHeader('Content-type', 'application/json');
  request.send(JSON.stringify(pointToDelete));

  for (var i=0; markersPool[i]; i++) {
    if (markersPool[i].id == id) {
      markersPool[i].close();
    }

  }

}
google.maps.event.addDomListener(window, 'load', initialize);