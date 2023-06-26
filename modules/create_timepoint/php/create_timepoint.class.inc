<?php
/**
 * This file contains the NDB_Form_create_timepoint class
 *
 * PHP Version 5
 *
 * @category Loris
 * @package  Create_Timepoint
 * @author   Loris Team <loris.mni@bic.mni.mcgill.ca>
 * @license  http://www.gnu.org/licenses/gpl-3.0.txt GPLv3
 * @link     https://github.com/aces/Loris-Trunk
 */

namespace LORIS\create_timepoint;

/**
 * The forms for the new profile menu
 *
 * @category Loris
 * @package  Create_Timepoint
 * @author   Loris Team <loris.mni@bic.mni.mcgill.ca>
 * @license  http://www.gnu.org/licenses/gpl-3.0.txt GPLv3
 * @link     https://github.com/aces/Loris-Trunk
 */

class Create_Timepoint extends \NDB_Form
{
    //The subprojectID being created
    var $subprojectID;
    // Config settings for the Visit label
     var $visitLabelSettings;
     // Addition of the Visit label
     var $visitLabelAdded;

    /**
     * Check user permissions
     *
     * @return bool
     * @throws ConfigurationException
     */
    function _hasAccess()
    {
        // create user object
        $user =& \User::singleton();

        $candidate =& \Candidate::singleton($this->identifier);

        // check user permissions
        return (
            $user->hasPermission('data_entry') &&
            (in_array($candidate->getData('CenterID'), $user->getData('CenterIDs')))
        );
    }

    /**
     * Returns the form-specific defaults
     *
     * @return array
     */
    function _getDefaults()
    {
        $candidate =& \Candidate::singleton($this->identifier);

        $defaults['visitLabel'] = $candidate->getNextVisitLabel($this->subprojectID);
        return $defaults;
    }

    /**
     * Processes the values and saves to database. Usually overridden
     * by form instance.
     *
     * @param array $values form values
     *
     * @return void
     */
    function _process($values)
    {
	$concatTimePoint = $values['visitLabel1']. $values['visitLabel2'] . $values['visitLabel3'];
        $success = \TimePoint::createNew(
            $this->identifier,
            $values['subprojectID'],
            $concatTimePoint,
            $values['psc']
        );

        $this->tpl_data['success'] = true;

        // freeze it, just in case
        $this->form->freeze();
    }

    /**
     * Does the setup required for this page.
     * Particularly creates all the form elements.
     *
     * @return void
     */
    function setup(): void
    {
        parent::setup();

        $config =& \NDB_Config::singleton();
        if (!empty($_GET['subprojectID']) && is_numeric($_GET['subprojectID'])) {
            $this->subprojectID =$_GET['subprojectID'];
        }

        // cand ID
        $this->tpl_data['candID'] = $this->identifier;

        $this->addHidden('candID', $this->identifier);

        $candidate   =& \Candidate::singleton($this->identifier);
        $subprojList = null;
        //List of valid subprojects for a given project
        if ($config->getSetting('useProjects') === 'true') {
            $subprojList = $candidate->getValidSubprojects();
        }
        // List of all subprojects from config file

        // Loop through the subprojects to get an id out and to create
        // the subproject drop down.
        $allSubprojects  = \Utility::getSubprojectList();
        $sp_labelOptions = array(null => '');

        foreach ($allSubprojects as $subprojectID => $title) {
            if (! empty($subprojList)) {
                if (in_array($subprojectID, $subprojList)) {
                    $sp_labelOptions[$subprojectID] = $title;
                }
            } else {
                $sp_labelOptions[$subprojectID] = $title;
            }
        }

        $attributes = array(
                       "onchange" => "location.href='?test_name=create_timepoint" .
                        "&candID=" . $this->identifier .
                        "&identifier=" . $this->identifier .
                        "&subprojectID='+this[this.selectedIndex].value;",
                      );
        $this->addSelect(
            'subprojectID',
            'Project',
            $sp_labelOptions,
            $attributes
        );
        $this->addRule('subprojectID', 'A Subproject ID is required', 'required');
        $this->_setDefaults(array("subprojectID" => $this->subprojectID));

        // visit label
        $this->visitLabelSettings = $config->getSetting('visitLabel');
        $this->visitLabelAdded    = false;

        foreach (\Utility::toArray($this->visitLabelSettings) as $visitLabel) {
            if ($visitLabel['@']['subprojectID']==$this->subprojectID) {
                if ($visitLabel['generation'] == 'user') {
                    error_log(
                        "DEPRECATION WARNING: User generated visit labels will ".
                        "no longer be supported in the next release of Loris. ".
                        "Please add the necessary entries to the config.xml file ".
                        "and set the generation to 'sequence'"
                    );
                    $this->addBasicText(
                        'visitLabel',
                        'Visit label',
                        array(
                         'size'      => $visitLabel['length'] + 1,
                         'maxlength' => $visitLabel['length'],
                        )
                    );
                    $this->visitLabelAdded = true;
                } elseif ($visitLabel['generation'] == 'sequence') {
                    $cohortOptions = array();
                    $labelOptions[''] = null;
                    $timePointOptions[''] = null;

                    $items            = \Utility::toArray(
                        $visitLabel['cohortSet']['item']
                    );
                    foreach ($items as $item) {
                        $cohortOptions[$item['@']['value']] = $item['#'];
                    }
                    $items            = \Utility::toArray(
                        $visitLabel['labelSet']['item']
                    );
                    foreach ($items as $item) {
                        $labelOptions[$item['@']['value']] = $item['#'];
                    }
                    $items            = \Utility::toArray(
                        $visitLabel['timePoint']['item']
                    );
                    foreach ($items as $item) {
                        $timePointOptions[$item['@']['value']] = $item['#'];
                    }

                    $this->addSelect('visitLabel1', 'Visit label', $cohortOptions);
                    $this->addSelect('visitLabel2', 'Visit label', $labelOptions);
                    $this->addSelect('visitLabel3', 'Visit label', $timePointOptions);

                    $this->visitLabelAdded = true;
                }
            }
        }

        // label rules
        if ($this->visitLabelAdded) {
            $this->addRule('visitLabel2', 'Visit label is required', 'required');
            $this->addRule('visitLabel3', 'Visit label is required', 'required');
            $this->addRule('visitLabel1', 'Visit label is required', 'required');
             // List of sites for the user
             $user = \User::singleton();
             $DB   = \Database::singleton();
             $user_list_of_sites = $user->getData('CenterIDs');
             $num_sites          = count($user_list_of_sites);

            if ($num_sites >1) {
                $pscLabelAdded =true;
                $this->tpl_data['pscLabelAdded'] = true;
                $psc_labelOptions = array(null => '');
                foreach ($user_list_of_sites as $key => $siteID) {
                    $center = $DB->pselectRow(
                        "SELECT CenterID as ID, Name FROM psc
                        WHERE CenterID =:cid",
                        array('cid' => $siteID)
                    );
                    $psc_labelOptions[$siteID] = $center['Name'];
                }
            }
            $this->addSelect('psc', 'Site', $psc_labelOptions);
        }

        $this->form->addFormRule(array(&$this, '_validate'));

    }


