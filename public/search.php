<?php
	require(__DIR__."/../includes/config.php");
	
	// numerically indexed array of places
	if($_SERVER["REQUEST_METHOD"] == "GET" && isset($_GET["geo"]))
	{
	
		$places=[];
		
		$search=$_GET["geo"];
		
		
		//search=str_replace(" ", "%' OR '%", $search);
		
		$search=str_replace(", ", "%' OR '%", $search);
		
		$search=str_replace(",", "%' OR '%", $search);
		
		
		$queryString="SELECT * FROM places WHERE (country_code LIKE '$search%' OR postal_code LIKE '$search%' OR place_name LIKE '$search%' OR admin_name1 LIKE '$search%') LIMIT 30";
		
		$places=query($queryString);
		
		/*
		foreach($query as $row){
		
			print_r($row);
			print "\n";
		
			
		}
		*/
		
		// output places as JSON (pretty-printed for debugging convenience)
		
		header("Content-type: application/json");
		print(json_encode($places));
	}
	else
	{
		print "<form action='search.php'>";
		print "<input type='text' name=geo>";
		print "</form>";
	}
?>
