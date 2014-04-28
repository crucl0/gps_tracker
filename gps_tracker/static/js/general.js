'use strict';

var map, google;
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


// ==========================================
// START of the block with commands to Points
function drawSavedPoints() {
  var points = getFromMongo('/points');

  if (points.length === 0) {
    navigator.geolocation.getCurrentPosition(function(position) {
      var pos = new google.maps.LatLng(position.coords.latitude,
                                       position.coords.longitude);
      map.setCenter(pos);
    });
  } else {
  for (var i=0; i<points.length; i++) {
    var tmpLatLng = new google.maps.LatLng(points[i].lat, points[i].lng);
    var info = fillWhatExists(points[i]);
        
    var point = new Marker(addMarker(tmpLatLng), addInfoWindow(info));
    point.marker.setTitle(points[i].title);

    point.id = points[i]._id;
    point.description = points[i].description;
    point.title = points[i].title;
    point.fromDB = true;
    markersPool.push(point);
    map.setCenter(point.marker.getPosition());
  }
  // map.setCenter(point.marker.getPosition());
  }
}


function addNewPoint() {
  if (checkInPool(point, 'current', true) || (checkInPool(point, 'manual', true))) {
    clearInterval(intervalID);
    point.close();
    markersPool.splice(markersPool.indexOf(point), 1);
    point = null;
  }
  chosen = false;
  map.setOptions({draggableCursor:'crosshair'});
  google.maps.event.addListener(map, 'click', function(event) {
    if (!chosen) {
      var pos = event.latLng;
  
      point = new Marker(addMarker(pos), addInfoWindow(fillNewForm(pos)));
      point.infowindow.open(map, point.marker);
      point.marker.setDraggable(true);
      point.fromDB = false;
      point.manual = true;
      map.setOptions({draggableCursor: null});
      chosen = true;
      markersPool.push(point);

      google.maps.event.addListener(point.infowindow, 'closeclick', function() {
        point.marker.setVisible(false);
        map.setOptions({draggableCursor: null});
      });

      google.maps.event.addListener(point.marker, 'dragstart', function() {
        point.infowindow.close();
      });

      google.maps.event.addListener(point.marker, 'dragend', function(event) {
        var pos = event.latLng;
        point.infowindow.close();
        point.infowindow = addInfoWindow(fillNewForm(pos));
        point.infowindow.open(map, point.marker);
        map.setOptions({draggableCursor: null});

        google.maps.event.addListener(point.infowindow, 'closeclick', function() {
          point.marker.setVisible(false);
          map.setOptions({draggableCursor: null});
        });
      });
    }
  });
}

function editPoint(id) {
  var ind;
  var editMarker;
  var origin_info;

  for (var i=0; i<markersPool.length; i++) {
    if (markersPool[i].id == id) {
      ind = i;
      markersPool[i].infowindow.close();
      editMarker = markersPool[i];
      origin_info = markersPool[i].infowindow;
    }
  }

  var editForm = fillNewForm(editMarker.marker.getPosition());
  editForm.childNodes[1].title.value = editMarker.title;
  editForm.childNodes[1].title.value = editMarker.title;

  editMarker.infowindow = addInfoWindow(editForm);
  editMarker.infowindow.open(map, editMarker.marker);

  editMarker.marker.setDraggable(true);

  document.getElementById('pButton').onclick = function() {
    editMarker.title = document.getElementById('title').value;
    editMarker.title = document.getElementById('description').value;
    editMarker.close();
       
    var response = putIntoMongo(editMarker);
    var info = fillWhatExists(response);
    var pos = new google.maps.LatLng(response.lat, response.lng);

    editMarker = new Marker(addMarker(pos), addInfoWindow(info));
    editMarker.id = response._id;
    editMarker.title = response.title;
    editMarker.description = response.description;
    editMarker.infowindow.open(map, editMarker.marker);
    editMarker.fromDB = true;
    markersPool[ind] = editMarker;
  };

  google.maps.event.addListener(editMarker.infowindow, 'closeclick', function() {
    editMarker.infowindow = origin_info;
    editMarker.infowindow.open(map, editMarker.marker);
      });
}


function relocate() {
  navigator.geolocation.getCurrentPosition(function(position) {
    var pos = new google.maps.LatLng(position.coords.latitude,
                                       position.coords.longitude);
   
    point.marker.setPosition(pos);
    document.getElementById('lat').value = pos.lat();
    document.getElementById('lng').value = pos.lng();
  });
}

