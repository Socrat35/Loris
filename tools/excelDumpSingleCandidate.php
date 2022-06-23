<?php

// Dumps the database instruments and some accompanying information into Excel formatted files.
// Takes an optional date argument in the format YYYY-MM-DD to limit the SQL queries
// Add 'nofail' to exclude Visits that are marked with 'Failure'
// eg. php excelDump.php 2015-12-25 nofail
// For some large tables, this script requires *a lot* of memory.  Modify the `cli` php.ini for > 256M

// Operation:
// Passes the results from one or more SQL queries to the writeExcel function.

// Future improvements:
// The SQL to pull the instrument data rely on some nasty text matching (ie. where c.PSCID not like '1%').  Ideally, this junk could be purged directly from the DB, and the SQL made more plain.

require_once __DIR__ . "/../vendor/autoload.php";
require_once "generic_includes.php";
require_once "Archive/Tar.php";
//require_once "CouchDB_MRI_Importer.php";

//Default values
$limit_date_instruments = "";
$limit_date = "";
$limit_date_candidates = "";
$nofail = " AND s.Visit_label NOT LIKE 'MCI%' AND s.Visit_label NOT LIKE 'CTL%' ";
$candidate_nofail = false;
$wherenofail = "";
$wherenofailnowhere = "";
$apsnofail = " WHERE session.Visit_label NOT LIKE 'MCI%' AND session.Visit_label NOT LIKE 'CTL%' ";

//Handling arguments passed in
if (!empty($argv)) {
    foreach ($argv as $arg) {
        list($y, $m, $d) = array_map('intval', explode("-", $arg));
        if ($arg == 'nofail') {
            $apsnofail = $apsnofail . " AND session.Visit!='Failure' ";
            $nofail = $nofail . " AND s.Visit!='Failure' and c.CandID = 425566 ";
            $candidate_nofail = true;
            $wherenofail = " WHERE candidate.CandID = 425566 ";
//NOT IN (SELECT CandID FROM session JOIN candidate USING (CandID) WHERE (session.Visit='Failure' AND session.Visit_label LIKE '%EL00%') OR session.Visit_label LIKE 'CTL%') ";
            $wherenofailnowhere = " AND candidate.CandID = 425566 ";
//NOT IN (SELECT CandID FROM session JOIN candidate USING (CandID) WHERE (session.Visit='Failure' AND session.Visit_label LIKE '%EL00%') OR session.Visit_label LIKE 'CTL%') ";
        } elseif (checkdate($m, $d, $y)) {
            $limit_date_instruments = " AND i.Date_taken <= '{$arg}' ";
            $limit_date = " AND mad.AcquisitionDate <= '{$arg}' ";
            $limit_date_candidates = " AND s.Date_visit <= '{$arg}' ";
        }
    }
}

if ($wherenofail == "") {
    $wherenofail = " WHERE candidate.CandID = 425566 ";
//NOT IN (SELECT CandID FROM session JOIN candidate USING (CandID) WHERE session.Visit_label LIKE 'CTL%') ";
}
if ($wherenofailnowhere == "") {
    $wherenofailnowhere = " AND candidate.CandID = 425566 ";
//NOT IN (SELECT CandID FROM session JOIN candidate USING (CandID) WHERE session.Visit_label LIKE 'CTL%') ";
}

//Configuration variables for this script, possibly installation dependent.
//$dataDir = "dataDump" . date("dMy");
$dumpName = "dataDump" . date("dMy"); // label for dump
$config = NDB_Config::singleton();
$paths = $config->getSetting('paths');
$dataDir = $paths['base'] . "tools/$dumpName/"; //temporary working directory
$destinationDir = $paths['base'] . "htdocs/dataDumps"; //temporary working directory

/** Caching to discISAM 1.0*/
//$cacheMethod = PHPExcel_CachedObjectStorageFactory:: cache_to_discISAM;
//$cacheSettings = array( 'dir'  => '/tmp' // If you have a large file you can cache it optional
//                      );
//PHPExcel_Settings::setCacheStorageMethod($cacheMethod, $cacheSettings);

