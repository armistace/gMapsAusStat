<?php

    require(__DIR__ . "/../includes/config.php");

    //set class
    $data = new ABS;
    
    //prepare ABS class with universal variables for Labour Price Index
    $data->dataSetId = "SEIFA_POA";

    //grab the concepts
    $data->concepts=array("MEASURE", "INDEX_TYPE", "POA");
    if ($_SERVER["REQUEST_METHOD"] == "GET" && isset($_GET["measure"]) && isset($_GET["postcode"]));
    {
        //escape users input
        $postcode = urlencode($_GET["postcode"]);
        //it appears that for whatever reason the ABS doesn't like the Syndey postcodes between 1000 and 1999 so this deals with that
        if ($postcode >= 1000 && $postcode < 2000)
        {
            $postcode = 2000;
        }
        
        $data->conceptCodes=array($_GET["measure"], "IRSD", $postcode);
    }

    //build the URL
    $data->getDataURL();

    //grab JSON
    $data->loadJSON();

    //serve the JSON
    $data->serveJSON();




