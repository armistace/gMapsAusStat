/**
 * scripts.js
 *
 * Computer Science 50
 * Problem Set 8
 *
 * Global JavaScript.
 */

//This sets the the coords and twitter variables for the initial
//landing page, they get changed in through the update() process
var globCoords = ["-24.20", "134.35", "1000km"];
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

    //This sets the twitter ticker at the bottom and makes it scroll
    //for more view /public/js/marquee.js
    createMarquee({
            duration: 80000,
            padding: 10,
            marquee_class: ".twitter-feed",
            container_class: ".twitter-container",
            hover: true
     });
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

    //This sets the required info for the ABS variables
    var postcode = place.POA_CODE_2011;
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
            document.getElementById('stats').innerHTML="";

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

            //This is the place to add other ABS content
        }

	});
}


/*
 * This function concers the ABS data into html
 */
function absHTML(data, contentName, nameOfClass) {

    //prepare the content to be added to the canvas
    var value;
    var content = document.createElement(contentName);
    var html = "";
    var title;

    content.className = nameOfClass;

    //set value if it isn't broken

    try
    {
        //this needs to be checked hence the try catch
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
    

    document.getElementById('stats').appendChild(content);
}

/*
 * gets the news information from google
 */
function getNews(place){

    var html = "";
	var contentString = "";
	//query articles and create the label
	$.getJSON("articles.php", {geo: place.Suburb}).always(function(data, textStatus, jqXHR) {


		for (var i = 0; i < 5; i++) {
			//this builds the links to the different articles

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

        //this adds the new content to the news div
		contentString += "";
		html += contentString;
        document.getElementById('newsContent').innerHTML = html;
	})
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
 * Updates UI
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

    //queries update.php to get the info from AusPlaces
	$.getJSON("update.php", parameters)
		.done(function(data, textStatus, jqXHR) {

			// remove old markers from map
			removeMarkers();

			// add new markers to map
			for (var i = 0; i < 1; i++) {
				addMarker(data[i]);
			}

		})
		.fail(function(jqXHR, textStatus, errorThrown) {

			// log error to browser's console
			console.log(errorThrown.toString());
		});

    //this grabs some global variables and gets them ready to be fed to twitter.php
    //it also set container to be the tweets div which updated using jQuery
    var tweetUsers = globCoords,
        place = globPlace,
        container = $("#tweets");


    //grab the info from the twitter api using twitter.php
	$.getJSON('twitter.php', {handles:tweetUsers, places:place}, function(response){

		// Empty the tweet container
		container.html('');
		
        //build the <li> tags based on the data grabbed from the twitter api
        $.each(response.statuses, function(){
		
		var str ="<li>"+this.user.screen_name+": "+this.text+"</li>";
			
		container.append(str);
        });
        
        
    }); 
    
           
}

/*
 * This js comes straight from simplweatherjs.com
 * Big thanks to the author!
 */
// Docs at http://simpleweatherjs.com
function updateWeather(){
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

/*
 * This js comes from http://tutorialzine.com/2009/10/jquery-twitter-ticker/
 * big thanks to Martin Angelov!
 */
function formatTwitString(str){
        str=' '+str;
        str = str.replace(/((ftp|https?):\/\/([-\w\.]+)+(:\d+)?(\/([\w/_\.]*(\?\S+)?)?)?)/gm,'<a href="$1" target="_blank">$1</a>');
        str = str.replace(/([^\w])\@([\w\-]+)/gm,'$1@<a href="http://twitter.com/$2" target="_blank">$2</a>');
        str = str.replace(/([^\w])\#([\w\-]+)/gm,'$1<a href="http://twitter.com/search?q=%23$2" target="_blank">#$2</a>');
        return str;
    }


