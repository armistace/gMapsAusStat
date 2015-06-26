<?php
	if($_SERVER["REQUEST_METHOD"] == "GET" && isset($_GET["SA2"]))
	{
		$sa2 = $_GET["SA2"];
		$url = "http://stat.abs.gov.au/itt/query.jsp?method=GetGenericData&datasetid=ABS_ANNUAL_ERP_ASGS&and=FREQUENCY.A,MEASURE.ERP,ASGS_2011.$sa2,REGIONTYPE.SA2&&start=2014&format=json";
		
		$JSON = file_get_contents($url);
		
		header("Content-type: application/json");
		print($JSON);
		
	}
	else if($_SERVER["REQUEST_METHOD"] == "GET" && isset($_GET["SA3"]))
	{
		$sa3 = $_GET["SA3"];
		$url = "http://stat.abs.gov.au/itt/query.jsp?method=GetGenericData&datasetid=ABS_ANNUAL_ERP_ASGS&and=FREQUENCY.A,MEASURE.ERP,ASGS_2011.$sa3,REGIONTYPE.SA3&&start=2014&format=json";
		
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
