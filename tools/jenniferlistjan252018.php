<?php


require_once "generic_includes.php";
require_once "PEAR.php";

$config =& NDB_Config::singleton();
$DB =& Database::singleton();


$handle = fopen("jenniferlistjan252018.txt", "r");
if ($handle) {
    while (($line = fgets($handle)) !== false) {
        $c = explode(",",$line);
        if (strpos(trim($c[1]), '00') !== false)
        $c[1] = str_replace("LP","BL",trim($c[1]));
        else
        $c[1] = str_replace("LP","FU",trim($c[1]));

        $query = "SELECT session.id from session join candidate using (candid) where pscid='$c[0]' and visit_label='$c[1]'";
        $result = $DB->pselectOne($query, array());
        $total_score = "select total_scale_index_score from RBANS join flag using (commentid) where flag.sessionid=$result and commentid not like 'DDE%'";
        $result_total_score = $DB->pselectOne($total_score, array());
        $total_score_60_69 = "select total_scale_index_score_60_69 from RBANS join flag using (commentid) where flag.sessionid=$result and commentid not like 'DDE%'";
        $result_total_score_60_69 = $DB->pselectOne($total_score_60_69, array());
        echo $c[0] . "\t" . $c[1] . "\t" . $result_total_score . "\t" . $result_total_score_60_69 . "\n";
    }

    fclose($handle);
}


?>