$cacheMethod = PHPExcel_CachedObjectStorageFactory::cache_to_sqlite3;
if (PHPExcel_Settings::setCacheStorageMethod($cacheMethod)) {
    echo date('H:i:s') , " Enable Cell Caching using " , $cacheMethod , " method" , EOL;
} else {
    echo date('H:i:s') , " Unable to set Cell Caching using " , $cacheMethod , " method, reverting to memory" , EOL;
}

/*
* Prepare output/tmp directories, if needed.
*/
//Create
if (!file_exists($dataDir)) {
	mkdir($dataDir);
}
//Create
if (!file_exists($destinationDir)) {
        mkdir($destinationDir);
}

//Delete all previous files.
$d = dir($dataDir);
while($entry = $d->read()) {
	if ($entry!= "." && $entry!= "..") {
		unlink($dataDir . "/" . $entry);
	}
}
$d->close();

//Substitute words for numbers in Subproject data field
function MapSubprojectID(&$results) {
    $projectID = null;
    $subprojectLookup = Utility::getSubprojectList($projectID);

    for ($i = 0; $i < count($results); $i++) {
	    $results[$i]["SubprojectID"] = 
                $subprojectLookup[$results[$i]["SubprojectID"]];
    }
    return $results;
}
/*
* Start with all the instrument tables
*/
//Get the names of all instrument tables
//excluding tsi because data is not complete, therefore should not be analyzed
$query = "select * from test_names where Test_name!='tsi' and Test_name not like 'navigational%' order by Test_name";
//$query = "select * from test_names where Test_name like 'h%' order by Test_name";  //for rapid testing
$DB->select($query, $instruments);

