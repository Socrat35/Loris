<?php 
require_once "generic_includes.php";
require_once "PEAR.php";

//these arent necessarily duplicates yet,
//they're just a diff
//maybe want to compare substr against themselves to verify
//also need to verify values along each row is null



$config =& NDB_Config::singleton();
$db =& Database::singleton();
if(Utility::isErrorX($db)) {
	fwrite(STDERR, "Could not connect to database: ".$db->getMessage());
	return false;
}


$total = 0;

$list_of_instruments = $db->pselect("SELECT test_name from test_names", null); 

foreach($list_of_instruments as $key=>$value) {
	foreach($value as $k=>$v) {
		$total_rows_in_instrument = $db->pselectOne("SELECT count(*) from $v", null);
		print($total_rows_in_instrument. "\n"); 
		$total += $total_rows_in_instrument;
	}
}

$flagtotal = $db->pselectOne("SELECT count(*) from flag", null);

print("\n" . 'total rows is: ' . $total . ' vs. flag total which is: ' . $flagtotal . ' therefore you have '. ($total-$flagtotal). ' outstanding rows!' . "\n");



$flagcommentids = array();
foreach(($db->pselect("SELECT commentid from flag", null)) as $r=>$d) {
	foreach($d as $e=>$s) {
		array_push($flagcommentids,$s);
	}
}
print ("\n" . "flag total is: " . count($flagcommentids). "\n");


$concatstatement = array();
$concatstatement2 = "";
$concatstatement3 = array();
$concatstatement4 = "";

$instrumentcommentids = array();
foreach($list_of_instruments as $key=>$value) {
	foreach($value as $k=>$v) {
		$individual_commentid_in_instrument = $db->pselect("SELECT commentid from $v", null);
		foreach($individual_commentid_in_instrument as $i=>$j) {
			foreach($j as $a=>$b) {
				array_push($instrumentcommentids,$b);
//				print(""."commentid ".$b. " is in ". $v ." table but not in a flag table!" . "\n");
				if(!in_array($b,$flagcommentids))
					array_push($concatstatement,$b);
				else
					array_push($concatstatement3,$b);
			}
		}
		foreach($concatstatement as $c) {
			$concatstatement2 = $concatstatement2 . " commentid='" . $c . "' or"; 
		}
		print("delete from " . $v . " where" . $concatstatement2);
		$file = "/home/justin/duplicated_commentids.txt";
		// Open the file to get existing content
		$current = file_get_contents($file);
		// Append a new person to the file
		$current .= "delete from " . $v . " where" . $concatstatement2 . "\n";
		// Write the contents back to the file
		file_put_contents($file, $current);
$concatstatement = array();
$concatstatement2 = "";
	}
}
print ("\n" . "instrument total is: " . count($instrumentcommentids). "\n");


print_r(array_diff($instrumentcommentids,$flagcommentids));
print("\n" . "outstanding rows: " . count(array_diff($instrumentcommentids,$flagcommentids)));


?>