function checkInPool(point, property, value) {
  for (var i=0; i<markersPool.length; i++){
    if (markersPool[i] == point) {
      if (point.hasOwnProperty(property)){
        if (point[property] == value) {
          return true;
        } else {
          console.log('Such property was found but value did not match. ' +
            'Property «'+property+'» has the value «'+point[property]+'», not «'+value+'». Sory.');
          return false;
        }
      } else {
        console.log('This object did not have «'+property+'» property. Sory.');
        return undefined;
      }
    }
  }
}


function geoLocation() {
  if (checkInPool(point, 'manual', true)){
    point.close();
    markersPool.splice(markersPool.indexOf(point), 1);
    point = null;
  }
 if (navigator.geolocation) {

  var currentPos = navigator.geolocation.getCurrentPosition(
    function(position) {
      var pos = new google.maps.LatLng(position.coords.latitude,
                                       position.coords.longitude);
      map.setCenter(pos);

      if (checkInPool(point, 'fromDB', false) && checkInPool(point, 'current', true)) {
        point.refresh();
      } else {
        point = new Marker(addMarker(pos), addInfoWindow(fillNewForm(pos)));
        point.infowindow.open(map, point.marker);
        point.current = true;
        point.fromDB = false;
        markersPool.push(point);
        intervalID = setInterval(relocate, 5000);
      }

      google.maps.event.addListener(point.infowindow, 'closeclick', function() {
          point.marker.setVisible(false);
          markersPool.splice(markersPool.indexOf(point), 1);
          clearInterval(intervalID);
      });
    }
  );
  return point;
  } else {
    alert('Geolocation is not supported in your browser');
  }

}

// END of the block with commands to Points
// ========================================


// ============================================
// START of the block with commands to Stations

function addStation() {
  
}

// END of the block with commands to Stations
// ==========================================

