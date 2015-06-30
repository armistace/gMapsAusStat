<?php
    require(__DIR__ . "/../includes/config.php");
    $test = new ABS;
    
    $test->dataSetId = "ABS_ANNUAL_ERP_ASGS";
    $test->defaultConcepts();
    //$test->serveJSON();
?>

