<?php
/**
 *
 * This file contains a class which is a wrapper around the concept
 * of a candidate in Loris.
 *
 * PHP Version 7.2
 *
 * @category Main
 * @package  Loris
 * @author   Alex Zijdenbos <zijdenbos@example.com>
 * @author   Jean-Michel Raoult <jean-michel.raoult.comtl@ssss.gouv.qc.ca>
 * @license  https://www.gnu.org/licenses/gpl-3.0.txt GPLv3
 * @link     https://www.github.com/aces/Loris-Trunk/
 */

/* Define constants used by the file */
// error codes
define('CANDIDATE_INVALID', 1);
define('PSCID_NOT_SPECIFIED', 2);
define('PSCID_NOT_UNIQUE', 3);
define('PSCID_INVALID_STRUCTURE', 4);
define('EDC_NOT_SPECIFIED', 5);

// id ranges...
define('CANDIDATE_MIN_CANDID', 100000);
define('CANDIDATE_MAX_CANDID', 999999);
define('CANDIDATE_MIN_PSCID', 1000);
define('CANDIDATE_MAX_PSCID', 9999);

/**
 *
 * Wrapper around a candidate in Loris. Mostly, it gets information
 * from the candidate table, but this class is abstract enough that
 * it could get information from other places such as parameter_candidate,
 * if relevant.
 *
 * @category Main
 * @package  Loris
 * @author   Alex Zijdenbos <zijdenbos@example.com>
 * @author   Jean-Michel Raoult <jean-michel.raoult.comtl@ssss.gouv.qc.ca>
 * @license  https://www.gnu.org/licenses/gpl-3.0.txt GPLv3
 * @link     https://www.github.com/aces/Loris-Trunk/
 */
class Candidate
{
    // Assoc array for the candidate infos
    var $candidateInfo;
    // List of the SessionIDs of the Candidate's TimePoints
    var $listOfTimePoints;

    /**
     *
     * This returns a single Candidate object for the given
     * CandID and will only ever instantiate one object in
     * the event that it's called multiple times.
     *
     * @param int $candID     A Loris CandID that matches
     *                        a candidate in the candidate table
     *
     * @return ?Candidate the Candidate object or null
     * @throws DatabaseException
     * @throws LorisException
     */
    static function &singleton(int $candID): ?Candidate
    {
        // Linking to the candidateObject in the GLOBALS super global
        $candidateList =& $GLOBALS['__candidateObjects'];
        // If the Candidate is not defined
        if (!isset($candidateList[$candID])) {
            // Create a new Candidate object
            $candidateList[$candID] = new Candidate();
            try {
                // Load the data into the object
                $candidateList[$candID]->select($candID);
            } catch (DatabaseException $e) {
                throw new DatabaseException($e);
            } catch (LorisException $e) {
                throw new LorisException($e);
            }
        }
        // Return the Candidate object
        return $candidateList[$candID];
    }