foreach ($instruments as $instrument) {
        $instrument_table = null;
        //Query to pull the data from the DB
        $Test_name = $instrument['Test_name'];
        if ($Test_name == 'prefrontal_task') {
	    $query = "select c.PSCID, c.CandID, s.SubprojectID, s.Visit_label, s.Submitted, s.Current_stage, s.Visit, f.Administration, e.full_name as Examiner_name, f.Data_entry, 'See validity_of_data field' as Validity, i.* from candidate c, session s, flag f, $Test_name i left outer join examiners e on i.Examiner = e.examinerID where c.PSCID not like 'dcc%' and c.PSCID not like '0%' and c.PSCID not like '1%' and c.PSCID not like '2%' and c.PSCID != 'scanner' and i.CommentID not like 'DDE%' and c.CandID = s.CandID and s.ID = f.sessionID and f.CommentID = i.CommentID AND c.Active='Y' AND s.Active='Y' AND c.PSCID not like 'MTL0000' AND c.PSCID not like 'MTL999%' " . $limit_date_instruments . $nofail . " order by s.Visit_label, c.PSCID";
        } else if ($Test_name == 'radiology_review') {
            $query = "select c.PSCID, c.CandID, s.SubprojectID, s.Visit_label, s.Submitted, s.Current_stage, s.Visit, f.Administration, e.full_name as Examiner_name, f.Data_entry, f.Validity, 'Site review:', i.*, 'Final Review:', COALESCE(fr.Review_Done, 0) as Review_Done, fr.Final_Review_Results, fr.Final_Exclusionary, fr.Final_Incidental_Findings, fre.full_name as Final_Examiner_Name, fr.Final_Review_Results2, fre2.full_name as Final_Examiner2_Name, fr.Final_Exclusionary2, COALESCE(fr.Review_Done2, 0) as Review_Done2, fr.Final_Incidental_Findings2, fr.Finalized from candidate c, session s, flag f, $Test_name i left join final_radiological_review fr ON (fr.CommentID=i.CommentID) left outer join examiners e on (i.Examiner = e.examinerID) left join examiners fre ON (fr.Final_Examiner=fre.examinerID) left join examiners fre2 ON (fre2.examinerID=fr.Final_Examiner2) where c.PSCID not like 'dcc%' and c.PSCID not like '0%' and c.PSCID not like '1%' and c.PSCID not like '2%' and c.PSCID != 'scanner' and i.CommentID not like 'DDE%' and c.CandID = s.CandID and s.ID = f.sessionID and f.CommentID = i.CommentID AND c.Active='Y' AND s.Active='Y' AND c.PSCID not like 'MTL0000' AND c.PSCID not like 'MTL999%' AND Scan_done='Y' " . $limit_date_instruments . $nofail . " order by s.Visit_label, c.PSCID";
        } else if ($Test_name == 'genetics') {
            $query = "select candidate.CandID, g.* from genetics g JOIN candidate USING (PSCID) " . $wherenofail;
        } else if ($Test_name == 'adverse_events') {
            $instrument =& NDB_BVL_Instrument::factory($Test_name, '', false);
            $query = "select c.PSCID, c.CandID, s.SubprojectID, s.Visit_label, s.Submitted, s.Current_stage, s.Visit, f.Administration, e.full_name as Examiner_name, f.Data_entry, ";
            $query .= " i.CommentID, i.UserID, i.Examiner, i.Testdate, i.Data_entry_completion_status, i.Date_taken, i.Candidate_Age, i.Window_Difference, i.event_comments, ";
            for ($i = 1; $i < 51; $i++) {
                $query .= " {$i}_event, {$i}_event_status, {$i}_start_date_date, {$i}_start_date_date_status, {$i}_start_date_accuracy, {$i}_end_date_date, {$i}_end_date_date_status, {$i}_end_date_accuracy, {$i}_severity, {$i}_SAE, {$i}_relationship, {$i}_action, {$i}_action_status, {$i}_reported, {$i}_date_reported_date, {$i}_date_reported_date_status, (select PT_DESCRIPTION from meddra_pt where PT_ID={$i}_meddra_pt) as {$i}_PT, (select SOC_DESCRIPTION from meddra_soc where SOC_ID={$i}_meddra_soc) as {$i}_SOC, ";
            }
            $query .= " i.ae_no_end_date from candidate c, session s, flag f, $Test_name i left outer join examiners e on i.Examiner = e.examinerID where c.PSCID not like 'dcc%' and c.PSCID not like '0%' and c.PSCID not like " . 
            " '1%' and c.PSCID not like '2%' and c.PSCID != 'scanner' and i.CommentID not like 'DDE%' and c.CandID = s.CandID and s.ID = f.sessionID and f.CommentID = i.CommentID AND c.Active='Y' AND s.Active='Y' " . 
            " AND c.PSCID not like 'MTL0000' AND c.PSCID not like 'MTL999%' " . $limit_date_instruments . $nofail . " order by s.Visit_label, c.PSCID";
            $DB->select($query, $instrument_table_tmp);

            $query = "select c.PSCID, c.CandID, s.SubprojectID, s.Visit_label, s.Submitted, s.Current_stage, s.Visit, f.Administration, e.full_name as Examiner_name, f.Data_entry, ";
            $query .= " i.CommentID, i.UserID, i.Examiner, i.Testdate, i.Data_entry_completion_status, i.Date_taken, i.Candidate_Age, i.Window_Difference, i.event_comments, ";
            for ($i = 51; $i < 91; $i++) {
                $query .= " {$i}_event, {$i}_event_status, {$i}_start_date_date, {$i}_start_date_date_status, {$i}_start_date_accuracy, {$i}_end_date_date, {$i}_end_date_date_status, {$i}_end_date_accuracy, {$i}_severity, {$i}_SAE, {$i}_relationship, {$i}_action, {$i}_action_status, {$i}_reported, {$i}_date_reported_date, {$i}_date_reported_date_status, (select PT_DESCRIPTION from meddra_pt where PT_ID={$i}_meddra_pt) as {$i}_PT, (select SOC_DESCRIPTION from meddra_soc where SOC_ID={$i}_meddra_soc) as {$i}_SOC, ";
            }
            $query .= " i.ae_no_end_date from candidate c, session s, flag f, $Test_name i left outer join examiners e on i.Examiner = e.examinerID where c.PSCID not like 'dcc%' and c.PSCID not like '0%' and c.PSCID not like " . 
            " '1%' and c.PSCID not like '2%' and c.PSCID != 'scanner' and i.CommentID not like 'DDE%' and c.CandID = s.CandID and s.ID = f.sessionID and f.CommentID = i.CommentID AND c.Active='Y' AND s.Active='Y' " . 
            " AND c.PSCID not like 'MTL0000' AND c.PSCID not like 'MTL999%' " . $limit_date_instruments . $nofail . " order by s.Visit_label, c.PSCID";
            $DB->select($query, $instrument_table_tmp2);
            for ($i = 0; $i < count($instrument_table_tmp); $i++) {
                $instrument_table[] = array_merge($instrument_table_tmp[$i], $instrument_table_tmp2[$i]);
            }
        } else {
            if (is_file("../project/instruments/NDB_BVL_Instrument_$Test_name.class.inc")) {
                $instrument =& NDB_BVL_Instrument::factory($Test_name, '', false);
	        $query = "select c.PSCID, c.CandID, s.SubprojectID, s.Visit_label, s.Submitted, s.Current_stage, s.Visit, f.Administration, e.full_name as Examiner_name, f.Data_entry, i.* from candidate c, session s, flag f, $Test_name i left outer join examiners e on i.Examiner = e.examinerID where c.PSCID not like 'dcc%' and c.PSCID not like '0%' and c.PSCID not like '1%' and c.PSCID not like '2%' and c.PSCID != 'scanner' and i.CommentID not like 'DDE%' and c.CandID = s.CandID and s.ID = f.sessionID and f.CommentID = i.CommentID AND c.Active='Y' AND s.Active='Y' AND c.PSCID not like 'MTL0000' AND c.PSCID not like 'MTL999%' " . $limit_date_instruments . $nofail . " order by s.Visit_label, c.PSCID";
            } else {
	        $query = "select c.PSCID, c.CandID, s.SubprojectID, s.Visit_label, s.Submitted, s.Current_stage, s.Visit, f.Administration, e.full_name as Examiner_name, f.Data_entry, f.Validity, i.* from candidate c, session s, flag f, $Test_name i left outer join examiners e on i.Examiner = e.examinerID where c.PSCID not like 'dcc%' and c.PSCID not like '0%' and c.PSCID not like '1%' and c.PSCID not like '2%' and c.PSCID != 'scanner' and i.CommentID not like 'DDE%' and c.CandID = s.CandID and s.ID = f.sessionID and f.CommentID = i.CommentID AND c.Active='Y' AND s.Active='Y' AND c.PSCID not like 'MTL0000' AND c.PSCID not like 'MTL999%' " . $limit_date_instruments . $nofail . " order by s.Visit_label, c.PSCID";
            }
        }
	if ($Test_name != 'adverse_events') {
            $DB->select($query, $instrument_table);
        }
    MapSubprojectID($instrument_table);
	writeExcel($Test_name, $instrument_table, $dataDir);

} //end foreach instrument

