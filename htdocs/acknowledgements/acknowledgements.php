<?php

/**
 * Publicly available generator for acknowledgements or citations
 *
 * PHP Version 7.2
 *
 * @category Loris
 * @package  Behavioral
 * @author   Justin Kat <justin.kat@mail.mcgill.ca>
 * @author   Jean-Michel Raoult <jean-michel.raoult.comtl@ssss.gouv.qc.ca>
 * @license  http://www.gnu.org/licenses/gpl-3.0.txt GPLv3
 * @link     https://github.com/aces/Loris
 */

require_once __DIR__ . "/../../vendor/autoload.php";

// Initialization of the environment
$client = new NDB_Client();
$client->makeCommandLine();
$client->initialize();

//Output template using Smarty
$smarty = new Smarty_neurodb;

// Getting a reference to the Config Singleton
$config =& \NDB_Config::singleton();

// Getting a reference to the Database Singleton
$db =& \Database::singleton();

// Using the Config object, set the environment properties
$tpl_data['baseurl'] = $config->getSetting('url');
$tpl_data['css']     = $config->getSetting('css');

// Blocking condition on the parameters, their numbers and their names
if( count($_GET) > 2
    || (count($_GET) == 2 && array_diff(array_keys($_GET), ["date", "authors"]))
    || (count($_GET) == 1 && array_diff(array_keys($_GET), ["date"]))){
    // Assigning error message
    $tpl_data["error"] = 1;
    // Copying the GET parameter keys passed
    $tpl_data["parameters"] = array_keys($_GET);
    // Passing error message to data object
    $smarty->assign($tpl_data);
    // Rendering the error page
    $smarty->display('acknowledgements_errors.tpl');
    exit(1);
}

// Blocking condition for the date validity
if( !isset($_GET["date"])
    || strlen($_GET["date"]) != 10
    || !(bool)strtotime($_GET["date"])
    || date("Y-m-d", strtotime($_GET["date"])) != $_GET["date"]){
    // Assigning error message
    $tpl_data["error"] = 2;
    // Passing error message to data object
    $smarty->assign($tpl_data);
    // Rendering the error page
    $smarty->display('acknowledgements_errors.tpl');
    exit(2);
}

// Blocking condition for values being passed to the flag parameter authors
if ( isset($_GET["authors"]) && ($_GET["authors"] !== "on" && !empty($_GET["authors"]))){
    // Assigning error message
    $tpl_data["error"] = 3;
    // Passing error message to data object
    $smarty->assign($tpl_data);
    // Rendering the error page
    $smarty->display('acknowledgements_errors.tpl');
    exit(3);
}

// Assignation of the verified request parameters
$publication_date = $_GET["date"];
$publication_date_name = "publication_date";
$authorship = isset($_GET["authors"]);

// Definition of the columns for the Smarty Template
$columns = array(
                    "FullName"        => 'Full Name',
                    "CitationName"    => 'Citation Name',
                    "Affiliations"    => 'Affiliations',
                    "Degrees"         => 'Degrees',
                    "Titles"          => 'Titles',
                    "Roles"           => 'Roles');

// Extracting and re-indexing the Affiliation data from the DB
$affiliations = reIndex("AffiliationID", getAffiliationDisplayData(   $AffiliationID = true,
                                                                                $Name = true,
                                                                                $City = true,
                                                                                $StateName = true,
                                                                                $StateCode = true,
                                                                                $CountryName = true,
                                                                                $CountryCode = true,
                                                                                $Levels = true));

// Extracting and re-indexing the Roles data from the DB
$roles = reIndex("RoleID", getRoleDisplayData(    $RoleID = true,
                                                            $Name = true,
                                                            $Ordering = true));
// Extracting and re-indexing the Degree data from the DB
$degrees = reIndex("DegreeID", getDegreeDisplayData(      $DegreeID = true,
                                                                    $CycleID = true,
                                                                    $Name = true,
                                                                    $Abbreviation = true,
                                                                    $CycleName = true,
                                                                    $Level = true));

// Extracting and re-indexing the Professional Title data from the DB
$titles = reIndex("ProfessionalTitleID", getTitleDisplayData(     $ProfessionalTitleID = true,
                                                                            $Name = true,
                                                                            $Abbreviation = true));

// Define the main query for the current contributors
$queryCurrentContributors = createMainQueryString(  $publication_date_name,
                                                    $non_temporary = true,
                                                    $days = 90,
                                                    $authorship,
                                                    $presence = true);

// Define the main query for the past contributors
$queryPastContributors = createMainQueryString(     $publication_date_name,
                                                    $non_temporary = true,
                                                    $days = 90,
                                                    $authorship,
                                                    $presence = false);

// Run the query as a prepared statement
$currentSQLResults = $db->pselect(  $queryCurrentContributors,
                                    [$publication_date_name => $publication_date]);

// Run the query as a prepared statement
$pastSQLResults = $db->pselect( $queryPastContributors,
                                [$publication_date_name => $publication_date]);

// Process the concat columns to an exploitable form for Smarty
$currentContributors = processConcatColumns($currentSQLResults);
// Process the concat columns to an exploitable form for Smarty
$pastContributors = processConcatColumns($pastSQLResults);


