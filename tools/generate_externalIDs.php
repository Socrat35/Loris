<?php 
require_once "generic_includes.php";
require_once "PEAR.php";

$config =& NDB_Config::singleton();
$db =& Database::singleton();
if(Utility::isErrorX($db)) {
        fwrite(STDERR, "Could not connect to database: ".$db->getMessage());
        return false;
}

$candids = $db->pselect("SELECT CandID FROM candidate");
foreach ($candids as $value) {
	do {
		$extstring = "PAD" . rand(1,9) . rand(0,9) . rand(0,9) . rand(0,9);
	} while ($db->pselectOne("SELECT count(ExternalID) FROM candidate WHERE ExternalID=:EID", array('EID'=>$extstring)) > 0);
		$updateData = array("ExternalID" => $extstring);
		$where = array("candid" => $value['CandID']);
//uncomment to update
//		$success = $db->update("candidate", $updateData, $where);
				if (Utility::isErrorX($success)) {
					fwrite(STDERR, "Failed to update candidate table, DB Error: " . $success->getMessage()."\n");
				} else {
					echo "Update successful for candidate: " . $value['CandID'] . " with extID: " . $extstring . "\n";
				}
}