/*
* Candidate Information query
*/
$Test_name = "candidate_info";
//this query is a but clunky, but it gets rid of all the crap that would otherwise appear.
if ($candidate_nofail) {
    $query = "select distinct c.PSCID, c.CandID, c.Gender, c.Mother_tongue, s.SubprojectID from candidate c, session s where s.SubprojectID IS NOT NULL and s.CenterID <> 1 and s.CenterID in (select CenterID from psc where Study_site='Y') and c.CandID = s.CandID and c.Active='Y' AND c.PSCID not like 'MTL0000' AND c.PSCID not like 'MTL999%' " . $limit_date_candidates . " AND c.CandID = 425566 " .
//NOT IN (SELECT CandID FROM session JOIN candidate USING (CandID) WHERE (session.Visit='Failure' AND session.Visit_label LIKE '%EL00%') OR session.Visit_label LIKE 'CTL%') 
" order by c.PSCID";
} else {
    $query = "select distinct c.PSCID, c.CandID, c.Gender, c.Mother_tongue, s.SubprojectID from candidate c, session s where s.SubprojectID IS NOT NULL and s.CenterID <> 1 and s.CenterID in (select CenterID from psc where Study_site='Y') and c.CandID = s.CandID and c.Active='Y' AND c.PSCID not like 'MTL0000' AND c.PSCID not like 'MTL999%' " . $limit_date_candidates . " AND c.CandID = 425566 " .
// NOT IN (SELECT CandID FROM session JOIN candidate USING (CandID) WHERE session.Visit_label LIKE 'CTL%') 
" order by c.PSCID";
}
$DB->select($query, $results);
MapSubprojectID($results);
writeExcel($Test_name, $results, $dataDir);