    /**
     *
     * This does the work of selecting the Candidate and its related
     * information from the database and populating it into the
     * Candidate object. Used by singleton method.
     *
     * @param int $candID The Loris CandID number
     *
     * @return void As a side-effect loads candidate into current
     *              object
     * @throws DatabaseException | LorisException
     */
    public function select(int $candID): void
    {
        // Getting handle for the factory singleton
        $factory = NDB_Factory::singleton();
        // Getting handles for the config and database singletons
        $config  = $factory->config();
        $db = $factory->database();
        // Get candidate data from database
        $row = $db->pselectRow(
            "SELECT
                    c.CenterID,
                    c.CandID,
                    c.PSCID,
                    c.DoB,
                    c.EDC,
                    c.Gender,
                    c.Entity_type,
                    p.Name AS PSC,
                    c.Ethnicity,
                    c.Active,
                    u1.Real_name AS RegisteredBy,
                    c.UserID,
                    c.ProjectID
                FROM candidate AS c
                LEFT JOIN psc AS p ON (c.CenterID = p.CenterID)
                LEFT JOIN users AS u1 ON (u1.UserID = c.RegisteredBy)
                WHERE c.CandID=:Candidate
                    AND c.Active = 'Y'", array('Candidate' => $candID));
        // If the DB response doesn't have the data for the candidate
        if (!is_array($row) || sizeof($row) == 0) {
            throw new LorisException(
                "Could not select Candidate data from the database (DCCID: $candID)",
                CANDIDATE_INVALID
            );
        }
        // Store user data in object property
        foreach ($row AS $key=>$value) {
            $this->candidateInfo[$key] = $value;
        }
        // If the Study uses project, add the project title of the candidate
        // to the infos
        if ($config->getSetting('useProjects') === 'true') {
            $this->candidateInfo['ProjectTitle'] = $this->getProjectTitle();
        }
        // Get the HeaderTable information from config
        $headerSetting = $config->getSetting('HeaderTable');
        // If header settings are defined
        if (!empty($headerSetting)) {
            // Initialize the display parameters array
            $params = array();
            // Getting the parameter_candidate of the header setting
            $parameterCandSettings = $headerSetting['parameter_candidate'];
            // If not an array, put the value in an array
            if (!is_array($parameterCandSettings)) {
                $parameterCandSettings = array($parameterCandSettings);
            }
            // For each parameter_candidate element
            foreach ($parameterCandSettings as $parameter_type) {
                // Get the parameter from the DB for the ID and CandID
                $row = $db->pselectRow(
                    "SELECT Value, pt.Description
                    FROM candidate c
                    JOIN parameter_candidate pc ON (pc.CandID=c.CandID)
                    LEFT JOIN parameter_type pt ON
                    (pc.ParameterTypeID=pt.ParameterTypeID)
                    WHERE c.CandID=:Candidate AND pt.Name=:PTName",
                    array(
                     'Candidate' => $candID,
                     'PTName'    => $parameter_type,
                    )
                );
                // If the value exits in the DB
                if (!empty($row['Value'])) {
                    // Add the value under the key description to the
                    // display parameters array
                    $params[$row['Description']] = $row['Value'];
                }
            }
            // Add the display parameters array to the candidate info of
            // the object
            $this->candidateInfo['DisplayParameters'] = $params;
        }
        // Get Time Point SessionIDs for the $CandID
        $row = $db->pselect(
            "SELECT
                s.ID
            FROM session as s
            WHERE s.CandID=:Candidate
              AND s.Active='Y'
            ORDER BY ID", array("Candidate"=>$candID));

        // Store the SessionIDs in the timepoint list array of the object
        foreach ($row AS $value) {
            $this->listOfTimePoints[] = $value["ID"];
        }
    }

    /**
     *
     * Creates a new candidate, assigning CandID and PSCID
     *
     * @param int    $centerID      centerID of the site to which the candidate will
     *                              belong
     * @param string $dateOfBirth   date of birth written as YYYY-MM-DD
     * @param ?string $edc           estimated date of confinement written as YYYY-MM-DD
     * @param string $gender        gender, either 'Male' or 'Female'
     * @param ?string $PSCID        PSCID specified by the user, if available
     * @param int $ProjectID        ProjectID of the candidate with a default value if
     *                              the feature is not used
     *
     * @return int   $candID      candidate id of the new candidate
     * @throws Exception
     */
    static public function createNew(
        int $centerID,
        string $dateOfBirth,
        ?string $edc,
        string $gender,
        ?string $PSCID = null,
        int $ProjectID = 1
    ): int
    {
        // Getting handle on the factory singleton
        $factory = NDB_Factory::singleton();
        // Getting handle on the config, database, site and user singletons
        $db = $factory->database();
        $site =& Site::singleton($centerID);
        $user =& User::singleton($_SESSION['State']->getUsername());
        $config = $factory->config();
        // Generate CandID
        $candID = Candidate::_generateCandID($ProjectID);
        // Get configuration information
        $PSCIDSettings = $config->getSetting('PSCID');
        $useEDC = $config->getSetting('useEDC');
        // If the study uses EDC and the parameter is empty
        if (($useEDC === '1' || $useEDC === 'true') && empty($edc)) {
            throw new \LorisException(
                "EDC must be specified",
                EDC_NOT_SPECIFIED
            );
        }
        // If using user generation
        // Not applicable to the current project and is being deprecated
        if ($PSCIDSettings['generation'] == 'user') {
            // Check PSCID is specified
            if (empty($PSCID)) {
                throw new Exception(
                    "PSCID must be specified",
                    PSCID_NOT_SPECIFIED
                );
            }
            // Check PSCID structure
            if (!Candidate::validatePSCID($PSCID, $site->getSiteAlias())) {
                throw new LorisException(
                    "PSCID has an invalid structure",
                    PSCID_INVALID_STRUCTURE
                );
            }
            // Check PSCID uniqueness
            if ($db->pselectOne(
                "SELECT count(PSCID) FROM candidate WHERE PSCID=:PID",
                array('PID' => $PSCID)) > 0) {
                throw new Exception("PSCID not unique", PSCID_NOT_UNIQUE);
            }
            // If using anything other than user generation
        } else {
            // Generate PSCID
            $PSCID = Candidate::_generatePSCID($site->getSiteAlias());
        }
        // Generate legacy IBIS ID
        $ibisid = Candidate::_generateIBISID();
        // Define a prepared parameter array for the insertion of
        // the info to the DB
        $setArray = array(
                    'CandID'            => $candID,
                    'CenterID'          => $centerID,
                    'PSCID'             => $PSCID,
                    'DoB'               => $dateOfBirth,
                    'EDC'               => $edc,
                    'Gender'            => $gender,
                    'Date_active'       => date('Y-m-d'),
                    'Date_registered'   => date('Y-m-d'),
                    'Entity_type'       => 'Human',
                    'RegisteredBy'      => $user->getUsername(),
                    'UserID'            => $user->getUsername(),
                    'IBISID'            => $ibisid,
                    'ProjectID'         => $ProjectID
                    );
        // If the study uses external IDs
        if ($config->getSetting('useExternalID') === 'true') {
            // Generate the external ID
            $externalID = Candidate::_generateExternalID($ProjectID);
            // Add the external ID to the parameter array
            $setArray['ExternalID'] = $externalID;
        }
        // Insert the candidate in the candidate table with the
        // prepared parameters
        $db->insert('candidate', $setArray);
        // return the new candid
        return $candID;
    }

    /**
     *
     * Checks if candidate exist given a candidate ID and PSCID
     * Used to check that PSCID matches CandID when entered into the boxes
     * on the candidate_list form
     *
     * @param int    $candID LORIS Candidate identifier
     * @param string $PSCID  project study center ID
     *
     * @return bool TRUE if candidate is found (in candidate table), FALSE otherwise
     */
    static function candidateExists(int $candID, string $PSCID): bool
    {
        // Get a handle on the factory singleton
        $factory = NDB_Factory::singleton();
        // Get a handle on the database singleton
        $db = $factory->database();
        // Query the DB for a record with the provided CandID and PSCID
        $row = $db->pselectRow(
            "SELECT
                        CandID
                    FROM candidate
                    WHERE CandID = :candidate_id
                        AND PSCID = :pscid
                        AND Active = 'Y'",
            array(
                ':candidate_id' => $candID,
                ':pscid'        => $PSCID,
            )
        );
        // If the DB returned a record
        if (!empty($row)) {
            // The Candidate exists
            return true;
        }
        // The Candidate doesn't exits
        return false;
    }

    /**
     *
     * Get a list of the SessionIDs of the TimePoints that this Candidate has registered.
     *
     * @return ?array Non-associative ordered array of SessionIDs 1st Time Point
     *               indexed to 0
     */
    function getListOfTimePoints(): ?array
    {
        return $this->listOfTimePoints;
    }

    /**
     *
     * Returns the sessionID for this Candidate's nth visit
     *
     * @param int $visitNo      The visit number for which you
     *                          want the SessionID
     *
     * @return ?int     SessionID of candidate's nth visit, NULL if none found
     */
    function getSessionID(int $visitNo): ?int
    {
        // -1 because the list is zero indexed
        if (isset($this->listOfTimePoints[$visitNo-1]) ) {
            // Return the sessionID at the position specified
            return $this->listOfTimePoints[$visitNo-1];
        }
        // Return null if the visit doesn't exist
        return null;
    }

    /**
     *
     * Return a piece of data about this candidate.
     *
     * @param ?string $var  The key of the data about the Candidate
     *                      to be returned
     *
     * @return mixed The info requested
     */
    public function getData(?string $var = null)
    {
        // If the parameter name is null, return the complete array of properties
        if (is_null($var)) {
            return $this->candidateInfo;
            // If the parameter name exists
        } else {
            // And is set
            if (isset($this->candidateInfo[$var])) {
                // Return the specific parameter value
                return $this->candidateInfo[$var];
            }
            // Return null is the name exists but is not set
            return null;
        }
    }

    /**
     *
     * Sets some data about the candidate and saves it into the
     * database
     *
     * @param mixed $var    The variable to be set or an assoc of the
     *                      variable key and values
     * @param mixed  $value The value to be set or null if the first
     *                      parameter is an array
     *
     * @return true on success
     */
    public function setData($var, $value=null): bool
    {
        // If the var is not an array
        if (!is_array($var)) {
            // make an assoc with the var and value
            $setData = array($var => $value);
        } else {
            // Assign the array as the prepared parameters
            $setData = $var;
        }
        // Overwrite, when specified, the current data with the specified values
        $this->candidateInfo = array_merge($this->candidateInfo, $setData);
        // Handle on the factory singleton
        $factory = NDB_Factory::singleton();
        // Handle on the db singleton
        $db = $factory->database();
        // Updating all parameters for the CandID of the current Candidate object
        $db->update(
            'candidate',
            $setData,
            array('CandID' => $this->getData('CandID'))
        );
        return true;
    }

    /**
     *
     * Returns the ProjectID for the current candidate.
     *
     * @return int ProjectID of the candidate
     */
    function getProjectID(): int
    {
        return $this->candidateInfo["ProjectID"];
    }

    /**
     *
     * Returns the name of the candidate's project from the
     * config file.
     *
     * @return string Project name
     */
    function getProjectTitle(): string
    {
        return Utility::getProjectList()[$this->getProjectID()];
    }

    /**
     *
     * Returns the CandID of this candidate.
     *
     * @return int Candidate identification number
     */
    function getCandID(): int
    {
        return $this->candidateInfo["CandID"];
    }

    /**
     *
     * Returns the PSCID of this candidate.
     *
     * @return string The PSCID identifier for candidate
     */
    function getPSCID(): string
    {
        return $this->candidateInfo["PSCID"];
    }

    /**
     *
     * Returns the site of this candidate.
     *
     * @return string Name of the Study Center of the Candidate
     */
    function getCandidateSite(): string
    {
        return $this->candidateInfo["PSC"];
    }

    /**
     *
     * Returns the ID of this candidate's site.
     *
     * @return int The numeric ID of the candidate's site
     */
    function getCenterID(): int
    {
        return $this->candidateInfo["CenterID"];
    }

    /**
     *
     * Returns the date of birth of the candidate.
     *
     * @return string The DoB in YYYY-MM-DD format
     */
    function getCandidateDoB(): string
    {
        return $this->candidateInfo["DoB"];
    }

    /**
     *
     * Returns the expected date of confinement (due date)
     * of this candidate.
     *
     * @return string The DoB in YYYY-MM-DD format
     */
    function getCandidateEDC(): ?string
    {
        return $this->candidateInfo["EDC"];
    }

    /**
     *
     * Returns the candidate's gender.
     *
     * @return string Male|Female String describing the gender
     */
    function getCandidateGender(): string
    {
        return $this->candidateInfo["Gender"];
    }

    /**
     *
     * Returns the candidate's ethnicity.
     *
     * @return     string The ethnicity of candidate
     * @deprecated
     */
    function getCandidateEthnicity(): string
    {
        return $this->candidateInfo["Ethnicity"];
    }

    /**
     *
     * Returns whether the candidate is active or not.
     *
     * @return ?string Y|N|null Active flag for this candidate
     */
    function isActive(): ?string
    {
        return $this->candidateInfo["Active"];
    }

    /**
     *
     * Returns the user that registered (created) this candidate.
     *
     * @return string UserID of user who created this candidate.
     */
    function registeredBy(): string
    {
        return $this->candidateInfo["RegisteredBy"];
    }

    /**
     *
     * Returns the user who last changed this candidate.
     *
     * @return string UserID of the user who last changed this candidate
     */
    function lastRecordChangeBy(): string
    {
        return $this->candidateInfo["UserID"];
    }

    /**
     *
     * Returns the list of visit labels with corresponding SessionIDs as keys.
     *
     * @return array Associative array in the format SessionID=>Visit_label
     */
    public function getListOfVisitLabels(): array
    {
        // Handle on the factory singleton
        $factory = NDB_Factory::singleton();
        // Handle on the database singleton
        $db = $factory->database();
        // Initializing the visit labels array
        $visitLabelArray = array();
        // Getting the CandID of the Candidate
        $candID = $this->getCandID();
        // Getting a list of all visit labels for the TimePoints of the
        // candidate
        $result = $db->pselect(
            "SELECT
                ID,
                Visit_label
            FROM session
            WHERE CandID=:Candidate
              AND Active='Y'
            ORDER BY ID",
            array('Candidate' => $candID));
        // For each TimePoint
        foreach ($result as $row) {
            // Map the SessionID to the Visit label in the output array
            $visitLabelArray[$row["ID"]] = $row["Visit_label"];
        }
        // Return the output array
        return $visitLabelArray;
    }

    /**
     *
     * Return the next visit number for the time point you are
     * trying to register.
     *
     * @return     int Next visit number for candidate
     * @deprecated
     */
    function getNextVisitNo(): int
    {
        // Getting the CandID of the Candidate object
        $candID = $this->getCandID();
        // Handle on the factory singleton
        $factory = NDB_Factory::singleton();
        // Handle on the database singleton
        $db = $factory->database();

        $result = $db->pselectRow(
            "SELECT
                        IFNULL(max(VisitNo)+1, 1) AS nextVisitNo
                    FROM session
                    WHERE CandID=:CaID
                      AND (Active='Y' OR Active is null)
                    GROUP BY CandID",
            array('CaID' => $candID));

        //return the next visit No
        return $result["nextVisitNo"];
    }

    /**
     *
     * Return the suggested visit label for the TimePoint you are
     * trying to register
     *
     * @return string Next suggested visit label
     */
    public function getNextVisitLabel(?int $SubprojectID = 1): ?string
    {
        // Getting a handle on the factory singleton
        $factory = NDB_Factory::singleton();
        // Handle on the config and db singletons
        $config  = $factory->config();
        $db = $factory->database();
        // Getting the Visit Label information from the XML config
        $visitLabelSettings = $config->getSetting('visitLabel');
        // Select the settings corresponding to the subprojectID of the TimePoint
        // being created
        foreach($visitLabelSettings as $subprojectSettings){
            if($subprojectSettings['@']['subprojectID'] == $SubprojectID){
                $visitLabelSettings = $subprojectSettings;
                break;
            }
        }
        // Initializing the output variable
        $nextVisitLabel = null;
        // Getting the current CandID
        $candID = $this->getCandID();
        // Not used by the project and currently being deprecated
        if ($visitLabelSettings['generation'] == 'user'
            && !empty($visitLabelSettings['suggest'])
        ) {
            // Get assoc of current sessionID => visitLabels for the
            // CandID
            $existingVisitLabels = $this->getListOfVisitLabels();
            // Query the incremented max visit number for the CandID
            $query  = "SELECT
                            IFNULL(max(VisitNo)+1, 1) AS nextVisitLabel
                        FROM session
                        WHERE CandID=:CaID
                          AND (Active='Y' OR Active is null)
                        GROUP BY CandID";
            $result = $db->pselectRow($query, array('CaID' => $candID));
            // Assign the next visit number to the output variable
            $nextVisitLabel = $result['nextVisitLabel'];
            // If TimePoints exists for the CandID
            if (!empty($existingVisitLabels)) {
                // Increment the output variable by one for each visit
                // that already exists
                while (in_array($nextVisitLabel, $existingVisitLabels)) {
                    $nextVisitLabel++;
                }
                // If the generation is anything but user generated
            } else {
                // display V1 as a suggested visit label when starting
                // the 1st TimePoint
                $nextVisitLabel = '1';
            }
            // Replace the %value% string in the suggest setting of the visit
            // label by the output variable and assign the result to the
            // output variable. Will always return V1 when using non-user
            // generation
            $nextVisitLabel = str_replace(
                '%value%',
                $nextVisitLabel,
                $visitLabelSettings['suggest']
            );
        }
        //return the next visit No
        return $nextVisitLabel;
    }

    /**
     *
     * Generates list of valid subprojects for the selected Candidate's
     * project
     *
     * @return array Array of the form SubprojectID => SubprojectID
     *               or NULL if none exist
     */
    public function getValidSubprojects(): ?array
    {
        // Get handle on the factory singleton
        $factory = NDB_Factory::singleton();
        // Handle on the database singleton
        $db = $factory->database();
        // Initializing subprojectList
        $subProjectList = array();
        // Getting the candidate's ProjectID
        $projID = $this->getProjectID();
        // Getting a list of all subproject for the candidate's ProjectID
        $subProjects = $db->pselect(
            "SELECT
                    SubprojectID
                FROM project_rel
                WHERE ProjectID = :prj",
            array('prj' => $projID));
        // For each valid subproject of the project
        foreach (array_column($subProjects, "SubprojectID") as $index => $subProjectID) {
            // Add the subprojectID value under the subprojectID key
            $subProjectList[$subProjectID] = $subProjectID;
        }
        // Return the subprojectID list or null if the list is empty
        return empty($subProjectList) ? NULL : $subProjectList;
    }
    /**
     *
     * Returns first visit for a candidate based on Date_visit
     *
     * @return string The visit label for the candidate's first visit
     */
    public function getFirstVisit(): string
    {
        // Getting a handle on the factory singleton
        $factory = NDB_Factory::singleton();
        // Handle on the DB singleton
        $db = $factory->database();
        // Getting the candidate's CandID
        $candID = $this->getCandID();
        // Get the visit label of the visit with the
        // earliest date for the Candidate's CandID
        $visitLabel = $db->pselectOne(
            "SELECT Visit_label
                    FROM session
                    WHERE CandID=:cid
                      AND Date_Visit IS NOT NULL
                    ORDER BY Date_Visit",
            array('cid' => $candID));
        // Return the earliest visit label
        return $visitLabel;
    }


    /**
     *
     * Generates a new random CandID based on the Project selected.
     *
     * @param int $ProjectID    ID corresponding to the project in the DB
     *
     * @return integer An unused random CandID matching the pattern of the project
     */
    static function _generateCandID(int $ProjectID = 1): int
    {
        // get a database connection
        $factory = NDB_Factory::singleton();
        $db = $factory->database();
        // Get the pattern for CandID of the project
        $config = \NDB_Config::singleton();
        $candIDSettings = $config->getSetting("CandID");
        // Initialize to the hardcoded value in case the project has no
        // defined values for CandID
        $candIDSetting = array(
            'min'=>CANDIDATE_MIN_CANDID,
            'max'=>CANDIDATE_MAX_CANDID
        );
        // Add the min and max values of the specific project
        foreach($candIDSettings['project'] as $setting){
            if($setting["@"]['ProjectID']==$ProjectID){
                $candIDSetting['min'] = $setting['structure']['seq']['@']['min'];
                $candIDSetting['max'] = $setting['structure']['seq']['@']['max'];
            }
        }
        // Get all the existing CandIDs for the project
        $DBCandIDs = $db->pselect(
            "SELECT CandID
                FROM candidate
                WHERE ProjectID = :ProjectID",
            array("ProjectID" => $ProjectID));
        // Initialize an empty array
        $CandIDs = array();
        // Flatten the DB results so that the CandIDs array only has a
        // list of numbers
        foreach($DBCandIDs as $candID){
            $CandIDs[] = $candID['CandID'];
        }
        // Generate a CandID
        $candID = rand($candIDSetting['min'], $candIDSetting['max']);
        // If the generated CandID already exists
        while (in_array($candID, $CandIDs)) {
            // Re-Generate a CandID
            $candID = rand($candIDSetting['min'], $candIDSetting['max']);
        }
        // Return the new unique CandID
        return $candID;
    }

    /**
    *
     * Generates a new PSCID in the format defined by the config file
    *
    * @param string $prefix The prefix to use for the PSCID
    *
    * @return ?string Project candidate id in format defined by config.xml
    */
    static function _generatePSCID(string $prefix): ?string
    {
        // Getting a handle on the factory singleton
        $factory = NDB_Factory::singleton();
        // Getting handles on the database and config singletons through
        // the factory singleton
        $db = $factory->database();
        $config = $factory->config();
        // Getting the setting for the PSCID numbering
        $PSCIDSettings = $config->getSetting('PSCID');
        // Getting the length of the digits
        $digitsLength = $PSCIDSettings['structure']['seq']['@']['length'];
        // Constructing a positional array for substring-ing the PSCIDs
        $PSCIDPositions = array(
            "startDigits" => strlen($prefix) + 1,
            "endDigits" => $digitsLength + strlen($prefix),
            "startPrefix" => 1,
            "endPrefix" =>strlen($prefix)
        );
        // If the mode is sequential
        if($PSCIDSettings["generation"] === "sequential"){
            // Note that the having condition relies on the number of digits being 4
            // or greater. Further generalization would need better rules on the limits
            // allowable for the configuration of the IDs. Similarly, the string
            // substitution in PHP is necessary since the substring function is not
            // supported in the current version of MySQL for prepared statements
            $currentMaxPSCID = $db->pselectOne(
                "SELECT substring(PSCID, {$PSCIDPositions["startDigits"]}, {$PSCIDPositions["endDigits"]}) as PSCID_DIGITS
             FROM candidate
             WHERE substring(PSCID, {$PSCIDPositions["startPrefix"]}, {$PSCIDPositions["endPrefix"]}) = :prefix
             HAVING PSCID_DIGITS NOT LIKE '99%'
             ORDER BY PSCID_DIGITS DESC",
                array("prefix" => $prefix)
            );
            // If there were no IDs matching the prefix, start numbering at 1
            if(is_array($currentMaxPSCID) && empty($currentMaxPSCID)){
                // Gives padding of 0s to the appropriate length
                $currentMaxPSCID = sprintf("%0{$digitsLength}d", 1);
            }else{
                // Increment the current maximum by one and pad with zeros
                $currentMaxPSCID = sprintf("%0{$digitsLength}d", $currentMaxPSCID + 1);
            }
            // Concat the new number with the prefix
            return $prefix . $currentMaxPSCID;
            // If the mode is random
        }elseif($PSCIDSettings["generation"] === "random"){
            // Extract all IDs with matching prefix
            // Same note as before regarding the support of the substring function
            // in prepared statements
            $currentPSCIDs = $db->pselect(
                "SELECT substring(PSCID, {$PSCIDPositions["startDigits"]}, {$PSCIDPositions["endDigits"]}) as PSCID_DIGITS
                FROM candidate
                WHERE substring(PSCID, {$PSCIDPositions["startPrefix"]}, {$PSCIDPositions["endPrefix"]}) = :prefix",
                array("prefix"=>$prefix)
            );
            // Initialize an empty array
            $PSCIDs = array();
            // For each value from the DB, extract the PSCID digits
            foreach($currentPSCIDs as $PSCID){
                $PSCIDs[] = $PSCID["PSCID_DIGITS"];
            }
            // Generate a random number between the min and max configured
            $newPSCID = rand(
                $PSCIDSettings['structure']['seq']['@']['min'],
                $PSCIDSettings['structure']['seq']['@']['max']
            );

            // While that number exists in the values from the DB
            while(in_array($newPSCID, $PSCIDs)){
                // Generate a new number
                $newPSCID = rand(
                    $PSCIDSettings['structure']['seq']['@']['min'],
                    $PSCIDSettings['structure']['seq']['@']['max']
                );
            }
            // Return the concat of the prefix and the number
            return $prefix . $newPSCID;
            // If the generation method is not supported, return null
        }else{
            return null;
        }
    }

    /**
     *
     * Generating an unused IBIS ID for the candidate.
     *
     * @return string   Available IBIS ID
     * @throws DatabaseException
     */
    static function _generateIBISID(): string
    {
        // This is a legacy feature and is not controlled by
        // the config file. Will probably be deprecated at
        // some point
        $prefix = "IBIS";
        $min = 1000;
        $max = 9999;
        $numberLength = 4;
        // Derived positional parameters
        $startDigits = 1 + strlen($prefix);
        $endDigits = strlen($prefix) + $numberLength;
        $startPrefix = 1;
        $endPrefix = strlen($prefix);

        // Getting handle on the database singleton
        $db = \Database::singleton();
        // Getting the list of all existing IDs
        $currentIBISIDs = $db->pselect(
            "SELECT substring(IBISId, {$startDigits}, {$endDigits}) as IBIS_DIGITS
                FROM candidate
                WHERE substring(IBISId, {$startPrefix}, {$endPrefix}) = :prefix",
            array("prefix"=>$prefix)
        );
        // Initializing an empty array
        $IBISIDs = array();
        // For each value from the DB, extract the IBISID digits
        foreach($currentIBISIDs as $IBISID){
            $IBISIDs[] = $IBISID["IBIS_DIGITS"];
        }
        // Generate a random number between the min and max configured
        $newIBISID = rand($min, $max);
        // While that number exists in the values from the DB
        while(in_array($newIBISID, $IBISIDs)){
            // Generate a new number
            $newIBISID = rand($min, $max);
        }
        // Return the concat of the prefix and the number
        return $prefix . $newIBISID;
    }

    /**
     * Generates a new ExternalID in the format defined by the config file.
     * for the specified project.
     *
     * @param int $ProjectID    Project ID to use for the format of the external
     *                          ID
     *
     * @return string Anonymized ExternalID for distributing data
     */
    static function _generateExternalID(int $ProjectID = 1): string
    {
        // Getting handle on the factory singleton
        $factory = NDB_Factory::singleton();
        // Using the factory singleton to get handles on the config and db singletons
        $config  = $factory->config();
        $db = $factory->database();
        // Getting the External ID settings from the config
        $ExternalIDSettings = $config->getSetting('ExternalID');
        // Initialize to the legacy default values of the config
        $ExternalIDSetting = array(
            'min'=>1000,
            'max'=>9999,
            'prefix'=>'PAD',
            'length' => 4
        );
        // Add the values of the specific project
        foreach($ExternalIDSettings['project'] as $setting){
            if($setting["@"]['ProjectID'] == $ProjectID){
                $ExternalIDSetting['min'] = $setting['structure']['seq'][1]['@']['min'];
                $ExternalIDSetting['max'] = $setting['structure']['seq'][1]['@']['max'];
                $ExternalIDSetting['prefix'] = $setting['structure']['seq'][0]['#'];
                $ExternalIDSetting['length'] = $setting['structure']['seq'][1]['@']['length'];
            }
        }
        // Make a positional array for the substring function
        $ExternalIDsPositions = array(
            "startDigits" => strlen($ExternalIDSetting['prefix']) + 1,
            "endDigits" => $ExternalIDSetting['length'] + strlen($ExternalIDSetting['prefix']),
            "startPrefix" => 1,
            "endPrefix" =>strlen($ExternalIDSetting['prefix'])
        );
        // Get all the existing ExternalIDs for the project
        $DBExternalIDs = $db->pselect(
            "SELECT substring(ExternalID, {$ExternalIDsPositions["startDigits"]}, {$ExternalIDsPositions["endDigits"]}) as EXTERNAL_ID_DIGITS
                FROM candidate
                WHERE substring(ExternalID, {$ExternalIDsPositions["startPrefix"]}, {$ExternalIDsPositions["endPrefix"]}) = :prefix",
            array("prefix"=>$ExternalIDSetting['prefix']));
        // Initialize an empty array
        $ExternalIDs = array();
        // Flatten the DB results so that the ExternalIDs array only has a
        // list of numbers
        foreach($DBExternalIDs as $ExternalID){
            $ExternalIDs[] = $ExternalID['EXTERNAL_ID_DIGITS'];
        }
        // Generate an External ID
        $ExternalID = rand($ExternalIDSetting['min'], $ExternalIDSetting['max']);
        // If the generated External ID already exists
        while (in_array($ExternalID, $ExternalIDs)) {
            // Re-Generate an External ID
            $ExternalID = rand($ExternalIDSetting['min'], $ExternalIDSetting['max']);
        }
        // Return the new unique External ID
        return $ExternalIDSetting['prefix'] . $ExternalID;
    }

    /**
     *
     * Validate that a PSCID matches the format defined by project
     * config
     *
     * @param string $PSCID      The PSCID to validate
     * @param string $siteAbbrev (optional) The site of the candidate
     *                           being validated to check against appropriate
     *                           parts of PSCID definition
     *
     * @return boolean True if PSCID is valid
     */
    static public function validatePSCID(string $PSCID, string $siteAbbrev=null): bool
    {
        // Getting a handle on the factory singleton
        $factory = NDB_Factory::singleton();
        // Handle on the config singleton
        $config  = $factory->config();
        // Getting the configuration information from the XML
        // file for the PSCID
        $PSCIDSettings = $config->getSetting('PSCID');
        // Using the utility function to convert the config structure to regex
        // For the project, it should be /^[0-9]{4}$/. A better regex would be /^[1-9][0-9]{3}$/
        // to account for the min and max values of the config which the current version ignores
        $regex = Utility::structureToPCRE(
            $PSCIDSettings['structure'],
            $siteAbbrev
        );
        // Return true if the PSCID provided matches the regex generated
        return preg_match($regex, $PSCID);
    }


    /**
     *
     * Helper function used to generate PSCID. This generates a random
     * number if generation is not "sequential"
     *
     * @param array $arrays Array specifying format of random
     *                      string to be generated
     *
     * @return string A random string matching format from arrays
     */
    static function generateRandomStringFromArrays(array $arrays): string
    {
        // Initialize the empty string
        $string = "";
        // For each element of the array $arrays
        foreach ($arrays AS $array) {
            // If the element is an array
            if (is_array($array)) {
                // Append a random key of the array to the string
                $string .= $array[array_rand($array)];
                // If the element is not an array
            } else {
                // Append the element to the string
                $string .= $array;
            }
        }
        // Return the string
        return $string;
    }

    /**
     *
     * Helper function used to generate PSCID. Generate the string for the first
     * numeric part of the PSCID if generation type is "sequential" and pads with
     * an appropriate numbers.
     *
     * @param array $arrays An array config file specifying format of number
     *
     * @return string The first string to be used for the PSCID
     */
    static function generateFirstStringFromArrays(array $arrays): string
    {
        // Initialize the string
        $string = "";
        // For each element of the array $arrays
        foreach ($arrays AS $array) {
            // Pop the first element of the element and append to the string
            $string .= array_shift($array);
        }
        // Return the string
        return $string;
    }

    /**
     *
     * Helper function used for generating PSCID.
     * This parses the PSCID format in the config file into a format that
     * can be converted into a regex for validation.
     *
     * @param array  $idStructure The structure defined in the config file in the
     *                            array format returned by NDB_Config.
     * @param string $siteAbbrev  The candidate being validate's site abbreviation,
     *                            so that it can be inserted into relevant "site"
     *                            parts of the regex generated.
     *
     * @return array An array of regular expressions defining each section of
     *               the PSCID as defined in config.xml
     */
    static function generateArrays(array $idStructure, string $siteAbbrev=null): array
    {
        $idStructure = $idStructure['structure']['seq'];
        if (!$idStructure[0]) {
            // There's only one seq tag so the param format
            // needs to be fixed
            $temp        = array();
            $temp[]      = $idStructure;
            $idStructure = $temp;
        }
        $arrays = array();
        foreach ($idStructure AS $seq) {
            if (isset($seq['@']['length'])) {
                $length = $seq['@']['length'];
            } elseif (isset($seq['@']['minLength'])) {
                $length = $seq['@']['minLength'];
            } else {
                $length = 1;
            }
            for ($i=0; $i<$length; $i++) {
                switch($seq['@']['type']) {
                case 'alpha':
                    $arrays[] = range('a', 'z');
                    break;
                case 'alphanumeric':
                    $arrays[] = array_merge(range(0, 9), range('a', 'z'));
                    break;
                case 'numeric':
                    $arrays[] = range(0, 9);
                    break;
                case 'static':
                    $arrays[] = array($seq['#']);
                    break;
                case 'set':
                    if (strpos($seq['#'], '|') !== false) {
                        $arrays[] = explode('|', $seq['#']);
                    } else {
                        $arrays[] = str_split($seq['#']);
                    }
                    break;
                case 'siteAbbrev':
                    $arrays[] = array($siteAbbrev);
                    break;
                }
            }
        }
        return $arrays;
    }

    /**
     *
     * Gets the participant_status options from participant_status_options table
     *
     * @return array Options array suitable for use in QuickForm select
     *               element
     * @throws DatabaseException
     */
    static function getParticipantStatusOptions(): array
    {
        // Getting handle on the DB singleton
        $DB =& Database::singleton();
        // Getting the status options for the participants with null parentID
        $options = $DB->pselect(
            "SELECT
                ID,
                Description
                FROM participant_status_options
                WHERE parentID IS NULL",
                array()
        );
        // Initialize the options array
        $option_array = array();
        // Flatten the answer from the DB to an assoc with ID => Description
        foreach ($options as $option) {
            $option_array[$option['ID']] = $option['Description'];
        }
        // Return the options' array
        return $option_array;
    }

    /**
     *
     * Gets the participant_status options suboptions from participant_status_options
     *
     * @param int $parentID parentID of the participant status option
     *
     * @return array Options array suitable for use in QuickForm select
     *               element
     * @throws DatabaseException
     */
    static function getParticipantStatusSubOptions(int $parentID): array
    {
        // Getting handle on the database singleton
        $DB =& Database::singleton();
        // Getting the status options for the parentID specified
        $options = $DB->pselect(
            "SELECT
                    ID,
                    Description
                FROM participant_status_options
                WHERE parentID=:pid",
            array('pid' => $parentID)
        );
        // Initializing the options array
        $option_array = array();
        // Flatten the option to an assoc with ID => Description
        foreach ($options as $option) {
            $option_array[$option['ID']] = $option['Description'];
        }
        // Return the options' array
        return $option_array;
    }
}
?>
