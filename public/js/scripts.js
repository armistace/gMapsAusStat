/**
 * scripts.js
 *
 * Computer Science 50
 * Problem Set 8
 *
 * Global JavaScript.
 */

//SA names and values
var SA2Name;
var SA3Name;
var SA2popValue;
var SA3popValue;

//html string
var htmlContent;

// Google Map
var map;

// markers for map
var markers = [];

// info window
var info = new google.maps.InfoWindow();

// execute when the DOM is fully loaded
$(function() {

	// styles for map
	// https://developers.google.com/maps/documentation/javascript/styling
	var styles = [

		// show Google's labels
		{
			featureType: "all",
			elementType: "labels",
			stylers: [{
				visibility: "on"
			}]
		},

		// show roads
		{
			featureType: "road",
			elementType: "geometry",
			stylers: [{
				visibility: "on"
			}]
		}

	];

	// options for map
	// https://developers.google.com/maps/documentation/javascript/reference#MapOptions
	var options = {
		center: {
			lat: -24.2002,
			lng: 134.3525
		}, // Australia
		disableDefaultUI: true,
		mapTypeId: google.maps.MapTypeId.ROADMAP,
		maxZoom: 20,
		panControl: true,
		styles: styles,
		zoom: 4,
		zoomControl: true
	};

	// get DOM node in which map will be instantiated
	var canvas = $("#map-canvas").get(0);

	// instantiate map
	map = new google.maps.Map(canvas, options);

	// configure UI once Google Map is idle (i.e., loaded)
	google.maps.event.addListenerOnce(map, "idle", configure);

});

/**
 * Adds marker for place to map.
 */
function addMarker(place) {

	//prepare the coordinate
	var latLng = new google.maps.LatLng(place.latitude, place.longitude);

	//prepare the marker
	var marker1 = new google.maps.Marker({
		position: latLng,
		draggable: false,
		raiseOnDrag: true,
		map: map,
	});
	markers.push(marker1);

}

function getData(place) {

	//Send the postcode data to the database
	var parameter = {
		postcode: place.POA_CODE_2011,
	}

	//prepare the drawCanvas content
	htmlContent = "<table style= 'width:100%'>";
	htmlContent += "<tr><td><b>SA3</b></td><td><b>SA3 Population</b></td>\
        <td><b>SA2</b></td><td><b>SA2 Population</b></td></tr>";

	//this is deprecated I will need to work out a better way - it also makes things stutter
	$.ajaxSetup({
		'async': false
	});

	//go to Geo to get the SA information
	$.getJSON("ABSgeo.php", parameter).always(function(data, textStatus, jqXHR) {
		for (var i = 0; i < data.length; i++) {

			//Grab SA2 information
			var SA2URL = "http://stat.abs.gov.au/itt/query.jsp?method=GetGenericData&datasetid=ABS_CENSUS2011_B04&and=FREQUENCY.A,AGE.TT,MEASURE.3,REGION.";
			SA2URL += data[i].SA2_MAINCODE_2011;
			SA2Name = data[i].SA2_NAME_2011;
			SA2URL += "&format=json";

			//Grab SA3 Information
			var SA3URL = "http://stat.abs.gov.au/itt/query.jsp?method=GetGenericData&datasetid=ABS_CENSUS2011_B04&and=FREQUENCY.A,AGE.TT,MEASURE.3,REGION.";
			SA3URL += data[i].SA3_CODE_2011;
			SA3Name = data[i].SA3_NAME_2011;
			SA3URL += "&format=json";

			//Query for SA3
			$.getJSON(SA3URL).always(function(SA3, textStatus, jqXHR) {
				//Set the SA3 value
				SA3popValue = SA3.series[0].observations[0].Value;

				//Query for SA2
				$.getJSON(SA2URL).always(function(SA2, textStatus, jqXHR) {
					//Set the SA2 value
					SA2popValue = SA2.series[0].observations[0].Value;

					//Build the HTML for the div id=drawCanvas
					htmlContent += "<tr>";
					htmlContent += "<td>";
					htmlContent += SA3Name;
					htmlContent += "</td>";
					htmlContent += "<td>";
					htmlContent += SA3popValue;
					htmlContent += "</td>";
					htmlContent += "<td>";
					htmlContent += SA2Name;
					htmlContent += "</td>";
					htmlContent += "<td>";
					htmlContent += SA2popValue;
					htmlContent += "</td>";
					htmlContent += "</tr>";

					//Close SA2 $.getJSON    
				});

				//Close the SA3 $.getJSON    
			});

		}

		//Close the HTML Table
		htmlContent += "</table>";

		//Draw it in the DIV
		document.getElementById('drawCanvas').innerHTML = htmlContent;
	});

	//This turns async back on - I need to work out how to use something else to achieve this
	//It makes things really stuttery
	$.ajaxSetup({
		'async': true
	});


}