/*
* Data Dictionary construction
* This relies on the quickform_parser and data_dictionary_builder having being recently run
*/
$Test_name = "DataDictionary";
$query = "select Name, Type, Description, SourceField, SourceFrom from parameter_type where SourceField is not null and SourceFrom not like 'navigational%' and SourceFrom!='tsi' order by SourceFrom";
$DB->select($query, $dictionary);
writeExcel($Test_name, $dictionary, $dataDir);

/*
* Participant Status
*/
$Test_name = "ParticipantStatus";
$query = "select candidate.PSCID, candidate.CandID, naproxen_ITT, naproxen_mITT, MCI_converter, MCI_converter_confirmed_onset, naproxen_treatment_assignment, data_changed_date, data_entry_date, pso.Description as 'Participant Status Description', reason_specify, reason_specify_status, withdrawal_reasons, withdrawal_reasons_other_specify, withdrawal_reasons_other_specify_status, naproxen_eligibility, naproxen_eligibility_reason_specify, naproxen_eligibility_reason_specify_status, naproxen_eligibility_status, naproxen_excluded_reason_specify, naproxen_excluded_reason_specify_status, naproxen_withdrawal_reasons, naproxen_withdrawal_reasons_other_specify, naproxen_withdrawal_reasons_other_specify_status, probucol_eligibility, probucol_eligibility_status, probucol_eligibility_reason_specify, probucol_eligibility_reason_specify_status, probucol_excluded_reason_specify, probucol_excluded_reason_specify_status, probucol_withdrawal_reasons, probucol_withdrawal_reasons_other_specify, probucol_withdrawal_reasons_other_specify_status from participant_status as psh join candidate on (candidate.CandID=psh.CandID) join participant_status_options as pso on (psh.participant_status=pso.ID) where candidate.PSCID not like 'MTL0000' AND candidate.PSCID not like 'MTL999%' " . $wherenofailnowhere . " and candidate.candid= 425566 order by candidate.PSCID asc";
$DB->select($query, $participantstatus);
writeExcel($Test_name, $participantstatus, $dataDir);

/*
* Participant Status History
*/
$Test_name = "ParticipantStatusHistory";
$query = "select candidate.PSCID, candidate.CandID, naproxen_ITT, naproxen_mITT, MCI_converter, MCI_converter_confirmed_onset, naproxen_treatment_assignment, data_changed_date, data_entry_date, pso.Description as 'Participant Status Description', reason_specify, reason_specify_status, withdrawal_reasons, withdrawal_reasons_other_specify, withdrawal_reasons_other_specify_status, naproxen_eligibility, naproxen_eligibility_reason_specify, naproxen_eligibility_reason_specify_status, naproxen_eligibility_status, naproxen_excluded_reason_specify, naproxen_excluded_reason_specify_status, naproxen_withdrawal_reasons, naproxen_withdrawal_reasons_other_specify, naproxen_withdrawal_reasons_other_specify_status, probucol_eligibility, probucol_eligibility_status, probucol_eligibility_reason_specify, probucol_eligibility_reason_specify_status, probucol_excluded_reason_specify, probucol_excluded_reason_specify_status, probucol_withdrawal_reasons, probucol_withdrawal_reasons_other_specify, probucol_withdrawal_reasons_other_specify_status from participant_status_history as psh join candidate on (candidate.CandID=psh.CandID) join participant_status_options as pso on (psh.participant_status=pso.ID) where candidate.PSCID not like 'MTL0000' AND candidate.PSCID not like 'MTL999%' " . $wherenofailnowhere . " and candidate.candid=425566 order by candidate.PSCID asc";
$DB->select($query, $participantstatus);
writeExcel($Test_name, $participantstatus, $dataDir);

