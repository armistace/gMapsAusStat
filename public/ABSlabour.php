<?php

    require(__DIR__ . "/../includes/config.php");

    //set class
    $data = new ABS;
    
    //prepare ABS class with universal variables for Labour Price Index
    $data->dataSetId = "LABOUR_PRICE_INDEX";

    //grab the concepts
    $data->concepts=array("REGION", "SECTOR", "MEASURE");
    if ($_SERVER["REQUEST_METHOD"] == "GET" && isset($_GET["STATE"]));
    {
        $data->conceptCodes=array($_GET["STATE"], "7", "1");
    }

    //build the URL
    $data->getDataURL();

    //grab JSON
    $data->loadJSON();

    //serve the JSON
    $data->serveJSON();




