<?php

    require(__DIR__ . "/../includes/config.php");

    //set class
    $data = new ABS;
    
    //prepare ABS class with universal variables for Labour Price Index
    $data->dataSetID = "LABOUR_PRICE_INDEX";

    //grab the concepts
    $data->defaultConcepts(); //("FREQUENCY", "TSEST", "INDEX", "SECTOR", "MEASURE", "REGION")

    if ($_SERVER["REQUEST_METHOD"] == "GET" && isset($_GET["STATE"]));
    {
        $data->conceptCodes=array("Q", "T", "THRPIB", 7, 1, $_GET["STATE"]);
    }

    //build the URL
    $data->getDataURL();

    //grab JSON
    $data->loadJSON();

    //serve the JSON
    $data->serveJSON();




