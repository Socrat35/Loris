<?php

/**
 * Publicly available generator for acknowledgements
 *
 * PHP Version 5
 *
 * @category Loris
 * @package  Behavioral
 * @author   Justin Kat <justin.kat@mail.mcgill.ca>
 * @license  http://www.gnu.org/licenses/gpl-3.0.txt GPLv3
 * @link     https://github.com/aces/Loris
 */

require_once __DIR__ . "/../../vendor/autoload.php";

$client = new NDB_Client();
$client->makeCommandLine();
$client->initialize();

$config = NDB_Config::singleton();
$db     = Database::singleton();

$css = $config->getSetting('css');

$publication_date = str_replace("]","",str_replace("[","",$_GET["date"]));

$columns = array(
            first_name     => 'First Name',
            initials     => 'Initials',
            last_name => 'Last Name',
            affiliations  => 'Affiliations',
            degrees       => 'Degrees',
            roles         => 'Roles',
            present       => 'Present?',
           );

$keysAsString             = implode(', ', array_keys($columns));

$results = $db->pselect(
    "SELECT " . $keysAsString .
    " FROM acknowledgements
    WHERE start_date <= :publication_date
    AND (DATEDIFF(end_date,start_date) > 90 OR end_date='0000-00-00' OR end_date IS NULL)",
    array('publication_date' => $publication_date)
);

$tpl_data['baseurl'] = $config->getSetting('url');
$tpl_data['css']     = $config->getSetting('css');
$tpl_data['columns'] = $columns;
$tpl_data['results'] = $results;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    $CSVheaders = array();
    $CSVdata    = array();

    foreach ($columns as $k => $v) {
        array_push($CSVheaders, $v);
    }
    foreach ($results as $k => $v) {
        array_push($CSVdata, $v);
    }

    $toCSV['headers'] = $CSVheaders;
    $toCSV['data']    = $CSVdata;

    $CSV = Utility::arrayToCSV($toCSV);

    header("Content-Type: text/plain");
    header('Content-Disposition: attachment; filename=data.csv');
    header("Content-Length: " . strlen($CSV));
    echo $CSV;
    exit();

}

//Output template using Smarty
$smarty = new Smarty_neurodb;
$smarty->assign($tpl_data);
$smarty->display('acknowledgements.tpl');

?>