/*
* Family History AD Other
*/
$Test_name = "FamilyHistoryADOther";
$query = "select PSCID, family_history_ad_other.CandID, family_member, parental_side, ad_dementia_age, living_age, death_age, death_cause, death_cause_status from family_history_ad_other join candidate on family_history_ad_other.CandID=candidate.CandID where PSCID not like '%MTL999%' and PSCID not like 'MTL0000' and candidate.candid = 425566 " . $wherenofailnowhere . " order by PSCID";
$DB->select($query, $familyhistoryadother);
writeExcel($Test_name, $familyhistoryadother, $dataDir);
/*
* Family History First Degree
*/
$Test_name = "FamilyHistoryFirstDegree";
$query = "select PSCID, family_history_first_degree.CandID, family_member, living_age, death_age, death_cause, death_cause_status, ad_dementia, ad_dementia_age, diagnosis_history, diagnosis_history_status from family_history_first_degree join candidate on family_history_first_degree.CandID=candidate.CandID where PSCID not like '%MTL999%' and PSCID not like 'MTL0000' and candidate.candid = 425566 " . $wherenofailnowhere . " order by PSCID";
$DB->select($query, $familyhistoryfirstdegree);
writeExcel($Test_name, $familyhistoryfirstdegree, $dataDir);
/*
* Family History Memory Problem Other
*/
$Test_name = "FamilyHistoryMemoryProblemOther";
$query = "select PSCID, family_history_memory_problem_other.CandID, family_member, parental_side, other_memory_problems, other_memory_problems_status, living_age, death_age, death_cause, death_cause_status from family_history_memory_problem_other join candidate on family_history_memory_problem_other.CandID=candidate.CandID where PSCID not like '%MTL999%' and PSCID not like 'MTL0000' and candidate.candid = 425566 " . $wherenofailnowhere . " order by PSCID";
$DB->select($query, $familyhistorymemoryproblemother);
writeExcel($Test_name, $familyhistorymemoryproblemother, $dataDir);

/*
* Family Information
*/
$Test_name = "FamilyInformation";
$query = "select PSCID, family_information.CandID, entry_staff, related_participant_PSCID, related_participant_CandID, related_participant_status_degree, related_participant_status, related_participant_status_specify from family_information join candidate on family_information.CandID=candidate.CandID where PSCID not like '%MTL999%' and PSCID not like 'MTL0000' and candidate.candid=425566 " . $wherenofailnowhere . " order by PSCID";
$DB->select($query, $familyinformation);
writeExcel($Test_name, $familyinformation, $dataDir);

/*
* Drug Compliance
*/
$Test_name = "DrugCompliance";
$query = "select PSCID, drug_compliance.CandID, entry_staff, drug, visit_label, drug_issued_date, drug_issued_date_status, pills_issued, pills_issued_status, drug_returned_date, drug_returned_date_status, pills_returned, pills_returned_status, compliance_evaluation, compliance_evaluation_status, behavioral_compliance_evaluation, behavioral_compliance_evaluation_status, comments, comments_status from drug_compliance join candidate on drug_compliance.CandID=candidate.CandID where candidate.candid=425566 and PSCID not like '%MTL999%' and PSCID not like 'MTL0000' " . $wherenofailnowhere . " order by PSCID";
$DB->select($query, $drugcompliance);
writeExcel($Test_name, $drugcompliance, $dataDir);

/*
* Treatment Duration
*/
$Test_name = "TreatmentDuration";
$query = "select PSCID, td.CandID, td.Trial, td.treatment_duration from treatment_duration td join candidate using (CandID) where PSCID not like '%MTL999%' and PSCID not like 'MTL0000' " . $wherenofailnowhere . " and candidate.candid=425566 order by PSCID";
$DB->select($query, $treatmentduration);
writeExcel($Test_name, $treatmentduration, $dataDir);

 /*
* MedDRA PT
*/
$Test_name = "MedDRAPT";
$query = "select * from meddra_pt order by PT_ID";
$DB->select($query, $meddrapt);
writeExcel($Test_name, $meddrapt, $dataDir);

/*
* MedDRA SOC
*/
$Test_name = "MedDRASOC";
$query = "select * from meddra_soc order by SOC_ID";
$DB->select($query, $meddrasoc);
writeExcel($Test_name, $meddrasoc, $dataDir);

