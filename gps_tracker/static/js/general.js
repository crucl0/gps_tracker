'use strict';

var map, google;
var point;
var chosen;
var settings_flag;
var current_res;
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
  var stations = getFromMongo('/stations');
  for (var k=0; k<stations.length; k++) {
    points.push(stations[k]);
  }
  if (points.length === 0) {
    navigator.geolocation.getCurrentPosition(function(position) {
      var pos = new google.maps.LatLng(position.coords.latitude,
                                       position.coords.longitude);
      map.setCenter(pos);
    });
  } else {
  for (var i=0; i<points.length; i++) {
    var tmpLatLng = new google.maps.LatLng(points[i].lat, points[i].lng);
    var info = fillWhatExists('/points', points[i]);
        
    var point = new Marker(addMarker(tmpLatLng), addInfoWindow(info));
    point.marker.setTitle(points[i].title);

    point.id = points[i]._id;
    point.description = points[i].description;
    point.title = points[i].title;
    point.fromDB = true;
    if (points[i].hasOwnProperty('company')) {
      point.marker.setIcon('http://maps.google.com/mapfiles/ms/icons/blue-dot.png');
    }
    markersPool.push(point);
    map.setCenter(point.marker.getPosition());
  }
  }
}


function addNew(resource) {
  current_res = resource;
  if (checkInPool(point, 'current', true) || (checkInPool(point, 'manual', true)) || (checkInPool(point, 'stations', true))) {
    clearInterval(intervalID);
    point.close();
    markersPool.splice(markersPool.indexOf(point), 1);
    point = null;
  }
  chosen = false;
  map.setOptions({draggableCursor:'crosshair'});

  if (resource === '/stations') {
    document.getElementById('select_div').style.display = 'block';
    var sel = document.getElementById('select_form');

    if (sel.length === 0) {
      var companies_list = getFromMongo('/companies');
      var zero_opt = document.createElement('option');
      zero_opt.innerHTML = 'Choose the company';
      zero_opt.value = -1;
      sel.appendChild(zero_opt);
      for (var i=0;i<companies_list.length;i++) {
        var opt = document.createElement('option');
        opt.innerHTML = companies_list[i].title;
        opt.value = companies_list[i]._id;
        sel.appendChild(opt);
      }
    }
  } else {
    document.getElementById('select_div').style.display = 'none';
  }

  google.maps.event.addListener(map, 'click', function(event) {
    if (!chosen) {
      var pos = event.latLng;
  
      point = new Marker(addMarker(pos), addInfoWindow(fillNewForm(pos)));
      point.infowindow.open(map, point.marker);
      point.marker.setDraggable(true);
      point.fromDB = false;
      point.manual = true;
      document.getElementById('pButton').onclick = function() {
        postToMongo(current_res);
      };

      if (current_res === '/stations') {
        point.stations = true;
        point.marker.setIcon('http://maps.google.com/mapfiles/ms/icons/blue-dot.png');
      }
      map.setOptions({draggableCursor: null});
      chosen = true;
      markersPool.push(point);

      google.maps.event.addListener(point.infowindow, 'closeclick', function() {
        point.marker.setVisible(false);
        map.setOptions({draggableCursor: null});
        document.getElementById('select_div').style.display = 'none';
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
          document.getElementById('select_div').style.display = 'none';
        });
      });
    }
  });
}