// Pass the gathered values to the data array for Smarty
$tpl_data['authorship'] = $authorship;
$tpl_data["date"] = $publication_date;
$tpl_data['columns'] = $columns;
$tpl_data['currentContributors'] = $currentContributors;
$tpl_data['pastContributors'] = $pastContributors;
$tpl_data['affiliations'] = $affiliations;
$tpl_data['roles'] = $roles;
$tpl_data['degrees'] = $degrees;
$tpl_data['titles'] = $titles;

// Rendering the data based on the request method

// If the request uses GET
if($_SERVER["REQUEST_METHOD"] === "GET"){
    // Assign data object to Smarty instance
    $smarty->assign($tpl_data);
    // Render the page using Smarty
    $smarty->display('acknowledgements.tpl');
    // If the request uses POST and the XML keyword
}elseif($_SERVER["REQUEST_METHOD"] === "POST" && isset($_POST["XML"])){
    // Create the DOMDocument instance
    $XML = new DOMDocument();
    // Set the encoding to unicode 8
    $XML->encoding = "UTF-8";
    // Set the XML version
    $XML->xmlVersion = "1.0";
    // Set this parameter to produce proper indentation
    $XML->formatOutput = true;

    // Create an encompassing element for all contributors
    $Contributors = $XML->createElement("Contributors");
    // Append the element to the DOMDocument
    $XML->appendChild($Contributors);

    // Create an encompassing element for all current contributors
    $Current = $XML->createElement("CurrentContributors");
    // Create an encompassing element for all past contributors
    $Past = $XML->createElement("PastContributors");

    // Parsing the processed results to an XML structure for past and current contributors
    contributorXMLProcessing($currentContributors, $Current);
    contributorXMLProcessing($pastContributors, $Past);

    // Appending the parsed results to the encompassing element
    $Contributors->appendChild($Current);
    $Contributors->appendChild($Past);

    // Setting the content type of the header
    header("Content-Type: text/xml");
    // Setting the disposition and choosing the filename to account for the authorship property
    header('Content-Disposition: attachment; filename=' . ($authorship ? "Authors.xml" : "Acknowledgements.xml"));
    // Sending the filesize to prevent overruns
    header("Content-Length: " . strlen($XML->saveXML()));

    // Outputting the XML
    echo($XML->saveXML());
    //If the request uses POST and the TSV keyword
}elseif($_SERVER["REQUEST_METHOD"] === "POST" && isset($_POST["TSV"])){

    // Define the headers' array
    $headers = array();

    // For each column defined, which preserves the order
    foreach($columns as $column){
        // Add the column to the headers' array
        $headers[] = $column;
    }

    // Adding a supplemental column to reflect the active status of each contributor
    $headers[] = "Status";

    // Create a streaming object in memory with writing capabilities
    $outputBuffer = fopen('php://memory', 'w+');

    // Put the columns into the buffer with tab separation
    fputcsv($outputBuffer, $headers, $separator="\t");

    // Process both current and past contributors
    contributorTSVProcessing($currentContributors, $outputBuffer, $separator, $active=true);
    contributorTSVProcessing($pastContributors, $outputBuffer, $separator, $active=false);

    // Return to the start of the buffer
    rewind($outputBuffer);

    // Get the content of the buffer as a string
    $outputString = stream_get_contents($outputBuffer);

    // Close the buffer
    fclose($outputBuffer);

    // Set header to allow for the download of the TSV file
    header("Content-Type: text/plain");
    // Account for the type of list in the filename
    header('Content-Disposition: attachment; filename=' . ($authorship ? "Authors.tsv" : "Acknowledgements.tsv"));
    // Account for the length of the file
    header("Content-Length: " . strlen($outputString));

    // Output file
    echo($outputString);
}else{
    echo("This page doesn't support either this method or these parameters.");
}
// Terminating the script
exit();

/**
 * Creates the main query to list the users to include in the acknowledgements page
 *
 * Creates the main query string by using a standard request and applying the modifiers
 * passed as parameters.
 *
 * @param string  $publication_date_name        name of the publication date variable
 * @param boolean $non_temporary                adding a requirement that only persons with more than a specified
 *                                              amount of time are considered
 * @param int     $days                         minimum number of days to be considered
 * @param boolean $authorship                   whether to display everyone within the specified range or
 *                                              only persons with the author boolean
 * @param boolean $presence                     only include persons currently at the center
 *
 * @return string
 * @access public
 * @note Should be refactored using the HEREDOC multi-line string approach as soon as the PHP version
 *       is equal or superior to 7.3. Using the concat assignment operator like this tends to produce
 *       maintenance issues with spacing.
 */
