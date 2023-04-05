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
if ( isset($_GET["authors"]) && !empty($_GET["authors"])){
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
                                                            $Name = true));
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

// Define the main query for the list of person to be included
$mainQuery = createMainQueryString( $publication_date_name,
                                    $non_temporary = true,
                                    $days = 90,
                                    $authorship);

// Run the query as a prepared statement
$SQLResults = $db->pselect( $mainQuery,
                            [$publication_date_name => $publication_date]);

// Process the concat columns to an exploitable form for Smarty
$results = processConcatColumns($SQLResults);


// Pass the gathered values to the data array for Smarty
$tpl_data['authorship'] = $authorship;
$tpl_data["date"] = $publication_date;
$tpl_data['columns'] = $columns;
$tpl_data['results'] = $results;
$tpl_data['affiliations'] = $affiliations;
$tpl_data['roles'] = $roles;
$tpl_data['degrees'] = $degrees;
$tpl_data['titles'] = $titles;

// Assign data object to Smarty instance
$smarty->assign($tpl_data);
// Render the page using Smarty
$smarty->display('acknowledgements2.tpl');

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
                                bool $authorship = true) : string {
    $query  = "SELECT ";
    $query .= " person.PersonID AS \"Person ID\", ";
    $query .= " person.FullName AS \"Full Name\", ";
    $query .= " person.CitationName AS \"Citation Name\", ";
    $query .= " person.Authorship AS \"Authorship\", ";
    $query .= " person.StartDate AS \"Center Start Date\", ";
    $query .= " person.EndDate AS \"Center End Date\", ";
    $query .= " GROUP_CONCAT(DISTINCT affiliation.AffiliationID) AS \"Affiliation IDs\", ";
    $query .= " GROUP_CONCAT(DISTINCT affiliation.Levels) AS \"Affiliation Levels\", ";
    $query .= " GROUP_CONCAT(DISTINCT role.RoleID ORDER BY role.Name) as \"Role IDs\", ";
    $query .= " GROUP_CONCAT(DISTINCT title.ProfessionalTitleID ORDER BY title.Abbreviation) as \"Title IDs\", ";
    $query .= " GROUP_CONCAT(DISTINCT degree.DegreeID ORDER BY degree.Level ASC, degree.Abbreviation ASC) as \"Degree IDs\" ";
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
    $query .= "                     ar.Name AS Name ";
    $query .= "             FROM acknowledgements_person_role_rel aprr ";
    $query .= "             INNER JOIN acknowledgements_role ar ON (aprr.RoleID = ar.RoleID) ";
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
    $query .= "GROUP BY person.PersonID ";
    $query .= "ORDER BY person.CitationName;";

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
    bool $Name = true): array{

    // Getting link to the global handle for the database singleton
    global $db;

    // Using the compact function to create an associative array keyed on the parameter names to the values provided
    $columns = compact( "RoleID",
                        "Name");

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
        recursivePathParser($output[$levels[0]], array_slice($levels, 1));
    }
}

/**
 * Wrapper for the recursive function which explodes the individuals paths and call the function on them.
 *
 * @param   array   $affiliation_levels array of strings representing the individual paths of the affiliations of a person
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
?>