/*
* APS
*/
$Test_name = "APS";
$query = "select PSCID, CandID, Visit_label, Main_APS_with_CSF from APS join session on (APS.SessionID=session.ID) join candidate using (CandID) " . $apsnofail . " and candidate.candid=425566 order by PSCID";
$DB->select($query, $aps);
writeExcel($Test_name, $aps, $dataDir);


/*
* MRI feedbacks
*/
//List of all scan types we want MRI feedbacks for
$query = "select * from mri_scan_type order by Scan_type";
//$query = "select * from test_names where Test_name like 'a%' order by Test_name";  //for rapid testing
$DB->select($query, $scan_types);
//loop through all scan types
foreach ($scan_types as $scan_type) {
    //Query to pull the data from the DB
    $Test_name = $scan_type['Scan_type']; # general query

    if ((preg_match("/bval/", $Test_name))
         or (preg_match("/Report/", $Test_name))
         or (preg_match("/qc/", $Test_name))
         or (preg_match("/rgb/", $Test_name))
         or (preg_match("/Siemens/", $Test_name))
         or (preg_match("/HighRes/", $Test_name))
         or (preg_match("/qT2starEcho[2-8]/", $Test_name))
         or (preg_match("/MP2RAGEinv/", $Test_name))
         or (preg_match("/MultiShellDWI/", $Test_name))
         or ($Test_name == 'MP2RAGEuni')
         or ($Test_name == 'MP2RAGEt1map')
         or ($Test_name == 'FinalQCedDTI')
         or ($Test_name == 'QCedDTI')) {
        continue;
    } elseif (preg_match("/noRegQCedDTI/i", $Test_name)) {
        $query = file_get_contents("MRI_feedbacks_FinalQCedDWI_query.sql");
        $query .= ' WHERE f.File LIKE "%\_' . $Test_name . '\_%" ' . $limit_date . $nofail . ' GROUP BY f.File';
    } elseif (($Test_name == 'Encoding') or ($Test_name == 'Retrieval')) {
        $query = file_get_contents("MRI_feedbacks_query.sql");
        $query .= ' WHERE f.File LIKE "%\_' . $Test_name . '\_%" ' . $limit_date . $nofail . ' AND Visit_label NOT LIKE "%EN00%" GROUP BY f.File';
    } else {
        $query = file_get_contents("MRI_feedbacks_query.sql");
        $query .= ' WHERE f.File LIKE "%\_' . $Test_name . '\_%" ' . $limit_date . $nofail . ' GROUP BY f.File';
    }

    $DB->select($query, $scan_type_table);
    MapSubprojectID($scan_type_table);
    writeExcel("mri_feedbacks_$Test_name", $scan_type_table, $dataDir);
}
/*
//MRI data construction
//Using CouchDBMRIImporter since same data is imported to DQT.
$Test_name = "MRI_Data";
$mriData = new CouchDBMRIImporter();
$scanTypes = $mriData->getScanTypes();
$candidateData = $mriData->getCandidateData($scanTypes);
$mriDataDictionary = $mriData->getDataDictionary($scanTypes);

//add all dictionary names as excel column headings
foreach($mriDataDictionary as $dicKey=>$dicVal)
{
    //if column not already present
    if (!array_key_exists($dicKey, $candidateData[0]))
    {
        $candidateData[0][$dicKey] = NULL;
    }
}

writeExcel($Test_name, $candidateData, $dataDir);
*/
// disabling .tgz compression format
/*// Clean up
// tar and gzip the product
$tarFile = $dumpName . ".tgz"; // produced dump file name and extension
$tar = new Archive_Tar($tarFile, "gz");
$tar->add("./$dumpName/")
or die ("Could not add files!");

// mv (or as php calls it, 'rename') to a web-accessible pickup directory
rename("./$tarFile", "$destinationDir/$tarFile"); //change, if not a subdirectory

// rm left-over junk, from all that excel file generation.
delTree($dataDir);

// Announce completion
echo "$tarFile ready in $destinationDir\n";
*/

// enabling .zip compression format
$zipFile = $dumpName . ".zip";
$zip = new ZipArchive();