function createMainQueryString( string $publication_date_name = "publication_date",
                                bool $non_temporary = true,
                                int $days = 90,
                                bool $authorship = true,
                                bool $presence = true) : string {
    $query  = "SELECT ";
    $query .= " person.PersonID AS \"Person ID\", ";
    $query .= " person.FullName AS \"Full Name\", ";
    $query .= " person.CitationName AS \"Citation Name\", ";
    $query .= " person.Authorship AS \"Authorship\", ";
    $query .= " person.StartDate AS \"Center Start Date\", ";
    $query .= " person.EndDate AS \"Center End Date\", ";
    $query .= " GROUP_CONCAT(DISTINCT affiliation.AffiliationID) AS \"Affiliation IDs\", ";
    $query .= " GROUP_CONCAT(DISTINCT affiliation.Levels) AS \"Affiliation Levels\", ";
    $query .= " GROUP_CONCAT(DISTINCT role.RoleID ORDER BY role.Ordering, role.Name) as \"Role IDs\", ";
    $query .= " GROUP_CONCAT(DISTINCT title.ProfessionalTitleID ORDER BY title.Abbreviation) as \"Title IDs\", ";
    $query .= " GROUP_CONCAT(DISTINCT degree.DegreeID ORDER BY degree.Level ASC, degree.Abbreviation ASC) as \"Degree IDs\", ";
    $query .= " MIN(role.Ordering) AS \"Importance\" ";
    $query .= "FROM acknowledgements_person person ";
    $query .= "LEFT JOIN ( ";
    $query .= "             SELECT ";
    $query .= "                     apar.PersonID AS PersonID, ";
    $query .= "                     apar.AffiliationID AS AffiliationID, ";
    $query .= "                     apar.StartDate AS StartDate, ";
    $query .= "                     apar.EndDate AS EndDate, ";
    $query .= "                     aa.Name AS Name, ";
    $query .= "                     aa.City AS City, ";
    $query .= "                     aa.StateName AS StateName, ";
    $query .= "                     aa.StateCode AS StateCode, ";
    $query .= "                     aa.CountryName AS CountryName, ";
    $query .= "                     aa.CountryCode AS CountryCode, ";
    $query .= "                     aa.Levels AS Levels ";
    $query .= "             FROM acknowledgements_person_affiliation_rel apar ";
    $query .= "             INNER JOIN acknowledgements_affiliation aa ON (apar.AffiliationID = aa.AffiliationID) ";
    $query .= "         ) affiliation ON (person.PersonID = affiliation.PersonID) ";
    $query .= "LEFT JOIN ( ";
    $query .= "             SELECT ";
    $query .= "                     aprr.PersonID AS PersonID, ";
    $query .= "                     aprr.RoleID AS RoleID, ";
    $query .= "                     aprr.StartDate AS StartDate, ";
    $query .= "                     aprr.EndDate AS EndDate, ";
    $query .= "                     ar.Name AS Name, ";
    $query .= "                     ar.Ordering AS Ordering";
    $query .= "             FROM acknowledgements_person_role_rel aprr ";
    $query .= "             INNER JOIN acknowledgements_role ar ON (aprr.RoleID = ar.RoleID) ";
    $query .= "             WHERE   (aprr.StartDate IS NULL AND aprr.EndDate IS NULL) ";
    $query .= "                     OR (aprr.EndDate IS NULL AND aprr.StartDate <= :$publication_date_name) ";
    $query .= "                     OR (:$publication_date_name BETWEEN aprr.StartDate AND aprr.EndDate) ";
    $query .= "         ) role ON (person.PersonID = role.PersonID) ";
    $query .= "LEFT JOIN ( ";
    $query .= "             SELECT ";
    $query .= "                     apptr.PersonID AS PersonID, ";
    $query .= "                     apptr.ProfessionalTitleID AS ProfessionalTitleID, ";
    $query .= "                     apt.Name AS Name, ";
    $query .= "                     apt.Abbreviation AS Abbreviation ";
    $query .= "             FROM acknowledgements_person_professional_title_rel apptr ";
    $query .= "             INNER JOIN acknowledgements_professional_title apt ON (apptr.ProfessionalTitleID = apt.ProfessionalTitleID) ";
    $query .= "         ) title ON (person.PersonID = title.PersonID) ";
    $query .= "LEFT JOIN ( ";
    $query .= "             SELECT ";
    $query .= "                     apdr.PersonID AS PersonID, ";
    $query .= "                     apdr.DegreeID AS DegreeID, ";
    $query .= "                     apdr.DateObtained AS DateObtained, ";
    $query .= "                     ad.Name AS Name, ";
    $query .= "                     ad.Abbreviation AS Abbreviation, ";
    $query .= "                     ac.Level AS Level ";
    $query .= "             FROM acknowledgements_person_degree_rel apdr ";
    $query .= "             INNER JOIN acknowledgements_degree ad ON (ad.DegreeID = apdr.DegreeID) ";
    $query .= "             INNER JOIN acknowledgements_cycle ac ON (ad.CycleID = ac.CycleID) ";
    $query .= "         ) degree ON (person.PersonID = degree.PersonID) ";
    $query .= "WHERE person.StartDate <= :$publication_date_name ";
    $query .= $non_temporary ? " AND (person.EndDate IS NULL OR DATEDIFF(person.EndDate, person.StartDate) > $days) " : " ";
    $query .= $authorship ? " AND person.Authorship <> \"0\" " : " ";
    $query .= $presence ? " AND (person.EndDate IS NULL OR (:$publication_date_name BETWEEN person.StartDate AND person.EndDate)) " : " AND (person.EndDate IS NOT NULL AND NOT (:$publication_date_name BETWEEN person.StartDate AND person.EndDate)) ";
    $query .= "GROUP BY person.PersonID ";
    $query .= "ORDER BY Importance, person.CitationName;";

    return $query;

}

