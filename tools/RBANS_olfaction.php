<?php 
require_once "generic_includes.php";
require_once "PEAR.php";

$config =& NDB_Config::singleton();
$DB =& Database::singleton();

$candidates = $DB->pselect("SELECT sessionID from RBANS join flag using (commentid) where Data_entry='Complete' and RBANS.commentid not like 'DDE%'",array());
foreach ($candidates as $candidate) {
       
          $candid =  $candidate['sessionID'];
             $visits = $DB->pselect("SELECT pscid,visit_label from smell_identification join flag using (commentid) join session on (flag.sessionid=session.id) join candidate using (candid) where (Data_entry!='Complete' or Data_entry is null) and smell_identification.commentid not like 'DDE%' and sessionID = :cid",array('cid'=>$candid));
foreach ($visits as $visit) {
echo $visit["pscid"] . " " . $visit["visit_label"] . "\n";
}
}
/*$vis = array();
 foreach ($visits as $visit) {
array_push($vis,$visit['Visit_label']);
 }
 foreach ($visits as $visit) {
     if ($visit['Visit_label'] == 'NAPBL00'||$visit['Visit_label'] == 'PREBL00')
                if ((in_array('NAPFU12',$vis)) && (!in_array('NAPLP00',$vis)) && ((in_array('NAPBL00',$vis)) || (in_array('PREBL00',$vis)))) {
			$pscid = $DB->pselectOne("SELECT PSCID from candidate where CandID=:cid",array('cid'=>$candid));
                   print $pscid . " - " . $visit['Date_visit'] . " - " .  $visit['Visit_label'] . "\n";
                }
 }
}

*/


?>