    /**
     * Validates user form selection
     *
     * @param array $values array of form values
     *
     * @return array
     * @throws \DatabaseException
     */
    function _validate(array $values): array
    {
        // Setting the errors array to blank
        $errors = array();

        // Catching the GET requests with blank values
        if(empty($values['visitLabel1']) || empty($values['subprojectID'])) {
            $errors['visitLabel1'] = 'Both a Subproject label and ID are required for the creation of a timePoint.';
            return $errors;
        }elseif(empty($values['visitLabel2'])) {
            $errors['visitLabel2'] = 'A visit label is required for the creation of a timePoint.';
            return $errors;
        }elseif(empty($values['visitLabel3'])) {
            $errors['visitLabel3'] = 'A timePoint label is required for the creation of a timePoint.';
            return $errors;
        }

        // make sure the user entered a valid visit label
        // The user based generation is being actively deprecated in newer versions
        // No impact in the current study and will be removed during future upgrades
        if ($this->visitLabelSettings['generation'] == 'user') {
            if (!preg_match($this->visitLabelSettings['regex'], $values['visitLabel'])) {
                $errors['visitLabel'] = 'This visit label does not match the ' .
                    'required structure. See your project manual for more details.';
                return $errors;
            }
        }

        // Getting a handle on an appropriate Candidate singleton based on the candID
        $candidate =& \Candidate::singleton($this->identifier);

        // Assoc array between sessionIDs and visit labels for each timePoint of the candidate
        $timePointArray = $candidate->getListOfVisitLabels();

        // If the specified timePoint already exists for the candidate
        if(in_array(
            $values['visitLabel1'] . $values['visitLabel2'] . $values['visitLabel3'],
            $timePointArray)){
            // Add the appropriate error and exit
            $errors['visitLabel1'] = 'This visit label does not appear to be unique.';
            return $errors;
        }

        // Name used for the subproject
        $subprojectName = "";

        // Array of the visits defined in the XML config file for the subproject
        $subprojectVisits = array();

        // Array of the time values defined in the XML config file for the subproject
        $subprojectTimePoints = array();

        // For each visit label settings associated with each subproject
        foreach($this->visitLabelSettings as $subproject){
            // If the visit label settings match the subproject of the timePoint
            if($subproject["@"]['subprojectID'] === $values['subprojectID']){
                // Set the name of the subproject
                $subprojectName = $subproject["cohortSet"]["item"]["@"]["value"];
                // Append all visits of the subproject
                foreach($subproject["labelSet"]["item"] as $visit){
                    $subprojectVisits[] = $visit["@"]["value"];
                }
                // Append all times of the subproject
                foreach($subproject["timePoint"]["item"] as $timePoint){
                    $subprojectTimePoints[] = $timePoint["@"]["value"];
                }
                // Exit the loop
                break;
            }
        }

        // If the name passed doesn't match the name associated with the subprojectID
        if($subprojectName !== $values["visitLabel1"]){
            $errors['visitLabel1'] = "The value provided for the subproject identifier is not valid for the subproject.";
        // If the visit passed doesn't match a visit supported by the subproject
        }elseif (!in_array($values['visitLabel2'], $subprojectVisits)){
            $errors['visitLabel2'] = "The value provided for the visit label is not valid for the subproject.";
        // If the time doesn't match an interval supported by the subproject
        }elseif (!in_array($values['visitLabel3'], $subprojectTimePoints)){
            $errors['visitLabel3'] = "The value provided for the time element is not valid for the subproject.";
        }
        // Valid if the array is still empty
        return $errors;
    }
}
?>
