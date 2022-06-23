<?php 
require_once "generic_includes.php";
require_once "PEAR.php";

$config =& NDB_Config::singleton();
$DB =& Database::singleton();


$handle = fopen("check_failures.txt", "r");
if ($handle) {
    while (($line = fgets($handle)) !== false) {
        $c = explode(",",$line);
        $c[1] = trim($c[1]);
        $query = "SELECT visit from session where candid=$c[0] and visit_label='$c[1]'";
//        echo $query;
        $result = $DB->pselectOne($query, array());
        echo $c[0] . " " . $c[1] . " " . $result . "\n";
    }

    fclose($handle);
}


?>
