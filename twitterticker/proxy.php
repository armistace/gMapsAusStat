<?php

require_once ('codebird/codebird.php');

// Set a proper JSON header
header('Content-type: application/json');


/*----------------------------
	Twitter API settings
-----------------------------*/


// Consumer key
$twitter_consumer_key = 'yyx8adnruad9qvgVUg5n8dLF1';

// Consumer secret. Don't share it with anybody!
$twitter_consumer_secret = 'HavMPkTYYtNjBABcaX96iLIs4T2CYsaXXFRrlKQf111da4G0wJ';

// Access token
$twitter_access_token = '114337781-RnBzo1FG9YDt2PGIsI9iplWpAP5glvp3Cdf12rPp';

// Access token secrent. Also don't share it!
$twitter_token_secret = 'QW6nUgNZW8TsVkdS66HSsuLuNO9uxZdwstRNRKpAtubnT';

 
/*----------------------------
	Initialize codebird
-----------------------------*/


// Application settings
\Codebird\Codebird::setConsumerKey($twitter_consumer_key, $twitter_consumer_secret);

$cb = \Codebird\Codebird::getInstance();

// Your account settings
$cb->setToken($twitter_access_token, $twitter_token_secret);


/*----------------------------
	Handle the API request
-----------------------------*/


// Is the handle array passed?
if(!isset($_GET['handles']) || !is_array($_GET['handles'])){
	exit;
}

// Does a cache exist?

$cache = md5(implode($_POST['handles'])).'.cache';

if(file_exists($cache) && time() - filemtime($cache) < 1*60){
	// There is a cache file, and it is fresher than 15 minutes. Use it!

	echo file_get_contents($cache);
	exit;
}

// There is no cache file. Build it!

$twitter_names = array();

foreach($_GET['handles'] as $handle){

	$twitter_names[] = $handle;
}


$search_string = implode(',', $twitter_names);
//echo $search_string;
//
$query=$_GET['place'];

// Issue a request for the Twitter search API using the codebird library
$reply = (array) $cb->search_tweets("q=$query&geocode=$search_string");

$result = json_encode($reply);

// Create/update the cache file
file_put_contents($cache, $result);

// Print the result
echo $result;