if ($zip->open($zipFile, ZipArchive::CREATE)!==TRUE) {
    exit("cannot open <$zipFile>\n");
}

$zip->addGlob("$dumpName/*")
or die ("Could not add files!");

$zip->close();

rename("./$zipFile", "$destinationDir/$zipFile"); //change, if not a subdirectory

delTree($dataDir);

echo "$zipFile ready in $destinationDir\n";

/**
* Converts the column number into the excel column name in letters
* 
* @param int $num The column number
* 
* @return string $letter The excel column name in letters
* 
**/
function getNameFromNumber($num)
{
    $numeric = $num % 26;
    $letter  = chr(65 + $numeric);
    $num2    = intval($num / 26);
    if ($num2 > 0) {
        return getNameFromNumber($num2 - 1) . $letter;
    } else {
        return $letter;
    }
}


/**
 * Takes a 2D array and saves it as a nicely formatted Excel spreadsheet.
 * Metadata columns are preserved, multiple worksheets are used, when appropriate and headers are maintained.
 *
 * @param string	$Test_name	File name to be used.
 * @param unknown_type $instrument_table 	A 2D array of the data to be presented in Excel format
 * @param unknown_type $dataDir The  output directory.
 */
function writeExcel ($Test_name, $instrument_table, $dataDir) {
	//    $metaCols = array("PSCID", "CandID", "Visit_label", "Examiner_name", "Data_entry_completion_status", "Date_taken"); //metadata columns
	$junkCols = array("CommentID", "UserID", "Examiner", "Testdate", "Data_entry_completion_status"); //columns to be removed

	// create empty Excel file to fill up
    // Create a new PHPExcel Object
    $ExcelApplication = new PHPExcel();
    $ExcelWorkSheet = $ExcelApplication->getSheet(0);

	//ensure non-empty result set
	if (count($instrument_table) ==0) { //empty result set
		echo "Empty: $Test_name  [Contains no data]\n";
		return; // move on to the next instrument //nothing to save
	}

	//remove any undesired columns that came in from the DB query.
	for ($i = 0; $i < count($instrument_table); $i++) {
		$instrument_table[$i] = array_diff_key($instrument_table[$i], array_flip($junkCols));
	}

	// add all header rows
	$headers = array_keys($instrument_table[0]);
    $ExcelWorkSheet->fromArray($headers, ' ', 'A1');

    // Bold Cyan Column headers
    $numCol = count($instrument_table[0]) - 1;
    $header = 'a1:' . getNameFromNumber($numCol) . '1';
    $ExcelWorkSheet->getStyle($header)->getFill()->setFillType(
        \PHPExcel_Style_Fill::FILL_SOLID
    )->getStartColor()->setARGB('00e0ffff');

    $hor_cen = \PHPExcel_Style_Alignment::HORIZONTAL_CENTER;
    $style   = array(
                'font'      => array('bold' => true),
                'alignment' => array('horizontal' => $hor_cen),
               );
    $ExcelWorkSheet->getStyle($header)->applyFromArray($style);

	// add data to worksheet
    $ExcelWorkSheet->fromArray($instrument_table, ' ', 'A2');

    // Redimension columns to max size of data
    for ($col = 0; $col <= $numCol; $col++) {
        $ExcelWorkSheet->getColumnDimension(
            getNameFromNumber($col)
        )->setAutoSize(true);
    }

	// save file to disk
    print "Creating " . $Test_name . ".xls\n";
    $writer = PHPExcel_IOFactory::createWriter($ExcelApplication, 'Excel2007');
    $writer->save("$dataDir/$Test_name.xls");
    
    unset($ExcelApplication);
} //end function writeExcel

/**
 * PHP equivalent of `rm -rf`
 * This function stolen from PHP manual
 * @param string dir Directory to be recursively deleted, ending with a slash
 *
 */
function delTree($dir) {
	$files = glob( $dir . '*', GLOB_MARK );
	foreach ( $files as $file ){
		if ( substr( $file, -1 ) == '/' ) {
			delTree( $file );
		} else {
			unlink( $file );
		}
	}
	if (is_dir($dir)) rmdir( $dir );
}

?>