/**
 * Returns an associative array for the display values necessary for the affiliation property.
 *
 * Specifies the columns to be extracted from the affiliation table and returns an associative array with
 * the database's data for that table. The default values allow for the "Everything but that" selection which
 * can be problematic in SQL.
 *
 * @param   boolean   $AffiliationID    Include the AffiliationID primary key column
 * @param   boolean   $Name             Include the Name (i.e. McGill University) column
 * @param   boolean   $City             Include the City (i.e. Montreal) column
 * @param   boolean   $StateName        Include the StateName (i.e. Quebec) column
 * @param   boolean   $StateCode        Include the StateCode (i.e. QC) column
 * @param   boolean   $CountryName      Include the CountryName (i.e. Canada)column
 * @param   boolean   $CountryCode      Include the CountryCode (i.e. CA) column
 * @param   boolean   $Levels           Include the Levels (i.e. 1/16/17) column
 *
 * @return array
 * @access public
 * @note To refactor when PHP version 8 or more to use the named argument feature and simplify the invocation of the
 *       function.
 */
function getAffiliationDisplayData(
                                    bool $AffiliationID = true,
                                    bool $Name = true,
                                    bool $City = true,
                                    bool $StateName = true,
                                    bool $StateCode = true,
                                    bool $CountryName = true,
                                    bool $CountryCode = true,
                                    bool $Levels = true): array{

    // Getting link to the global handle for the database singleton
    global $db;

    // Using the compact function to create an associative array keyed on the parameter names to the values provided
    $columns = compact( "AffiliationID",
                        "Name",
                        "City",
                        "StateName",
                        "StateCode",
                        "CountryName",
                        "CountryCode",
                        "Levels");

    // Remove the unneeded columns
    $columns = formatColumns(array(), $columns);

    // If all columns were removed, escaping the function by returning an empty array
    if(count($columns) == 0){
        return array();
    }

    $query = "SELECT ";
    // Appending a list of the needed columns using the array's keys
	$query = $query.implode(" , " ,array_keys($columns));
    $query .= " FROM acknowledgements_affiliation; ";

    // Returning the data from the DB using a prepared statement
    return $db->pselect($query, array());

}

/**
 * Returns an associative array for the display values necessary for the roles property.
 *
 * Specifies the columns to be extracted from the role table and returns an associative array with
 * the database's data for that table. The default values allow for the "Everything but that" selection which
 * can be problematic in SQL.
 *
 * @param   boolean   $RoleID   Include the RoleID primary key column
 * @param   boolean   $Name     Include the Name (i.e. Data Entry) column
 *
 * @return array
 * @access public
 * @note To refactor when PHP version 8 or more to use the named argument feature and simplify the invocation of the
 *       function.
 */
function getRoleDisplayData(
    bool $RoleID = true,
    bool $Name = true,
    bool $Ordering = true): array{

    // Getting link to the global handle for the database singleton
    global $db;

    // Using the compact function to create an associative array keyed on the parameter names to the values provided
    $columns = compact( "RoleID",
                        "Name",
                        "Ordering");

    // Remove the unneeded columns
    $columns = formatColumns(array(), $columns);

    // If all columns were removed, escaping the function by returning an empty array
    if(count($columns) == 0){
        return array();
    }

    $query = "SELECT ";
    // Appending a list of the needed columns using the array's keys
    $query = $query.implode(" , " ,array_keys($columns));
    $query .= " FROM acknowledgements_role; ";

    // Returning the data from the DB using a prepared statement
    return $db->pselect($query, array());

}

/**
 * Returns an associative array for the display values necessary for the degrees property.
 *
 * Specifies the columns to be extracted from the degree and cycle tables and returns an associative array with
 * the database's data from those tables. The default values allow for the "Everything but that" selection which
 * can be problematic in SQL.
 *
 * @param   boolean   $DegreeID     Includes the DegreeID primary key column
 * @param   boolean   $CycleID      Includes the CycleID foreign key column
 * @param   boolean   $Name         Includes the Name of the degree (i.e. Philosohpy Doctorate)
 * @param   boolean   $Abbreviation Includes the abbreviation of the degree (i.e. BSc)
 * @param   boolean   $CycleName    Includes the name of the degree's cycle (i.e. Undergraduate)
 * @param   boolean   $Level        Includes the level of the degree, the doctorate being 1 and the other level
 *                                  being identified in decreasing order of years of study (PhD(1), Ms(2), undergrad(3),
 *                                  etc.)
 *
 * @return array
 * @access public
 * @note To refactor when PHP version 8 or more to use the named argument feature and simplify the invocation of the
 *       function.
 */
function getDegreeDisplayData(
    bool $DegreeID = true,
    bool $CycleID = true,
    bool $Name = true,
    bool $Abbreviation = true,
    bool $CycleName = true,
    bool $Level = true): array{

    // Getting link to the global handle for the database singleton
    global $db;

    // Using the compact function to create an associative array keyed on the parameter names to the values provided
    $columns = compact( "DegreeID",
                        "CycleID",
                        "Name",
                        "Abbreviation",
                        "CycleName",
                        "Level");

    // Enumerate the ambiguous columns and their new values
    $ambiguousColumns = [   "DegreeID"      => "d.DegreeID",
                            "CycleID"       => "d.CycleID",
                            "Name"          => "d.Name AS Degree_Name",
                            "Abbreviation"  => "d.Abbreviation",
                            "CycleName"     => "c.Name AS Cycle_Name",
                            "Level"         => "c.Level"];

    // Removes the unneeded columns and renames the ambiguous ones
    $columns = formatColumns($ambiguousColumns, $columns);

    // If all columns were removed, escaping the function by returning an empty array
    if(count($columns) == 0){
        return array();
    }

    $query = "SELECT ";
    // Appending a list of the needed columns using the array's keys
    $query = $query.implode(" , " ,array_keys($columns));
    $query .= " FROM acknowledgements_degree d ";
    $query .= " INNER JOIN acknowledgements_cycle c ON (c.CycleID = d.CycleID)";

    // Returning the data from the DB using a prepared statement
    return $db->pselect($query, array());

}

