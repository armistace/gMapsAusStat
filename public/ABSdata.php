<?php
	if($_SERVER["REQUEST_METHOD"] == "GET" && isset($_GET["SA2"]))
	{
		$sa2 = $_GET["SA2"];
		$url = "http://stat.abs.gov.au/itt/query.jsp?method=GetGenericData&datasetid=ABS_CENSUS2011_B04&and=FREQUENCY.A,AGE.TT,MEASURE.3,REGION.$sa2&format=json";
		
		$JSON = file_get_contents($url);
		
		header("Content-type: application/json");
		print($JSON);
		
	}
	else if($_SERVER["REQUEST_METHOD"] == "GET" && isset($_GET["SA3"]))
	{
		$sa3 = $_GET["SA3"];
		$url = "http://stat.abs.gov.au/itt/query.jsp?method=GetGenericData&datasetid=ABS_CENSUS2011_B04&and=FREQUENCY.A,AGE.TT,MEASURE.3,REGION.$sa3&format=json";
		
		$JSON = file_get_contents($url);
		
		header("Content-type: application/json");
		print($JSON);
	}
	else
    {
        print "<form action='ABSdata.php'>";
        print "<input type='text' name=SA2>";
        print "<input type='text' name = SA3>";
        print "</form>";
    }