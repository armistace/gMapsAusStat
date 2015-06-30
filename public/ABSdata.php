<?php
    require(__DIR__ . "/../includes/config.php");

	if($_SERVER["REQUEST_METHOD"] == "GET" && isset($_GET["SA2"]))
    {
        //use ABS class to set values
        $data= new ABS;
        $data->dataSetId = "ABS_ANNUAL_ERP_ASGS";
        $data->concepts=array("FREQUENCY","MEASURE","ASGS_2011","REGIONTYPE");
        $data->conceptCodes=array("A","ERP",$_GET["SA2"],"SA2");

        //Build the URL
        $data->getDataURL();

        //grab the JSON
        $data->loadJSON();

        //serve the JSON
        $data->serveJSON();
		
	}
	else if($_SERVER["REQUEST_METHOD"] == "GET" && isset($_GET["SA3"]))
    {
        //use ABS class to set values
        $data= new ABS;
        $data->dataSetId = "ABS_ANNUAL_ERP_ASGS";
        $data->concepts=array("FREQUENCY","MEASURE","ASGS_2011","REGIONTYPE");
        $data->conceptCodes=array("A","ERP",$_GET["SA3"],"SA3");

        //Build the URL
        $data->getDataURL();

        //grab the JSON
        $data->loadJSON();

        //serve the JSON
        $data->serveJSON();
    }
    
    
	else
    {
        print "<form action='ABSdata.php'>";
        print "<input type='text' name=SA2>";
        print "<input type='text' name = SA3>";
        print "</form>";
    }
