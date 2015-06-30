<?php
    require(__DIR__ . "/../includes/config.php");
    
    
    //set class
    $data = new ABS;

    //prepare ABS class with universal variables for ERP
    $data->dataSetId = "ABS_ANNUAL_ERP_ASGS";

    //grab the concepts
    $data->defaultConcepts();// = ("FREQUENCY", "REGIONTYPE", "MEASURE","ASGS_2011",);
    
    
    //SA2?
    if($_SERVER["REQUEST_METHOD"] == "GET" && isset($_GET["SA2"]))
    {
        //SA2 unique variables
        $data->conceptCodes=array("A","SA2", "ERP",$_GET["SA2"]);
    }

    //SA3?
	else if($_SERVER["REQUEST_METHOD"] == "GET" && isset($_GET["SA3"]))
    {
        //sa3 unique variables
        $data->conceptCodes=array("A","SA3", "ERP", $_GET["SA3"]);
    }
    
    //Build the URL
    $data->getDataURL();

    //grab the JSON
    $data->loadJSON();

    //serve the JSON
    $data->serveJSON();

