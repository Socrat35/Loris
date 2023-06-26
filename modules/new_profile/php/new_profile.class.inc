<?php
/**
 * New_profile
 *
 * PHP Version 5
 *
 * @category Main
 * @package  Loris
 * @author   Ted Strauss <ted.strauss@mcgill.ca>
 * @license  http://www.gnu.org/licenses/gpl-3.0.txt GPLv3
 * @link     https://github.com/aces/Loris
 */
namespace LORIS\new_profile;

/**
 * New_profile
 *
 * PHP Version 5
 *
 * @category Main
 * @package  Loris
 * @author   Ted Strauss <ted.strauss@mcgill.ca>
 * @license  http://www.gnu.org/licenses/gpl-3.0.txt GPLv3
 * @link     https://github.com/aces/Loris
 */
class New_Profile extends \NDB_Form
{
    /**
     *
     * Tie the access to a data_entry permission
     *
     * @return bool true if they have access to this page
     * @throws \ConfigurationException|\LorisException
     */
    function _hasAccess(): bool
    {
        // Handle on the User singleton
        $user =& \User::singleton();
        // Getting User's sites
        $site_arr      = $user->getData('CenterIDs');
        // Checking if user's is part of the DCC
        $userInDCCSite = in_array("1", $site_arr);
        // If the user has at least one study site or is in DCC
        if ($user->hasStudySite() or $userInDCCSite) {
            // Check that the user has the data entry permission
            return $user->hasPermission('data_entry');
        }
        // The user has neither a study site or the DCC membership
        return false;
    }

    /**
     *
     * Processes the values and saves to database
     *
     * @param array $values form values
     *
     * @return void
     * @throws \Exception
     */
    function _process($values): void
    {
        // Get handles on the user and config singletons
        $user   =& \User::singleton();
        $config =& \NDB_Config::singleton();
        // Set the DoB to dob1 if set and non-empty, else set to null
        $dob = empty($values['dob1']) ? null : $values['dob1'];
        // Initialize EdC to null
        $edc = null;
        // If the project uses EDC
        if ($config->getSetting('useEDC') == "true") {
            // Set the EdC to edc1 if set and non-empty, else set to null
            $edc = empty($values['edc1']) ? null : $values['edc1'];
        }
        // Get the user's sites
        $site_arr  = $user->getData('CenterIDs');
        // Count the user's sites
        $num_sites = count($site_arr);
        // Create the candidate
        $candID = \Candidate::createNew(
            // use the site selected if user has more than 1, use the first if the user
            // only has one
            ($num_sites > 1 ) ? $values['psc'] : $site_arr[0],
            $dob,
            $edc,
            $values['gender'],
            // If the PSCID is specified in the front-end, pass the value, if not pass null
            !empty($values['PSCID']) ? $values['PSCID'] : null,
            // if the study uses projects, pass the projectID, if not pass the default value
            $config->getSetting('useProjects') == "true" ? $values['ProjectID'] : '1'
        );
        // get the newly created Candidate object's singleton
        $candidate =& \Candidate::singleton($candID);
        // Set the template data for success, CandID and PSCID
        $this->tpl_data['success'] = true;
        $this->tpl_data['candID']  = $candID;
        $this->tpl_data['PSCID']   = $candidate->getPSCID();
        // freeze it, just in case
        $this->form->freeze();
    }