/**
 * Returns an associative array for the display values necessary for the title property.
 *
 * Specifies the columns to be extracted from the title table and returns an associative array with
 * the database's data from that table. The default values allow for the "Everything but that" selection which
 * can be problematic in SQL.
 *
 * @param   boolean   $ProfessionalTitleID      Includes the TitleID primary key column
 * @param   boolean   $Name                     Includes the Name column (i.e. Registered Nurse)
 * @param   boolean   $Abbreviation             Includes the abbreviation of the title (i.e. RN)
 *
 * @return array
 * @access public
 * @note To refactor when PHP version 8 or more to use the named argument feature and simplify the invocation of the
 *       function.
 */
function getTitleDisplayData(
    bool $ProfessionalTitleID = true,
    bool $Name = true,
    bool $Abbreviation = true): array{

    // Getting link to the global handle for the database singleton
    global $db;

    // Using the compact function to create an associative array keyed on the parameter names to the values provided
    $columns = compact( "ProfessionalTitleID",
                        "Name",
                        "Abbreviation");

    // Removes the unneeded columns
    $columns = formatColumns(array(), $columns);

    // If all columns were removed, escaping the function by returning an empty array
    if(count($columns) == 0){
        return array();
    }

    $query = "SELECT ";
    // Appending a list of the needed columns using the array's keys
    $query = $query.implode(" , " ,array_keys($columns));
    $query .= " FROM acknowledgements_professional_title; ";

    // Returning the data from the DB using a prepared statement
    return $db->pselect($query, array());

}

/**
 * Returns an associative array re-indexed using the parameter specified.
 *
 * Re-Indexes an SQL results array according to the key specified. This re-indexing allows
 * for easier manipulations in the display views since the key is specifically significant instead of the
 * default row number provided by the SQL query.
 *
 * @param   string  $primaryKey The string value of the name of the column to be used as a primary key
 * @param   array   $rawResults Raw results from the DB
 *
 * @return array
 * @access public
 */
function reIndex(string $primaryKey, array $rawResults): array{

    // Blocking condition for an empty results array
    if(count($rawResults) == 0){
        return array();
    }

    // Boolean for the presence of the specified primary key in each record
    $pk_presence = true;

    // Checking that the specified primary key is defined for all entries of the results array
    foreach($rawResults as $rawResult){
        if(!$rawResult[$primaryKey]){
            $pk_presence = false;
        }
    }

    // Escaping if an entry didn't have the primary key wanted
    if(!$pk_presence){
        return array();
    }

    // Buffer array
    $results = array();

    // For each row of the results
    foreach($rawResults as $rawResult){
        // Define the key as the primary key specified
        $key = $rawResult[$primaryKey];
        // For all columns of that row
        foreach(array_keys($rawResult) as $column){
            // If the column is not the primary key
            if($column !== $primaryKey){
                // Add the result to the buffer array under the new primary key
                $results[$key][$column] = $rawResult[$column];
            }
        }
    }

    // Return the buffer array
    return $results;
}

/**
 * Returns an associative array re-formatted to account for ambiguous field naming in the SQL query
 * if the variable name is repeated or there are more than one table accessed.
 *
 * Re-names the specified columns, if present, to a name which avoid ambiguousness in the SQL query. The renaming
 * supports both the pre-pending of a table alias and the modification of the field name with a appending of AS
 *
 * @param   array   $ambiguousColumns Assoc array of the keys to be renamed and their new values
 * @param   array   $columns          Assoc array of the keys for the request and the boolean value for their inclusion
 *
 * @return array
 * @access public
 */
function formatColumns(array $ambiguousColumns, array $columns): array{

    // Getting an array of all the columns which should be removed
    $columnsKeys = array_keys($columns, false, false);

    // Removing the unneeded columns from the associative array
    foreach( $columnsKeys  as $key){
        unset($columns[$key]);
    }

    // Updating the names of the ambiguous columns to the specified names
    foreach (array_keys($ambiguousColumns) as $key){
        if(isset($columns[$key])){
            $columns[$ambiguousColumns[$key]] = true;
            unset($columns[$key]);
        }
    }

    // Returning the final columns
    return $columns;
}

/**
 * Returns an associative array with the concatenated column expanded to a proper array.
 *
 * Explode the specified column on the given separator to produce an array compatible with Smarty for
 * display.
 *
 * @param   array   $results        Assoc array of the results of an SQL query
 *
 * @return array
 * @access public
 */
