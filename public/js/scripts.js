/**
 * scripts.js
 *
 * Computer Science 50
 * Problem Set 8
 *
 * Global JavaScript.
 */

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


	//go to Geo to get the SA information
	$.getJSON("ABSgeo.php", parameter).always(function(data, textStatus, jqXHR) {
		for (var i = 0; i < 1; i++) {

			//Grab SA2 information
			var SA2code = data[i].SA2_MAINCODE_2011;
			var SA2Name = data[i].SA2_NAME_2011;

			//Grab SA3 Information
			var SA3code = data[i].SA3_CODE_2011;
            var SA3Name = data[i].SA3_NAME_2011;
            var stateCode = data[i].STATE_CODE_2011;
            var state = data[i].STATE_NAME_2011;



            
            document.getElementById('drawCanvas').innerHTML="";
            $.getJSON("ABSerp.php", {SA2: SA2code}).done(function(data){
                    
                var sa2Content = document.createElement('sa2content');
                var sa2pop;
	    	    var sa2html = "";
                
                sa2Content.className = 'sa2';
                sa2pop = data.series[0].observations[0].Value;

                console.log(sa2pop);
	    
			    sa2html += "<table>";
                sa2html += "<tr>";
                sa2html += "<td>";
                sa2html += "SA2 Population:&nbsp ";
                sa2html += "</td>";
           	    sa2html += "<td>";
                sa2html += parseInt( sa2pop ).toLocaleString();
                sa2html += "</td>";
                sa2html += "</tr>";
                sa2html += "</table>";

                sa2Content.innerHTML = sa2html;

		        document.getElementById('drawCanvas').appendChild(sa2Content);
            })




            $.getJSON("ABSerp.php", {SA3: SA3code}).done(function(data){

                var sa3pop;
                var sa3Content = document.createElement('sa3content');
			    var sa3html = "";

                sa3Content.className = 'sa3';
                sa3pop = data.series[0].observations[0].Value;
                console.log(sa3pop);

			    sa3html += "<table>";
                sa3html += "<tr>";
                sa3html += "<td>";
                sa3html += "SA3 Population:&nbsp ";
                sa3html += "</td>";
           	    sa3html += "<td>";
                sa3html += parseInt( sa3pop ).toLocaleString();
                sa3html += "</td>";
                sa3html += "</tr>";
                sa3html += "</table>";

            
                sa3Content.innerHTML = sa3html;

		        //Draw it in the DIV
                document.getElementById('drawCanvas').appendChild(sa3Content);  
            })
        }

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

function ERP(SAcode, SAlevel) {

    if (SAlevel === 2) {
        var parameter = {
            SA2: SAcode,
        }
    }
    else {
        var parameter = {
            SA3: SAcode,
        }
    }
    return $.getJSON("ABSerp.php", parameter, function(data){
            $.value = data;
    });
    
}






















