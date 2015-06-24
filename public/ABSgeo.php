<?php
    //grab the usual config
    require(__DIR__ . "/../includes/config.php");

    if($_SERVER["REQUEST_METHOD"] == "GET" && isset($_GET["postcode"]))
    {
        //escape users input
        $postcode = urlencode($_GET["postcode"]);
        
        ///it appears that for whatever reason the ABS doesn't like the Syndey postcodes between 1000 and 1999 so this deals with that
        if ($postcode >= 1000 && $postcode < 2000)
        {
            $postcode = 2000;
        }
        
        //PDO is used so this is ok
        $sql = "SELECT DISTINCT SA3_CODE_2011, SA3_NAME_2011, SA2_MAINCODE_2011, SA2_NAME_2011 FROM SA1_Postcode WHERE POA_CODE_2011 = $postcode"; 

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






