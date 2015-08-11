<?php
    require(__DIR__ . "/../includes/config.php");
    $test = new ABS;
    
    $test->dataSetId = "LABOUR_PRICE_INDEX";
    $test->defaultConcepts();
    var_dump($test->concepts);
    //$test->serveJSON();
?>