function processConcatColumns(
                                array $results):array{
    // For each person
    foreach($results as &$result) {
        // Explode the SQL concat groups into arrays of values
        $result["Role IDs"] = empty($result["Role IDs"]) ? array() : explode(",", $result["Role IDs"]);
        $result["Degree IDs"] = empty($result["Degree IDs"]) ? array() : explode(",", $result["Degree IDs"]);
        $result["Title IDs"] = empty($result["Title IDs"]) ? array() : explode(",", $result["Title IDs"]);

        // For the affiliations, the exploded array must go through an additional parsing to enable hierarchical display
        $affiliation_levels = empty($result["Affiliation Levels"]) ? array() : explode(",", $result["Affiliation Levels"]);
        // Process the array for hierarchical display
        $result["Affiliation IDs"] = processingAffiliationsToArray($affiliation_levels);
    }
    // Return the processed results
    return $results;
}

/**
 * Parser using recursion to produce a hierarchical array compatible with Smarty display
 * based on the path, levels, provided.
 *
 * @param   array   $output     hierarchical array containing the representation of the path
 * @param   array   $levels     array containing the path as a sequence of integer
 *
 * @return void
 */
function recursivePathParser(array &$output, array $levels){
    // If the output doesn't have a value for the level at that level
    if(!isset($output[$levels[0]])){
        // Assign the value
        $output[$levels[0]] = array();
        // If the path extends further
        if(count($levels) > 1){
            // Position on the defined element as the new root and use the leftover path as the path
            recursivePathParser($output[$levels[0]], array_slice($levels, 1));
        }
    // The value exists so we must go down one level
    }else {
        if (!empty(array_slice($levels, 1))){
            recursivePathParser(
                $output[$levels[0]],
                array_slice($levels, 1));
        }
    }
}

/**
 * Wrapper for the recursive function which explodes the individuals paths and call the function on them.
 *
 * @param   array   $affiliation_levels array of strings representing the individual paths of the affiliations of a person
 *
 * @return array    array which contains a hierarchical representation of the paths provided
 */
function processingAffiliationsToArray(array $affiliation_levels):array{
    // Create buffer array
    $output = array();
    // For each path
    foreach($affiliation_levels as $level){
        // Explode path into array
        $level_array = explode("/", $level);
        // Call recursive parse on path and output buffer
        recursivePathParser($output, $level_array);
    }
    // Return the buffer array
    return $output;
}

/**
 * This recursive function can be called on a node of the affiliations' array for a
 * participant and will append the affiliation if it's a leaf or recurse if there
 * are children.
 *
 * @param $root                 DOMElement      Element to which the current node will
 *                                              append its calculated node
 * @param $affiliationID        int             Identifier for the affiliation
 * @param $childAffiliations    Array           Array of the child affiliations
 *
 * @return void
 */
function affiliationRecursiveNodeWalker(DOMElement &$root, int $affiliationID, array $childAffiliations){
    // Global variable attached to the DOMDocument element used
    global $XML;
    // Array containing the affiliations information indexed by identifier
    global $affiliations;

    // Creating the affiliation node
    $AffiliationNode = $XML->createElement("Affiliation");

    // Creating the name node and its text value
    $AffiliationNameNode = $XML->createElement("Name");
    $AffiliationNameValue = $XML->createTextNode($affiliations[$affiliationID]["Name"]);
    // Appending the value to the name node
    $AffiliationNameNode->appendChild($AffiliationNameValue);

    // Creating the city node and its text value
    $AffiliationCityNode = $XML->createElement("City");
    $AffiliationCityValue = $XML->createTextNode($affiliations[$affiliationID]["City"]);
    // Appending the value to the city node
    $AffiliationCityNode->appendChild($AffiliationCityValue);

    // Creating the state node
    $AffiliationStateNode = $XML->createElement("State");

    // Creating the state child node name and its value
    $AffiliationStateNameNode = $XML->createElement("Name");
    $AffiliationStateNameValue = $XML->createTextNode($affiliations[$affiliationID]["StateName"]);
    // Appending the value to the child node
    $AffiliationStateNameNode->appendChild($AffiliationStateNameValue);

    // Creating the state child node abbreviation and its value
    $AffiliationStateCodeNode = $XML->createElement("Abbreviation");
    $AffiliationStateCodeValue = $XML->createTextNode($affiliations[$affiliationID]["StateCode"]);
    // Appending the value to the child node
    $AffiliationStateCodeNode->appendChild($AffiliationStateCodeValue);

    // Appending both child nodes to the state node
    $AffiliationStateNode->appendChild($AffiliationStateNameNode);
    $AffiliationStateNode->appendChild($AffiliationStateCodeNode);

    // Creating the country node
    $AffiliationCountryNode = $XML->createElement("Country");

    // Creating the country child node name and its value
    $AffiliationCountryNameNode = $XML->createElement("Name");
    $AffiliationCountryNameValue = $XML->createTextNode($affiliations[$affiliationID]["CountryName"]);
    // Appending its value to the child node
    $AffiliationCountryNameNode->appendChild($AffiliationCountryNameValue);

    // Creating the country child node abbreviation and its value
    $AffiliationCountryCodeNode = $XML->createElement("Abbreviation");
    $AffiliationCountryCodeValue = $XML->createTextNode($affiliations[$affiliationID]["CountryCode"]);
    // Appending its value to the child node
    $AffiliationCountryCodeNode->appendChild($AffiliationCountryCodeValue);

    // Appending both child nodes to the country node
    $AffiliationCountryNode->appendChild($AffiliationCountryNameNode);
    $AffiliationCountryNode->appendChild($AffiliationCountryCodeNode);

    // Appending the properties nodes to the Affiliation node
    $AffiliationNode->appendChild($AffiliationNameNode);
    $AffiliationNode->appendChild($AffiliationCityNode);
    $AffiliationNode->appendChild($AffiliationStateNode);
    $AffiliationNode->appendChild($AffiliationCountryNode);

    // Appending the Affiliation node to the provided root node
    $root->appendChild($AffiliationNode);

    // if the array of child affiliations is not empty
    if(!empty($childAffiliations)){
        // for each child affiliation
        foreach($childAffiliations as $grandChildID => $grandChildAffiliations){
            // call the recursive function with the affiliation node as a root and the grandchild ID and affiliations
            affiliationRecursiveNodeWalker($AffiliationNode, $grandChildID, $grandChildAffiliations);
        }
    }
}