    /**
     *
     * Does the setup required for this page. By default, sets up elements
     * that are common to every type of page. May be overridden by a specific
     * page or specific page type.
     *
     * @return void
     */
    function setup(): void
    {
        // Run the setup of NDB_Form
        parent::setup();
        // Get handle on the config, user and database singletons
        $config    =& \NDB_Config::singleton();
        $user =& \User::singleton();
        $DB = \Database::singleton();
        // Get the config values for the date restrictions
        $startYear = $config->getSetting('startYear');
        $endYear   = $config->getSetting('endYear');
        $ageMax    = $config->getSetting('ageMax');
        $ageMin    = $config->getSetting('ageMin');
        $dobFormat = $config->getSetting('dobFormat');
        // Set the date control options
        $dateOptions = array(
                        'language'       => 'en',
                        'format'         => $dobFormat,
                        'addEmptyOption' => true,
                        'minYear'        => date("Y") - $ageMax,
                        'maxYear'        => date("Y") - $ageMin
                       );
        // Define the class attributes for date controls
        $dateAttributes = ['class' => 'form-control input-sm input-date'];
        // add date of birth control
        $this->addBasicDate(
            'dob1',
            'Date of Birth',
            $dateOptions,
            $dateAttributes
        );
        // add date of birth confirmation control
        $this->addBasicDate(
            'dob2',
            'Confirm Date of Birth',
            $dateOptions,
            $dateAttributes
        );
        // Add a rule that the DoB and the confirmation must match
        $this->addRule(
            array(
             'dob1',
             'dob2',
            ),
            'Date of birth fields must match',
            'compare'
        );
        // Add requirements for DoB and confirmation controls
        $this->addRule(
            'dob1',
            'Date of Birth is required',
            'required');
        $this->addRule(
            'dob2',
            'Date of Birth confirmation is required',
            'required'
        );
        // If the Project uses EDC
        if ($config->getSetting('useEDC') == "true") {
            // add expected date of confinement control
            $this->addBasicDate(
                'edc1',
                'Expected Date of Confinement',
                $dateOptions,
                $dateAttributes
            );
            // add expected date of confinement confirmation control
            $this->addBasicDate(
                'edc2',
                'Confirm EDC',
                $dateOptions,
                $dateAttributes
            );
            // Add rule that EdC and confirmation must match
            $this->addRule(
                array(
                 'edc1',
                 'edc2',
                ),
                'EDC fields must match',
                'compare'
            );
        }
        // If the study uses projects
        if ($config->getSetting("useProjects") == "true") {
            // Get the project list for the CenterIDs of the user
            $projects = \Utility::getProjectListFromCenterIDs($user->getData('CenterIDs'));
            // Initialize the projectList array
            $projList = array();
            // For each project
            foreach ($projects as $projectID => $projectName) {
                // Add the project name under the projectID key
                $projList[$projectID] = $projectName;
            }
            // Define a select using the projectList named ProjectID
            $this->addSelect(
                'ProjectID',
                'Project',
                $projList);
        }
        // Define Gender select options
        $genderOptions = array(
                          ''       => '',
                          'Male'   => 'Male',
                          'Female' => 'Female',
                         );
        // Add a gender select control
        $this->addSelect(
            'gender',
            'Gender',
            $genderOptions);

        // Add a rule making the gender selection required
        $this->addRule(
            'gender',
            'Gender is required',
            'required');
        // Get list of the user's sites
        $user_list_of_sites = $user->getData('CenterIDs');
        $num_sites = count($user_list_of_sites);
        // If the user has more than 1 site
        if ($num_sites > 1) {
            // Define the empty option
            $psc_labelOptions = array(null => '');
            // For each site of the user
            foreach ($user_list_of_sites as $key => $siteID) {
                // Get the site's name from the DB
                $center = $DB->pselectRow(
                    "SELECT
                                CenterID as ID,
                                Name
                            FROM psc
                            WHERE CenterID =:cid",
                    array('cid' => $siteID)
                );
                // Set the site's name under its ID as a key in the list
                $psc_labelOptions[$siteID] = $center['Name'];
            }
            // Add a select control with the user's sites options
            $this->addSelect(
                'psc',
                'Site',
                $psc_labelOptions);
            // Add a rule making the site selection required
            $this->addRule(
                'psc',
                'Site is required',
                'required');
        }
        // Get the settings for the PSCID for the study
        $PSCIDsettings = $config->getSetting('PSCID');
        // If the PSCID uses user generation which is being deprecated
        if ($PSCIDsettings['generation'] == 'user') {
            // Add a text box for the PSCID
            $this->addBasicText('PSCID', 'PSCID');
        }
        // Add a form rule linked to the _validate function for this object
        $this->form->addFormRule(array(&$this, '_validate'));
    }