// ====================================
// START of the constructor and methods
function Marker(marker, infowindow) {
  this.marker = marker;
  this.pos = marker.getPosition();
  this.infowindow = infowindow;
  this.editing = false;
  this.fromDB = false;
  this.manual = false;
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

function convertDate(inputFormat) {
  function pad(s) { return (s < 10) ? '0' + s : s; }
  var d = new Date(inputFormat);
  return [' '+pad(d.getDate()), pad(d.getMonth()+1), d.getFullYear()].join('/');
}


function fillWhatExists(source) {

  var div_fromDB = document.createElement('div');
     div_fromDB.id = 'fromDB';
     div_fromDB.style.minHeight = '150px';
  //
     var div_header = document.createElement('div');
        div_header.id = 'header';

        var span_header_text = document.createElement('span');
           span_header_text.id = 'title'+'~'+source._id;
           span_header_text.ondblclick = function(){
              transform(this, source._id);
           };
           span_header_text.style.marginRight = '10px';
           span_header_text.appendChild( document.createTextNode(source.title) );
        div_header.appendChild( span_header_text );

        var span_editPen = document.createElement('span');
           span_editPen.onclick = function(){
              editPoint(source._id);
           };
           span_editPen.id = 'editPen';
           span_editPen.title = 'Edit this point';
           span_editPen.textContent = '✎';
           span_editPen.style.float = 'right';
        div_header.appendChild( span_editPen );

     div_fromDB.appendChild( div_header );
  //
     var div_date = document.createElement('div');
        div_date.id = 'date';

        var span_time_icon = document.createElement('span');
           span_time_icon.id = 'time_icon';
           span_time_icon.appendChild( document.createTextNode('⌚') );
        div_date.appendChild( span_time_icon );

        var span_time = document.createElement('span');
           span_time.id = 'date'+'~'+source.date;
           span_time.innerHTML = convertDate(source.date);
           span_time.ondblclick = function(){
              transform(this, source._id);
            };
        div_date.appendChild( span_time );

     div_fromDB.appendChild( div_date );
  //
     var div_infoBody = document.createElement('div');
        div_infoBody.id = 'description'+'~'+source.description;
        div_infoBody.textContent = source.description;
        div_infoBody.ondblclick = function(){
              transform(this, source._id);
           };
        div_infoBody.style.marginBottom = '10px';
     div_fromDB.appendChild( div_infoBody );
  //
     var div_dButton = document.createElement('div');
        div_dButton.id = 'dButton';

        var span_del = document.createElement('span');
          span_del.id = 'delete';
           span_del.onclick = function(){
              deleteFromMongo(source._id);
           };
           span_del.className = 'delButton';
           span_del.title = 'Delete this point';
           span_del.textContent = '✂';
        div_dButton.appendChild( span_del );
  //
     div_fromDB.appendChild( div_dButton );

   return div_fromDB;
}


function transform (elem, id) {
  var old = document.getElementById(elem.id);

  if (elem.id.split('~')[0] == 'title') {
    var input = document.createElement('input');
    input.setAttribute('type', 'text');
    input.setAttribute('autofocus', true);
    input.setAttribute('maxlength', 20);
    input.style.width = '180px';
    input.value = old.textContent;
    input.id = 'replace' + elem.id;
    input.style.float = 'left';
  
  } else if (elem.id.split('~')[0] == 'description'){

    var input = document.createElement('textarea');
    input.setAttribute('autofocus', true);
    input.setAttribute('maxlength', 140);
    input.value = old.textContent;
    input.style.width = '220px';
    input.style.height = '5em';
    input.style.marginBottom = '10px';
    input.id = 'replace' + elem.id;
    input.style.float = 'left';

  } else {
    var input = document.createElement('input');
    input.setAttribute('type', 'date');
    input.setAttribute('autofocus', true);
    var d = elem.id.split('~')[1];
    input.value = d.split('T')[0];
    input.style.width = '170px';
    input.style.float = 'right';
  }

  old.parentNode.replaceChild( input, old);
  
  input.onblur = function() {

    if (input.type == 'date') {
      var chosenDate = input.value.split('-');
      var isoDate = new Date();
      isoDate.setFullYear(chosenDate[0]);
      isoDate.setMonth(chosenDate[1]-1);
      isoDate.setDate(chosenDate[2]);
      input.parentNode.replaceChild(old, input);
      old.textContent = convertDate(isoDate);

      var dataToPatch = {};
      dataToPatch['date'] = isoDate;
      patchIntoMongo(id, dataToPatch);

    } else {
      old.textContent = input.value;
      input.parentNode.replaceChild(old, input);

      var dataToPatch = {};
      dataToPatch[elem.id.split('~')[0]] = input.value;
      dataToPatch['date'] = new Date();
      patchIntoMongo(id, dataToPatch);
    }
  };

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

function postToMongo(url) {
  var now = new Date();
    var data = {
        lat: document.getElementById('lat').value,
        lng: document.getElementById('lng').value,
        title: document.getElementById('title').value,
        description: document.getElementById('description').value,
        date: now
    };

    var request = new XMLHttpRequest();

    request.open('POST', url, false);
    request.setRequestHeader('Content-type', 'application/json');
    request.send(JSON.stringify(data));

    var response = JSON.parse(request.responseText);
    var pos = new google.maps.LatLng(response.lat, response.lng);
    var info = fillWhatExists(response);

    if (checkInPool(point, 'current', true) || (checkInPool(point, 'manual', true))){
      point.close();
      markersPool.splice(markersPool.indexOf(point), 1);
      point = null;
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
      markersPool.splice(markersPool.indexOf(markersPool[i]), 1);
    }

  }
}


function putIntoMongo(editMarker){
  var request = null;
  var now = new Date();
  var pointToEdit = {
    _id: editMarker.id,
    lat: editMarker.marker.getPosition().lat(),
    lng: editMarker.marker.getPosition().lng(),
    gas_station: editMarker.gas_station,
    description: editMarker.description,
    date: now
  };

  var url = '/points/' + editMarker.id;
  request = new XMLHttpRequest();
  request.open('PUT', url, false);
  request.setRequestHeader('Content-type', 'application/json');
  request.send(JSON.stringify(pointToEdit));

  var response = JSON.parse(request.responseText);
  return response;
}


function patchIntoMongo(id, dataToPatch){
  var request = null;
  var url = '/points/' + id;
  request = new XMLHttpRequest();
  request.open('PATCH', url, false);
  request.setRequestHeader('Content-type', 'application/json');
  request.send(JSON.stringify(dataToPatch));

  var response = JSON.parse(request.responseText);
  return response;
}
// END of the block with commands to MongoDB
// =======================================

google.maps.event.addDomListener(window, 'load', initialize);