/**
 * Function which takes an array of contributor results, create an XML structure representing each result
 * and appends said structure to the provided DOMElement to be used as an encompassing group.
 *
 * @param   array           $contributors   Array containing the processed SQL results for a group of contributors
 * @param   DOMElement      $group          DOMElement to which the calculated XML nodes must be appended
 *
 * @return void
 */
function contributorXMLProcessing(array $contributors, DOMElement &$group){
    // DOMDocument object used for XML operations
    global $XML;
    // Arrays used to retrieve data based on identifiers
    global $degrees;
    global $roles;
    global $titles;
    // For all current contributors
    foreach($contributors as $contributor){
        // Create the root element of the contributor
        $root = $XML->createElement("Contributor");

        // Create the name node
        $NameNode = $XML->createElement("Name");

        // Create a child node of the name node for the full name and its value
        $FullNameNode = $XML->createElement("FullName");
        $FullNameValue = $XML->createTextNode($contributor["Full Name"]);
        // Append its value to the child node
        $FullNameNode->appendChild($FullNameValue);

        // Create a child node of the name node for the citation name and its value
        $CitationNameNode = $XML->createElement("CitationName");
        $CitationNameValue = $XML->createTextNode($contributor["Citation Name"]);
        // Append its value to the child node
        $CitationNameNode->appendChild($CitationNameValue);

        // Append both child nodes to the name node
        $NameNode->appendChild($FullNameNode);
        $NameNode->appendChild($CitationNameNode);

        // Create the degrees node
        $DegreesNode = $XML->createElement("Degrees");

        // For each degree ID associated with the contributor
        foreach($contributor["Degree IDs"] as $degreeID){

            // Create the degree node
            $degreeNode = $XML->createElement("Degree");

            // Create a child node of the degree node for the name and its value
            $DegreeNameNode = $XML->createElement("Name");
            $DegreeNameValue = $XML->createTextNode($degrees[$degreeID]["Degree_Name"]);
            // Append its value to the child node
            $DegreeNameNode->appendChild($DegreeNameValue);

            // Create a child node of the degree node for the abbreviation and its value
            $DegreeAbbreviationNode = $XML->createElement("Abbreviation");
            $DegreeAbbreviationValue = $XML->createTextNode($degrees[$degreeID]["Abbreviation"]);
            // Append its value to the child node
            $DegreeAbbreviationNode->appendChild($DegreeAbbreviationValue);

            // Append both child nodes to the degree node
            $degreeNode->appendChild($DegreeNameNode);
            $degreeNode->appendChild($DegreeAbbreviationNode);

            // Append the degree node to the degrees node
            $DegreesNode->appendChild($degreeNode);
        }

        // Create the roles node
        $RolesNode = $XML->createElement("Roles");

        // For each role associated with the contributor
        foreach($contributor["Role IDs"] as $roleID){
            // Create a role node
            $roleNode = $XML->createElement("Role");

            // Create a child node of the role node for the name and its value
            $RoleNameNode = $XML->createElement("Name");
            $RoleNameValue = $XML->createTextNode($roles[$roleID]["Name"]);
            // Append its value to the child node
            $RoleNameNode->appendChild($RoleNameValue);

            // Append the child node to the role node
            $roleNode->appendChild($RoleNameNode);

            // Append the role node to the roles node
            $RolesNode->appendChild($roleNode);
        }

        // Create the titles node
        $TitlesNode = $XML->createElement("Titles");

        // For each title associated with the contributor
        foreach($contributor["Title IDs"] as $titleID){
            // Create the title node
            $titleNode = $XML->createElement("Title");

            // Create the child node of the title node for the name and its value
            $TitleNameNode = $XML->createElement("Name");
            $TitleNameValue = $XML->createTextNode($titles[$titleID]["Name"]);
            // Append its value to the child node
            $TitleNameNode->appendChild($TitleNameValue);

            // Append the child node to the title node
            $titleNode->appendChild($TitleNameNode);

            // Append the title node the titles node
            $TitlesNode->appendChild($titleNode);
        }

        // Create the affiliations node
        $AffiliationsNode = $XML->createElement("Affiliations");

        // For each affiliation of the contributor
        foreach($contributor["Affiliation IDs"] as $affiliationID => $childAffiliations){
            // Use the recursive function to add the affiliations respecting the hierarchy
            affiliationRecursiveNodeWalker($AffiliationsNode, $affiliationID, $childAffiliations);
        }

        // Appending the name node to the contributor node
        $root->appendChild($NameNode);
        // Appending the degrees node to the contributor node
        $root->appendChild($DegreesNode);
        // Appending the roles node to the contributor
        $root->appendChild($RolesNode);
        // Appending the titles node to the contributor
        $root->appendChild($TitlesNode);
        // Appending the affiliations node to the contributor
        $root->appendChild($AffiliationsNode);

        // Appending the contributor node to the group node
        $group->appendChild($root);
    }
}