/**
 * Configures application.
 */
function configure() {
	// update UI after map has been dragged
	google.maps.event.addListener(map, "dragend", function() {
		update();
	});

	// update UI after zoom level changes
	google.maps.event.addListener(map, "zoom_changed", function() {
		update();
	});

	// remove markers whilst dragging
	google.maps.event.addListener(map, "dragstart", function() {
		removeMarkers();
	});

	// configure typeahead
	// https://github.com/twitter/typeahead.js/blob/master/doc/jquery_typeahead.md
	$("#q").typeahead({
		autoselect: true,
		highlight: true,
		minLength: 0
	}, {
		source: search,
		templates: {
			empty: "no places found yet",
			suggestion: _.template("<p><%- Suburb %>, <%- State  %>, <%- POA_CODE_2011 %></p>")
		}
	});

	// re-center map after place is selected from drop-down
	$("#q").on("typeahead:selected", function(eventObject, suggestion, name) {

		// ensure coordinates are numbers
		var latitude = (_.isNumber(suggestion.latitude)) ? suggestion.latitude : parseFloat(suggestion.latitude);
		var longitude = (_.isNumber(suggestion.longitude)) ? suggestion.longitude : parseFloat(suggestion.longitude);

		// set map's center
		map.setCenter({
			lat: latitude,
			lng: longitude,
		});

		map.setZoom(12);

		// update UI
		update();
		getData(suggestion);
	});

	// hide info window when text box has focus
	$("#q").focus(function(eventData) {
		hideInfo();
	});

	// re-enable ctrl- and right-clicking (and thus Inspect Element) on Google Map
	// https://chrome.google.com/webstore/detail/allow-right-click/hompjdfbfmmmgflfjdlnkohcplmboaeo?hl=en
	document.addEventListener("contextmenu", function(event) {
		event.returnValue = true;
		event.stopPropagation && event.stopPropagation();
		event.cancelBubble && event.cancelBubble();
	}, true);

	// update UI
	update();

	// give focus to text box
	$("#q").focus();
}

/**
 * Hides info window.
 */
function hideInfo() {
	info.close();
}

/**
 * Removes markers from map.
 */
function removeMarkers() {

	for (var i = 0; i < markers.length; i++) {
		markers[i].setMap(null);
	}
	markers = [];

}

/**
 * Searches database for typeahead's suggestions.
 */
function search(query, cb) {
	// get places matching query (asynchronously)
	var parameters = {
		geo: query
	};
	$.getJSON("search.php", parameters)
		.done(function(data, textStatus, jqXHR) {

			// call typeahead's callback with search results (i.e., places)
			cb(data);
		})
		.fail(function(jqXHR, textStatus, errorThrown) {

			// log error to browser's console
			console.log(errorThrown.toString());
		});
}

/**
 * Shows info window at marker with content.
 */
//This is fucking useless if you use the "MarkerWithLabel" library
function showInfo(marker, content) {
	// start div
	var div = "<div id='info'>";
	if (typeof(content) === "undefined") {
		// http://www.ajaxload.info/
		div += "<img alt='loading' src='img/ajax-loader.gif'/>";
	} else {
		div += content;
	}

	// end div
	div += "</div>";

	// set info window's content
	info.setContent(div);

	// open info window (if not already open)
	google.maps.event.addListener(marker, 'click', function() {
		info.open(map, marker);
	});
}

/**
 * Updates UI's markers.
 */
function update() {
	// get map's bounds
	var bounds = map.getBounds();
	var ne = bounds.getNorthEast();
	var sw = bounds.getSouthWest();
	// get places within bounds (asynchronously)
	var parameters = {
		ne: ne.lat() + "," + ne.lng(),
		q: $("#q").val(),
		sw: sw.lat() + "," + sw.lng()
	};
	$.getJSON("update.php", parameters)
		.done(function(data, textStatus, jqXHR) {

			// remove old markers from map
			removeMarkers();

			// add new markers to map
			for (var i = 0; i < 10; i++) {
				addMarker(data[i]);
			}

		})
		.fail(function(jqXHR, textStatus, errorThrown) {

			// log error to browser's console
			console.log(errorThrown.toString());
		});
}