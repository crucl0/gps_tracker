'use strict';

var map;
var currentLoc;
var newPoint;
var point;
var editMarker;
var refillMarker;
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


// ==========================================
// START of the block with commands to Points
function drawSavedPoints() {
  var points = getFromMongo('/points');
  if (points === 0) {
    navigator.geolocation.getCurrentPosition(function(position) {
      var pos = new google.maps.LatLng(position.coords.latitude,
                                       position.coords.longitude);
      map.setCenter(pos);
    });
  } else {
  for (var i=0; points[i]; i++) {
    var tmpLatLng = new google.maps.LatLng(points[i].lat, points[i].lng);
    var info = '<div id="fromDB">'+
    '<div id="header">' + points[i].gas_station + '&nbsp;' + 
        '<span title="Edit this point" id="editPen" onclick=editPoint("'+points[i]._id+'")>✎</span></div>' +
    '<div id="infoBody">' + points[i].description + '</div>' +
    '<div id="dButton"><span title="Delete this point" class="delButton" onclick=deleteFromMongo("'+points[i]._id+'")'+
        '>✂</span></div>'+
    '</div>';
        
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
  } else if (editMarker){
    editMarker.infowindow.close();
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

function editPoint(id) {
  if (refillMarker) {
    refillMarker.infowindow.close();
  }
  for (var i=0; markersPool[i]; i++) {
    if (markersPool[i].id == id) {
      editMarker = markersPool[i];
      editMarker.infowindow.close();
      markersPool.splice(i, 1);
    }
  }

  var editForm = fillNewForm(editMarker.marker.getPosition());
  editForm.childNodes[1].gas_station.value = editMarker.gas_station;
  editForm.childNodes[1].description.value = editMarker.description;

  editMarker.infowindow = addInfoWindow(editForm);
  editMarker.infowindow.open(map, editMarker.marker);


  document.getElementById('pButton').onclick = function() {
    editMarker.gas_station = editForm.childNodes[1].gas_station.value;
    editMarker.description = editForm.childNodes[1].description.value;
    editMarker.close();

    var response = putIntoMongo(editMarker);
    var info = '<div id="fromDB">'+
      '<div id="header">' + response.gas_station + '&nbsp;' + 
        '<span title="Edit this point" id="editPen" onclick=editPoint("'+response._id+'")>✎</span></div> ' +
      '<div id="infoBody">'+ response.description + '</div>' +
      '<div id="dButton"><span title="Delete this point" class="delButton" onclick=deleteFromMongo("'+response._id+'")>'+
        '✂</span></div>'+
      '</div>';

    var pos = new google.maps.LatLng(response.lat, response.lng);
    refillMarker = new Marker(addMarker(pos), addInfoWindow(info));
    refillMarker.infowindow.open(map, refillMarker.marker);
    markersPool.push(refillMarker);
  };
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
        currentLoc.added = true;
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

// END of the block with commands to Points
// ========================================



// ====================================
// START of the constructor and methods
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

function fillNewForm(pos) {
  var templateForm = document.getElementById('form_canvas').innerHTML;
  var formDiv = document.createElement('div');
  formDiv.id = 'form_div';
  formDiv.innerHTML = templateForm;
  formDiv.childNodes[1].lat.value = pos.lat();
  formDiv.childNodes[1].lng.value = pos.lng();
  return formDiv;
}

// END of the constructor and methods
// ==================================



//==========================================
// START of the block with commands to MongoDB
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
    var info = '<div id="fromDB">'+
      '<div id="header">' + response.gas_station + '&nbsp;' + 
        '<span title="Edit this point" id="editPen" onclick=editPoint("'+response._id+'")>✎</span></div> ' +
      '<div id="infoBody">'+ response.description + '</div>' +
      '<div id="dButton"><span title="Delete this point" class="delButton" onclick=deleteFromMongo("'+response._id+'")>'+
        '✂</span></div>'+
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
    point.description = response.description;
    point.gas_station = response.gas_station;
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


function putIntoMongo(editMarker){
  var request = null;
  var pointToEdit = {
    id: editMarker.id,
    lat: editMarker.marker.getPosition().lat(),
    lng: editMarker.marker.getPosition().lng(),
    gas_station: editMarker.gas_station,
    description: editMarker.description
  };

  var url = '/points/' + editMarker.id;
  request = new XMLHttpRequest();
  request.open('PUT', url, false);
  request.setRequestHeader('Content-type', 'application/json');
  request.send(JSON.stringify(pointToEdit));

  var response = JSON.parse(request.responseText);
  return response;
}

// END of the block with commands to MongoDB
// =======================================

google.maps.event.addDomListener(window, 'load', initialize);