    /**
     *
     * Validate function
     *
     * @param array $values the values from the front-end
     *
     * @return array
     */
    function _validate(array $values): array
    {
        // Initialize the errors array
        $errors = array();
        // Get handle for the config, database and user singletons
        $config =& \NDB_Config::singleton();
        $user   = \User::singleton();
        $db =& \Database::singleton();
        // If the DoB and the confirmation don't match
        if ($values['dob1'] != $values['dob2']) {
            // Append the error
            $errors['dob1'] = 'Date of Birth fields must match.';
        }
        // If the study uses EDC
        // Note: this whole validation needs to be reviewed. The logical
        // way is to test both dates for validity then check for comparison
        if ($config->getSetting('useEDC') == "true" && is_array($values['edc1'])) {
            if (strlen(implode($values['edc1'])) > 2
                && !\Utility::_checkDate($values['edc1'])
            ) {
                $errors['edc1'] = 'EDC is not a valid date';
            }
            if ($values['edc1'] != $values['edc2']) {
                $errors['edc1'] = 'Estimated Due date fields must match.';
            }
        }
        // If the value for gender is empty
        // which should be impossible since the field is required
        if (empty($values['gender'])) {
            // Append the error to the error array
            $errors['gender'] = 'Gender is required.';
        }
        // Get the PSCID settings for the study
        $PSCIDsettings = $config->getSetting('PSCID');
        // If the generation is user-based which doesn't apply to the project
        // and is being deprecated
        if ($PSCIDsettings['generation'] == 'user') {
            // If the user only has one site
            if (empty($values['psc'])) {
                // Get the user's siteID array
                $centerIDs = $user->getData('CenterIDs');
                // Use the first siteID
                $centerID  = $centerIDs[0];
                $site      =& \Site::singleton($centerID);
            } else {
                // user has multiple sites,
                // so validate PSCID against the Site selected
                $site =& \Site::singleton($values['psc']);
            }
            // If the PSCID exists, meaning it's user generated, and is empty
            if (empty($values['PSCID'])) {
                // Append the error
                $errors['PSCID'] = 'PSCID must be specified';
                // If the PSCID doesn't pass the validation
            } elseif (!\Candidate::validatePSCID(
                $values['PSCID'],
                $site->getSiteAlias()
            )) {
                // Append the error
                $errors['PSCID'] = 'PSCID does not match the required structure';
                // If the PSCID already exists in the DB
            } elseif ($db->pselectOne(
                "SELECT
                            count(PSCID)
                        FROM candidate
                        WHERE PSCID=:V_PSCID",
                array('V_PSCID' => $values[PSCID])
            ) > 0) {
                //Append the error
                    $errors['PSCID'] = 'PSCID has already been registered';
            }
        }
        // Get the site entered
        $site = $values['psc'];
        // Get the user's sites
        $user_list_of_sites = $user->getData('CenterIDs');
        // Count the user's sites
        $num_sites = count($user_list_of_sites);
        // If the user has more than 1 site and no sites were selected and the
        // user is not part of DCC
        if ($num_sites > 1 && (empty($site) || !$user->hasCenter($site))) {
            // Append the error
            $errors['psc'] = "Site must be selected from the available dropdown.";
        }
        // Get the config information on the use of projects
        $useProjects = $config->getSetting('useProjects');
        // If the study uses projects and no projectID was selected
        if ($useProjects === "true" && empty($values['ProjectID'])) {
            // Append the error
            $errors['ProjectID'] = "Project is required";
        }
        // Return the errors array
        return $errors;
    }
}
?>
