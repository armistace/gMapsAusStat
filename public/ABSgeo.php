<?php
    //grab the usual config
    require(__DIR__ . "/../includes/config.php");

    if($_SERVER["REQUEST_METHOD"] == "GET" && isset($_GET["postcode"]))
    {
        //escape users input
        $postcode = urlencode($_GET["postcode"]);

        $sql = "SELECT DISTINCT SA2_MAINCODE_2011, SA2_NAME_2011 FROM SA1_Postcode WHERE POA_CODE_2011 = $postcode"; //PDO is used so this is ok

        $geographic = query($sql);

         header("Content-type: application/json");
         print(json_encode($geographic));
    }
    else
    {
        print "<form action='ABSgeo.php'>";
        print "<input type='text' name=postcode>";
        print "</form>";
    }
?>






