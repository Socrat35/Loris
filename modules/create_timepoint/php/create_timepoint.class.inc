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
    /**
     * The subprojectID being created
     */
    var $subprojectID;

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

        $defaults['visitLabel'] = $candidate->getNextVisitLabel();
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
     * @return none
     */
    function setup()
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
            'Subproject',
            $sp_labelOptions,
            $attributes
        );
        $this->addRule('subprojectID', 'A Subproject ID is required', 'required');
        $this->_setDefaults(array("subprojectID" => $this->subprojectID));

        // visit label
        $visitLabelSettings = $config->getSetting('visitLabel');
        $visitLabelAdded    = false;

        foreach (\Utility::toArray($visitLabelSettings) as $visitLabel) {
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
                    $visitLabelAdded = true;
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

                    $visitLabelAdded = true;
                }
            }
        }

        // label rules
        if ($visitLabelAdded) {
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
     * @param array $val array of form values
     *
     * @return array
     */
    function _validate(array $values)
    {
        $user = \User::singleton();

        $errors = array();

        // This can happen if the user quickly clicks "Create Time Point" before the
        // page has loaded and the Visit Label dropdown hasn't been selected yet.
        // The page will create "V1" when this is the case without this check.
        if(empty($values['visitLabel1'])) {
            $errors['visitLabel1'] = 'A cohort label is required for creating a timepoint.';
        }
        if(empty($values['visitLabel2'])) {
            $errors['visitLabel2'] = 'A visit label is required for creating a timepoint.';
        }
        if(empty($values['visitLabel3'])) {
            $errors['visitLabel3'] = 'A timepoint label is required for creating a timepoint.';
        }
        // make sure the user entered a valid visit label
        if ($visitLabelSettings['generation'] == 'user') {
            if (!preg_match($visitLabelSettings['regex'], $values['visitLabel'])) {
                $errors['visitLabel'] = 'This visit label does not match the ' .
                    'required structure. See your project manual for more details.';
            }
        }

        $candidate =& \Candidate::singleton($this->identifier);

        $timePointArray = $candidate->getListOfVisitLabels();

        $concatTimePoint = $values['visitLabel1'] . $values['visitLabel2'] . $values['visitLabel3'];

        //If the visitLabel is already in use then let the user pick another
        foreach ($timePointArray AS $used_label) {
            if(strcasecmp($concatTimePoint, $used_label) == 0) {
                $errors['visitLabel1'] = 'This visit label does not appear to be unique.';
            }
        }

	$validTimepoints = array("PREEL00","PREEN00","PREBL00","PRETL06","PREFU12","PRETL18","PREFU24","PRETL30","PREFU36","PRETL42","PRETL42","PREFU48","PRETL54","PRETL66","NAPEN00","NAPBL00","NAPLP00","NAPLA01","NAPTL01","NAPLP03","NAPFU03","NAPFU06","NAPTL09","NAPLP12","NAPFU12","NAPTL15","NAPFU18","NAPTL21","NAPLP24","NAPFU24","NAPTL30","NAPFU36","NAPLP36","NAPTL42","NAPFU48","NAPTL54","NAPTL66","PREAE00","PREAE01","PREAE03","PREAE06","PREAE09","PREAE12","PREAE15","PREAE18","PREAE21","PREAE24","PREAE30","PREAE36","PREAE42","PREAE48","NAPAE00","NAPAE01","NAPAE03","NAPAE06","NAPAE09","NAPAE12","NAPAE15","NAPAE18","NAPAE21","NAPAE24","NAPAE30","NAPAE36","NAPAE42","NAPAE48","NAPTI00", "NAPTL25", "PREAP00", "PREAP01", "PREAP02", "PREAP03", "PREAP04", "PREAP05", "NAPAP00", "NAPAP01", "NAPAP02", "NAPAP03", "NAPAP04", "NAPAP05", "PREEC00", "NAPEC00", "PRELP00","PRELP03", "PRELP12", "PRELP24", "PRELP36", "PRELP48", "POIEP00","POIWA00","POIWA01","POIWA02","POIWA03","POICA00","POICA03","POIMA01","POIMA02","POIMA03","POIWB00","POIWB01","POIWB02","POIWB03","POICB00","POICB12","POIMB01","POIMB02","POIMB03","NAPLP48", "POIAE00", "POITI00", "YNGEN00", "MCIEN00", "CTLEN00", "YNGEL00", "MCIEL00", "CTLEL00", "YNGBL00", "MCIBL00", "CTLBL00", "YNGLP00", "MCILP00", "CTLLP00", "PREFU60", "NAPFU60", "PREFU72", "PREFU84", "PREFU96", "PREFU108", "PREFU120", "PREFU132", "PREFU144", "PREFU156", "NAPFU72", "NAPFU84", "NAPFU96", "NAPFU108", "NAPFU120", "NAPFU132", "NAPFU144", "NAPFU156", "MCIFU12", "MCIFU24", "MCIFU36");
        if (!in_array($concatTimePoint,$validTimepoints)) {
            $errors['visitLabel1'] = 'Invalid timepoint!';
        }

        return $errors;
    }
}
?>
