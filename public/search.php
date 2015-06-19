<?php
    require(__DIR__ . "/../includes/config.php");	
    // numerically indexed array of places
	if($_SERVER["REQUEST_METHOD"] == "GET" && isset($_GET["geo"]))
	{
	
		$places=[];
		
		$search=$_GET["geo"];
		
		
		//search=str_replace(" ", "%' OR '%", $search);
		
		$search=str_replace(", ", "%' OR '%", $search);
		
		$search=str_replace(",", "%' OR '%", $search);
		
		
        $queryString1="Select DISTINCT PostcodeCoords.Suburb, GeoLocation.STATE_NAME_2011, GeoLocation.POA_CODE_2011 FROM PostcodeCoords, GeoLocation WHERE PostcodeCoords.POA_CODE_2011 = GeoLocation.POA_CODE_2011 AND PostcodeCoords.Suburb LIKE '$search%' LIMIT 10";
        
       // $queryString2="Select DISTINCT PostcodeCoords.Suburb, GeoLocation.STATE_NAME_2011, GeoLocation.POA_CODE_2011 FROM PostcodeCoords, GeoLocation WHERE PostcodeCoords.POA_CODE_2011 = GeoLocation.POA_CODE_2011 AND GeoLocation.STATE_NAME_2011 like '$search%' LIMIT 10";

       // $queryString3="Select DISTINCT PostcodeCoords.Suburb, GeoLocation.STATE_NAME_2011, GeoLocation.POA_CODE_2011 FROM PostcodeCoords, GeoLocation WHERE PostcodeCoords.POA_CODE_2011 = GeoLocation.POA_CODE_2011 AND GeoLocation.POA_CODE_2011 Like '$search%' LIMIT 10";


        
       // $query1=query($queryString1);

        //$query2=query($queryString2);

        //$query3=query($queryString3);
        
        //$merge1=array_merge($query1,$query2);

		$places=query($queryString1);
		
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