/**
 * Function which takes the layered Affiliation array of a contributor and uses recursion to returns a flattened
 * version for use with the TSV file format.
 *
 * @param   array   $ContributorAffiliations    Output array containing the affiliations as strings
 * @param   int     $affiliationID              Affiliation ID of the current affiliation
 * @param   array   $childAffiliations          Array of the child affiliations of the current affiliation
 *
 * @return void
 */
function affiliationRecursiveTSVWalker(array &$ContributorAffiliations, int $affiliationID, array $childAffiliations){
    // Array containing the affiliations information indexed by identifier
    global $affiliations;

    // Array containing the affiliation information to make the affiliation string
    $contributorData = array(   $affiliations[$affiliationID]["Name"],
                                $affiliations[$affiliationID]["City"],
                                $affiliations[$affiliationID]["StateCode"],
                                $affiliations[$affiliationID]["CountryCode"]);

    // Adding the affiliation string to the output array
    $ContributorAffiliations[] = implode(", ", $contributorData);

    // if the array of child affiliations is not empty
    if(!empty($childAffiliations)){
        // for each child affiliation
        foreach($childAffiliations as $grandChildID => $grandChildAffiliations){
            // call the recursive function with the same output array to flatten the affiliations
            affiliationRecursiveTSVWalker($ContributorAffiliations, $grandChildID, $grandChildAffiliations);
        }
    }
}

/**
 * Function which outputs individual TSV entries for each contributor of the group passed.
 *
 * @param   array       $contributorGroup   Array containing all the contributors to be processed
 * @param               $outputBuffer       Reference to the output buffer to which the TSV entries should be written
 *                                          The lack of type hinting is due to the problem with hinting at a resource or
 *                                          stream type in this version of PHP
 * @param   string      $separator          Separator used for the TSV entries
 * @param   boolean     $active             Boolean to identify whether the contributors processed are active or not
 *
 * @return void
 */
function contributorTSVProcessing(array $contributorGroup, &$outputBuffer, string $separator, bool $active){
    // Defining the global arrays used to get the values linked to the ids
    global $degrees;
    global $titles;
    global $roles;

    // For each contributor of the group
    foreach($contributorGroup as $contributor){
        // Define an empty array for the contributor's data
        $ContributorData = array();

        // Add the name and citation name to the contributor's data array
        $ContributorData["Full Name"] = $contributor["Full Name"];
        $ContributorData["Citation Name"] = $contributor["Citation Name"];

        // Define an empty array for the contributor's affiliations
        $ContributorAffiliations = array();

        // For each affiliation of the contributor
        foreach($contributor["Affiliation IDs"] as $affiliationID => $childAffiliations){
            // Use the recursive walker function to add a flatten version of the affiliations to the contributor's
            // affiliations' array
            affiliationRecursiveTSVWalker($ContributorAffiliations, $affiliationID, $childAffiliations);
        }

        // Compress the flattened affiliations' array to a string and assign to the contributor's
        // data array
        $ContributorData["Affiliations"] = implode(" | ", $ContributorAffiliations);

        // Define an empty array for the contributor's degrees
        $ContributorDegrees = array();

        // For each degree
        foreach($contributor["Degree IDs"] as $degreeID){
            // Assign the degree's abbreviation to the degrees' array
            $ContributorDegrees[] = $degrees[$degreeID]["Abbreviation"];
        }

        // Compress the degrees array to a string and assign to the contributor's data array
        $ContributorData["Degrees"] = implode(", ", $ContributorDegrees);

        // Define an empty array for the contributor's titles
        $ContributorTitles = array();

        // For each title
        foreach($contributor["Title IDs"] as $titleID){
            // Assign the title's abbreviation to the titles' array
            $ContributorTitles[] = $titles[$titleID]["Abbreviation"];
        }

        // Compress the titles array to a string and assign to the contributor's data array
        $ContributorData["Titles"] = implode(", ", $ContributorTitles);

        // Define an empty array for the contributor's roles
        $ContributorRoles = array();

        // For each role
        foreach($contributor["Role IDs"] as $roleID){
            // Assign the role's name to the roles' array
            $ContributorRoles[] = $roles[$roleID]["Name"];
        }

        // Compress the roles array to a string and assign to the contributor's data array
        $ContributorData["Roles"] = implode(", ", $ContributorRoles);

        // Set the value for the active column to the state passed as a parameter
        $ContributorData["Active"] = $active ? "Active" : "Inactive";

        // Output to the contributor's data array to the specified buffer using the specified separator
        fputcsv($outputBuffer, $ContributorData, $separator);
    }
}
?>
