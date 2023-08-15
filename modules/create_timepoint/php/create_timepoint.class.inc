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

	$validTimepoints = array(
                                /*******************************************************/
                                /*---------------- PreventAD Cohort--------------------*/
                                /*******************************************************/

                                /*Eligibility*/
                                "PREEL00",

                                /*Enrollment*/
                                "PREEN00",

                                /*Baseline*/
                                "PREBL00",

                                /*Telephone Call*/
                                "PRETL06","PRETL18","PRETL30","PRETL42","PRETL54","PRETL66",

                                /*Follow-Up*/
                                "PREFU12","PREFU24","PREFU36","PREFU48","PREFU60","PREFU72","PREFU84","PREFU96","PREFU108","PREFU120","PREFU132","PREFU144","PREFU156",

                                /*PET Scan Amyloid*/
                                "PREPA00","PREPA06","PREPA12","PREPA24","PREPA36","PREPA48","PREPA60","PREPA72","PREPA84","PREPA96","PREPA108","PREPA120","PREPA132","PREPA144","PREPA156",

                                /*PET Scan Choline*/
                                "PREPC00","PREPC06","PREPC12","PREPC24","PREPC36","PREPC48","PREPC60","PREPC72","PREPC84","PREPC96","PREPC108","PREPC120","PREPC132","PREPC144","PREPC156",

                                /*PET Scan Tau*/
                                "PREPT00","PREPT06","PREPT12","PREPT24","PREPT36","PREPT48","PREPT60","PREPT72","PREPT84","PREPT96","PREPT108","PREPT120","PREPT132","PREPT144","PREPT156",

                                /*Adverse Event*/
                                "PREAE00","PREAE01","PREAE03","PREAE06","PREAE09","PREAE12","PREAE15","PREAE18","PREAE21","PREAE24","PREAE30","PREAE36","PREAE42","PREAE48",

                                /*???*/
                                "PREAP00","PREAP01","PREAP02","PREAP03","PREAP04","PREAP05",

                                /*???*/
                                "PREEC00",

                                /*Lumbar punctures*/
                                "PRELP00","PRELP03","PRELP12","PRELP24","PRELP36","PRELP48",

                                /*******************************************************/
                                /*---------------- Naproxene Cohort--------------------*/
                                /*******************************************************/

                                /*Enrollment*/
                                "NAPEN00",

                                /*Baseline*/
                                "NAPBL00",

                                /*Lumbar punctures*/
                                "NAPLP00","NAPLP03","NAPLP12","NAPLP24","NAPLP36","NAPLP48",

                                /*Lab visit*/
                                "NAPLA01",

                                /*Telephone*/
                                "NAPTL01","NAPTL09","NAPTL15","NAPTL21","NAPTL25","NAPTL30","NAPTL42","NAPTL54","NAPTL66",

                                /*Follow-up*/
                                "NAPFU03","NAPFU06","NAPFU12","NAPFU18","NAPFU24","NAPFU36","NAPFU48","NAPFU60","NAPFU72","NAPFU84","NAPFU96","NAPFU108","NAPFU120","NAPFU132","NAPFU144","NAPFU156",

                                /*PET Scan Amyloid*/
                                "NAPPA00","NAPPA03","NAPPA06","NAPPA12","NAPPA18","NAPPA24","NAPPA36","NAPPA48","NAPPA60","NAPPA72","NAPPA84","NAPPA96","NAPPA108","NAPPA120","NAPPA132","NAPPA144","NAPPA156",

                                /*PET Scan Choline*/
                                "NAPPC00","NAPPC03","NAPPC06","NAPPC12","NAPPC18","NAPPC24","NAPPC36","NAPPC48","NAPPC60","NAPPC72","NAPPC84","NAPPC96","NAPPC108","NAPPC120","NAPPC132","NAPPC144","NAPPC156",

                                /*PET Scan Tau*/
                                "NAPPT00","NAPPT03","NAPPT06","NAPPT12","NAPPT18","NAPPT24","NAPPT36","NAPPT48","NAPPT60","NAPPT72","NAPPT84","NAPPT96","NAPPT108","NAPPT120","NAPPT132","NAPPT144","NAPPT156",

                                /*Adverse event*/
                                "NAPAE00","NAPAE01","NAPAE03","NAPAE06","NAPAE09","NAPAE12","NAPAE15","NAPAE18","NAPAE21","NAPAE24","NAPAE30","NAPAE36","NAPAE42","NAPAE48",

                                /*???*/
                                "NAPAP00","NAPAP01","NAPAP02","NAPAP03","NAPAP04","NAPAP05",

                                /*Treatment interruption*/
                                "NAPTI00",

                                /*???*/
                                "NAPEC00",

                                /*******************************************************/
                                /*---------------- Probucol? Cohort--------------------*/
                                /*******************************************************/

                                /*Eligibility Probucol*/
                                "POIEP00",

                                /*Weekly visit probucol phase A*/
                                "POIWA00","POIWA01","POIWA02","POIWA03",

                                /*Probucol lumbar puncture phase A*/
                                "POICA00","POICA03",

                                /*Monthly visit probucol phase A*/
                                "POIMA01","POIMA02","POIMA03",

                                /*Weekly visit probucol phase B*/
                                "POIWB00","POIWB01","POIWB02","POIWB03",

                                /*Probucol lumbar puncture phase B*/
                                "POICB00","POICB12",

                                /*Monthly visit probucol phase B*/
                                "POIMB01","POIMB02","POIMB03",

                                /*Adverse event*/
                                "POIAE00",

                                /*Treatment interruption*/
                                "POITI00",

                                /*******************************************************/
                                /*------------------- Young Cohort --------------------*/
                                /*******************************************************/

                                /*Eligibility*/
                                "YNGEL00",

                                /*Enrollment*/
                                "YNGEN00",

                                /*PET Scan Amyloid*/
                                "YNGPA00",

                                /*PET Scan Choline*/
                                "YNGPC00",

                                /*PET Scan Tau*/
                                "YNGPT00",

                                /*Baseline*/
                                "YNGBL00",

                                /*Lumbar puncture*/
                                "YNGLP00",

                                /*******************************************************/
                                /*-------------------- MCI Cohort  --------------------*/
                                /*******************************************************/

                                /*Eligibility*/
                                "MCIEL00",

                                /*Enrollment*/
                                "MCIEN00",

                                /*Baseline*/
                                "MCIBL00",

                                /*Lumbar puncture*/
                                "MCILP00",

                                /*Follow-up*/
                                "MCIFU00","MCIFU12","MCIFU24","MCIFU36","MCIFU48","MCIFU60","MCIFU72","MCIFU84","MCIFU108","MCIFU120","MCIFU132","MCIFU144","MCIFU156",

                                /*PET Scan Amyloid*/
                                "MCIPA00","MCIPA12","MCIPA24","MCIPA36","MCIPA48","MCIPA60","MCIPA72","MCIPA84","MCIPA108","MCIPA120","MCIPA132","MCIPA144","MCIPA156",

                                /*PET Scan Choline*/
                                "MCIPC00","MCIPC12","MCIPC24","MCIPC36","MCIPC48","MCIPC60","MCIPC72","MCIPC84","MCIPC108","MCIPC120","MCIPC132","MCIPC144","MCIPC156",

                                /*PET Scan Tau*/
                                "MCIPT00","MCIPT12","MCIPT24","MCIPT36","MCIPT48","MCIPT60","MCIPT72","MCIPT84","MCIPT108","MCIPT120","MCIPT132","MCIPT144","MCIPT156",

                                /*******************************************************/
                                /*-------------------- CTL Cohort  --------------------*/
                                /*******************************************************/

                                /*Eligibility*/
                                "CTLEL00",

                                /*Enrollment*/
                                "CTLEN00",

                                /*Baseline*/
                                "CTLBL00",

                                /*Lumbar puncture*/
                                "CTLLP00",

                                /*******************************************************/
                                /*-------------------- DETECT Cohort  -----------------*/
                                /*******************************************************/

                                /*Eligibility*/
                                "DETEL00",

                                /*Enrollment*/
                                "DETEN00",

                                /*Adverse Event*/
                                "DETAE00","DETAE12", "DETAE24", "DETAE36","DETAE48","DETAE60","DETAE72","DETAE84","DETAE108","DETAE120","DETAE132","DETAE144","DETAE156",

                                /*Baseline*/
                                "DETBL00",

                                /*Lumbar puncture*/
                                "DETLP00",

                                /*Follow-up*/
                                "DETFU00","DETFU12","DETFU24","DETFU36","DETFU48","DETFU60","DETFU72","DETFU84","DETFU108","DETFU120","DETFU132","DETFU144","DETFU156",

                                /*PET Scan Amyloid*/
                                "DETPA00","DETPA12","DETPA24","DETPA36","DETPA48","DETPA60","DETPA72","DETPA84","DETPA108","DETPA120","DETPA132","DETPA144","DETPA156",

                                /*PET Scan Choline*/
                                "DETPC00","DETPC12","DETPC24","DETPC36","DETPC48","DETPC60","DETPC72","DETPC84","DETPC108","DETPC120","DETPC132","DETPC144","DETPC156",

                                /*PET Scan Tau*/
                                "DETPT00","DETPT12","DETPT24","DETPT36","DETPT48","DETPT60","DETPT72","DETPT84","DETPT108","DETPT120","DETPT132","DETPT144","DETPT156");

        if (!in_array($concatTimePoint,$validTimepoints)) {
            $errors['visitLabel1'] = 'Invalid timepoint!';
        }
        return $errors;
    }
}
?>
