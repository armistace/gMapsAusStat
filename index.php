<?php
/* 
 *  * Redirect to a different page in the current directory that was requested 
 *   */
$host  = $_SERVER['HTTP_HOST'];
$uri  = rtrim(dirname($_SERVER['PHP_SELF']), '/\\');
$extra = 'public/';  // change accordingly

header("Location: http://$host$uri/$extra");
die();
exit;
