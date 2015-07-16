/**
 * scripts.js
 *
 * Computer Science 50
 * Problem Set 8
 *
 * Global JavaScript.
 */

var globCoords = ["-24.20", "134.35", "4000km"];
var globPlace = "Australia";
var globState = "";

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

    var postcode = place.POA_CODE_2011;
    console.log(place); 
    globPlace = place.Suburb;
    globState = place.State;
	getNews(place);

	//Send the postcode data to the database
	var parameter = {
		postcode: postcode,
	};


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



            //clear the canvas
            document.getElementById('drawCanvas').innerHTML="";

            //grab the SA2 information
            $.getJSON("ABSerp.php", {SA2: SA2code}).done(function(data){
                absHTML(data, "sa2Content", "sa2");
            });
            
            //grab the SA3 information
            $.getJSON("ABSerp.php", {SA3: SA3code}).done(function(data){
                absHTML(data, "sa3Content", "sa3");
            });

            //grab the LPI information
            $.getJSON('ABSlabour.php', {STATE: stateCode}).done(function(data){
                absHTML(data, "lpiContent", "lpi");
            });

            //grab the Socio Economic Score
            //first build the two parameters
            var rwapParam = {
                measure: "RWAP",
                postcode: postcode,
            };

            var scoreParam = {
                measure: "SCORE",
                postcode: postcode,
            };

            //grab the sefia Rank (Australian Percentile)
            $.getJSON("ABSseifa.php", rwapParam).done(function(data){
                absHTML(data, "seifaRankContent", "rwap");
            });

            //grab the sefia score
            $.getJSON("ABSseifa.php", scoreParam).done(function(data){
                absHTML(data, "seifaScoreContent", "seifaScore");
            });


        }

	});


}

function absHTML(data, contentName, nameOfClass) {

    var value;
    var content = document.createElement(contentName);
    var html = "";
    var title;

    content.className = nameOfClass;


    //set value if it isn't broken

    try
    {
        var parseValue = data.series[0].observations[0].Value;
        value = parseInt( parseValue ).toLocaleString();
    }
    catch (e)
    {
        value = "Not Available";
        console.log(data);
    }
    

    //build the html titles for drawCanavas
    switch (contentName)
    {
        case "sa2Content":
            title = "SA2 Population";
            break;
        case "sa3Content":
            title = "SA3 Population";
            break;
        case "lpiContent":
            title = "Labour Price Index";
            break;
        case "seifaRankContent":
            title = "Australian Socio Economic Percentile";
            break;
        case "seifaScoreContent":
            title = "Australian Socio Economic Score";
            break;
    }

    html += "<table><tr><td>";
    html += title;
    html += ":&nbsp</td><td>";
    html +=value;
    html += "</td></tr></table>";

    content.innerHTML = html;

    document.getElementById('drawCanvas').appendChild(content);
}

function getNews(place){
    var html = "";
	var contentString = "<div id='info'>";
	//query articles and create the label
	$.getJSON("articles.php", {geo: place.Suburb}).always(function(data, textStatus, jqXHR) {


		for (var i = 0; i < 10; i++) {
			//this builds the links to the different articles, it took a long time to work out

			if (typeof(data[i]) === "undefined") {
				// http://www.ajaxload.info/
				contentString = contentString.concat("<img alt='loading' src='img/ajax-loader.gif'/>");
				break;
			} else {
				contentString = contentString.concat("<a href=" + data[i].link + ">" + data[i].title + "</a><br>");
			}

			// end div
			//contentString = contentString.concat("<a href=" + data[i].link + ">" + data[i].title + "</a><br>");
		}
		contentString += "</div>";
		html += contentString;
	}
	document.getElementById('news').innerHTML = html;
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
		
		//set glob coords to feed other scripts
		globCoords = [latitude, longitude, "100km"];

		// set map's center
		map.setCenter({
			lat: latitude,
			lng: longitude,
		});

		map.setZoom(12);

		// update UI
		update();
		getData(suggestion);
        updateWeather();
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
		
	var tweetUsers = globCoords,
        place = globPlace,
		container = $('#tweet-container');

	$('#twitter-ticker').slideDown('slow');
		
	$.getJSON('twitter.php', {handles:tweetUsers, places:place}, function(response){

		// Empty the container
		container.html('');
		
		$.each(response.statuses, function(){
		
			var str = '	<div class="tweet">\
						<div class="avatar"><a href="https://twitter.com/'+this.user.screen_name+'" target="_blank"><img src="'+this.user.profile_image_url_https+'" alt="'+this.from_user+'" /></a></div>\
						<div class="user"><a href="https://twitter.com/'+this.user.screen_name+'" target="_blank">'+this.user.screen_name+'</a></div>\
						<div class="time">'+relativeTime(this.created_at)+'</div>\
						<div class="txt">'+formatTwitString(this.text)+'</div>\
						</div>';
			
			container.append(str);
		
		});
		
		// Initialize the jScrollPane plugin
		container.jScrollPane({
			mouseWheelSpeed:25
		});

	});

}

//Twitter Helper functions

function formatTwitString(str){
	str=' '+str;
	str = str.replace(/((ftp|https?):\/\/([-\w\.]+)+(:\d+)?(\/([\w/_\.]*(\?\S+)?)?)?)/gm,'<a href="$1" target="_blank">$1</a>');
	str = str.replace(/([^\w])\@([\w\-]+)/gm,'$1@<a href="https://twitter.com/$2" target="_blank">$2</a>');
	str = str.replace(/([^\w])\#([\w\-]+)/gm,'$1<a href="https://twitter.com/search?q=%23$2" target="_blank">#$2</a>');
	return str;
}

function relativeTime(pastTime){
	var origStamp = Date.parse(pastTime);
	var curDate = new Date();
	var currentStamp = curDate.getTime();
	
	var difference = parseInt((currentStamp - origStamp)/1000);

	if(difference < 0) return false;

	if(difference <= 5)				return "Just now";
	if(difference <= 20)			return "Seconds ago";
	if(difference <= 60)			return "A minute ago";
	if(difference < 3600)			return parseInt(difference/60)+" minutes ago";
	if(difference <= 1.5*3600) 		return "One hour ago";
	if(difference < 23.5*3600)		return Math.round(difference/3600)+" hours ago";
	if(difference < 1.5*24*3600)	return "One day ago";
	
	var dateArr = pastTime.split(' ');
	return dateArr[4].replace(/\:\d+$/,'')+' '+dateArr[2]+' '+dateArr[1]+(dateArr[3]!=curDate.getFullYear()?' '+dateArr[3]:'');
}	

// Docs at http://simpleweatherjs.com
function updateWeather(){
    console.log(globPlace);
    console.log(globState);
    $(document).ready(function() {
        $.simpleWeather({
            location: globPlace + ', ' + globState,
            woeid: '',
            unit: 'c',
        success: function(weather) {
            html = '<h2><i class="icon-'+weather.code+'"></i> '+weather.temp+'&deg;'+weather.units.temp+'</h2>';
            html += '<ul><li>'+weather.city+', '+weather.region+'</li>';
            html += '<li class="currently">'+weather.currently+'</li>';
            html += '<li>'+weather.wind.direction+' '+weather.wind.speed+' '+weather.units.speed+'</li></ul>';
  
            $("#weather").html(html);
        },
        error: function(error) {
            $("#weather").html('<p>'+error+'</p>');
            }
        });
    });
}
