function editPoint(resource, id) {
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
  editForm.childNodes[1].description.value = editMarker.description;

  editMarker.infowindow = addInfoWindow(editForm);
  editMarker.infowindow.open(map, editMarker.marker);

  editMarker.marker.setDraggable(true);

  document.getElementById('pButton').onclick = function() {
    editMarker.title = document.getElementById('title').value;
    editMarker.description = document.getElementById('description').value;
    editMarker.close();
       
    var response = putIntoMongo(resource, editMarker);
    var info = fillWhatExists('/points/', response);
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
  document.getElementById('select_div').style.display = 'none';
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
// START of the block with commands to Settings

function settings() {
  if (!settings_flag) {
    var sel = document.getElementById('companies_list');
    if (sel.length === 0) {
      settings_flag = true;
      document.getElementById('map_canvas').style.display = 'none';
      document.getElementById('settings_panel').style.display = 'block';

      var companies_list = getFromMongo('/companies');
      var zero_opt = document.createElement('option');
      zero_opt.innerHTML = 'Choose the company';
      zero_opt.value = -1;
      sel.appendChild(zero_opt);
      for (var i=0;i<companies_list.length;i++) {
        var opt = document.createElement('option');
        opt.innerHTML = companies_list[i].title;
        opt.value = companies_list[i]._id;
        sel.appendChild(opt);
      }
    } else {
      settings_flag = true;
      document.getElementById('map_canvas').style.display = 'none';
      document.getElementById('settings_panel').style.display = 'block';
    }

  } else {
    settings_flag = false;
    document.getElementById('map_canvas').style.display = 'block';
    document.getElementById('settings_panel').style.display = 'none';
  }
}

function showCompany(id) {
  var company = getFromMongo('/companies/'+id);
  var div_company = fillWhatExists('/companies/', company);
  // div_company.style.minWidth = '450px';
  div_company.style.minHeight = '200px';
  
  var list_div = document.getElementById('companies_container');  
  var old = list_div.childNodes[0];
  list_div.replaceChild(div_company, old);
  document.getElementById('editPen').parentNode.removeChild(document.getElementById('editPen'));
  document.getElementById('date').parentNode.removeChild(document.getElementById('date'));
  document.getElementById('header').style.marginBottom = '10px';

  var stations_of_company = [];
  var stations = getFromMongo('/stations');
  for (var i=0;i<stations.length;i++) {
    if (stations[i].company == company.title) {
      stations_of_company.push(stations[i]);
    }
  }

  var stations_list = document.createElement('div');
  for (var i=0; i<stations_of_company.length; i++) {
    var div_station = fillWhatExists('/stations/', stations_of_company[i]);
    div_station.childNodes[0].removeChild(div_station.childNodes[0].childNodes[1]);
    div_station.style.border = '1px dotted #80B280';
    div_station.style.borderRadius = '3px';
    div_station.style.padding = '10px';
    div_station.style.minWidth = '300px';
    stations_list.appendChild(div_station);

  }
  var stations_div_ = document.getElementById('stations');
  var old_list = stations_div_.childNodes[1];
  stations_div_.replaceChild(stations_list, old_list);
}

// END of the block with commands to Settings
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


function fillWhatExists(resource, source) {

  var div_fromDB = document.createElement('div');
     div_fromDB.id = 'fromDB';
     div_fromDB.style.minHeight = '150px';
  //
     var div_header = document.createElement('div');
        div_header.id = 'header';

        var span_header_text = document.createElement('span');
           span_header_text.id = 'title'+'~'+source._id;
           span_header_text.ondblclick = function(){
              transform(resource, this, source._id);
           };
           span_header_text.style.marginRight = '10px';
           span_header_text.appendChild( document.createTextNode(source.title) );
        div_header.appendChild( span_header_text );

        var span_editPen = document.createElement('span');
           span_editPen.onclick = function(){
              editPoint(resource, source._id);
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
              transform(resource, this, source._id);
            };
        div_date.appendChild( span_time );

     div_fromDB.appendChild( div_date );
  //
     var div_infoBody = document.createElement('div');
        div_infoBody.id = 'description'+'~'+source.description;
        div_infoBody.textContent = source.description;
        div_infoBody.ondblclick = function(){
              transform(resource, this, source._id);
           };
        div_infoBody.style.marginBottom = '10px';
     div_fromDB.appendChild( div_infoBody );
  //
     var div_dButton = document.createElement('div');
        div_dButton.id = 'dButton';

        var span_del = document.createElement('span');
          span_del.id = 'delete';
           span_del.onclick = function(){
            if (source.hasOwnProperty('company')){
              deleteFromMongo('/stations/', source._id);
            } else {
              deleteFromMongo('/points/', source._id);
            }
           };
           span_del.className = 'delButton';
           span_del.title = 'Delete this object';
           span_del.textContent = '✂';
        div_dButton.appendChild( span_del );
  //
     div_fromDB.appendChild( div_dButton );

   return div_fromDB;
}


function transform (resource, elem, id) {
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
      patchIntoMongo(resource+id, dataToPatch);

    } else {
      old.textContent = input.value;
      input.parentNode.replaceChild(old, input);

      var dataToPatch = {};
      dataToPatch[elem.id.split('~')[0]] = input.value;
      dataToPatch['date'] = new Date();
      patchIntoMongo(resource+id, dataToPatch);
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
    if (url == '/stations'){
      var selForm = document.getElementById('select_form');
      data.company = selForm.options[selForm.selectedIndex].text;
    }

    var request = new XMLHttpRequest();

    request.open('POST', url, false);
    request.setRequestHeader('Content-type', 'application/json');
    request.send(JSON.stringify(data));

    var response = JSON.parse(request.responseText);
    var pos = new google.maps.LatLng(response.lat, response.lng);
    var info = fillWhatExists(url, response);

    if (checkInPool(point, 'current', true) || (checkInPool(point, 'manual', true))){
      point.close();
      markersPool.splice(markersPool.indexOf(point), 1);
      point = null;
    }
    point = new Marker(addMarker(pos), addInfoWindow(info));
    point.marker.setTitle = response.title;
    point.infowindow.open(map, point.marker);
    point.id = response._id;
    point.description = response.description;
    point.gas_station = response.title;
    if (current_res === '/stations') {
        point.stations = true;
        point.marker.setIcon('http://maps.google.com/mapfiles/ms/icons/blue-dot.png');
      }
    markersPool.push(point);
    return point;
}


function deleteFromMongo(resource, id) {
  var request = null;
  var pointToDelete = {'id': id};
  var url = resource + id;
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


function putIntoMongo(resource, editMarker){
  var request = null;
  var now = new Date();
  var pointToEdit = {
    _id: editMarker.id,
    lat: editMarker.marker.getPosition().lat(),
    lng: editMarker.marker.getPosition().lng(),
    title: editMarker.title,
    description: editMarker.description,
    date: now
  };

  var url = resource + editMarker.id;
  request = new XMLHttpRequest();
  request.open('PUT', url, false);
  request.setRequestHeader('Content-type', 'application/json');
  request.send(JSON.stringify(pointToEdit));

  var response = JSON.parse(request.responseText);
  return response;
}


function patchIntoMongo(id, dataToPatch){
  var request = null;
  var url = id;
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
