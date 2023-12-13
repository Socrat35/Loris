/**
 * Helper script for the F3 instrument' "helper" button. This is a quick and dirty
 * hack and should be removed when the instrument has been refactored.
 *
 * @author Jean-Michel Raoult <jean-michel.raoult.comtl@ssss.gouv.qc.ca>
 */

'use strict';

// jQuery function for waiting until the page is ready
$(document).ready(function() {
  // If the page has the hidden element indicating that it's the 3rd page of f3
  // and the page is not frozen (save button named 'fire_away' present)
  if ($('input[name="page"][value="f3_page3"]').length === 1 &&
      $('input[name="fire_away"]').length === 1) {
    // Use jQuery to create a button node
    let button = $('<button />',
      {
        id: 'auto-fill-button',
        name: 'auto-fill-button',
        text: 'Helper Script',
        class: 'col-md-2 col-md-offset-5 button'
      }
      // wrap it in a div with proper bootstrap class
    ).wrap('<div class="col-md-12"></div>');
    // prepend the wrapped button to the workspace to avoid
    // being in the same form element as the inputs
    button.prependTo($('#lorisworkspace'));
    // Object to map input values to select values for a nullable yes/no select
    let yesNoNA = {
      'Y': 'yes',
      'N': 'no',
      '': 'not_answered'
    };
    // Object to map input values to select values for a nullable not_answered
    // select
    let nullNA = {
      '': '',
      'N': 'not_answered'
    };
    // Object to map input values to select values for a non-nullable substance
    // consumption choice
    let consumptionStatus = {
      'N': 'never',
      'S': 'stopped',
      'Y': 'yes',
      '': 'not_answered'
    };
    // When the dynamically created button is clicked
    $('#auto-fill-button').on('click', function() {
      // Use the validatePrompt function to get the select values for the five
      // first questions
      let answer4A = validatePrompt(
        '4A) Been diagnosed with new disease(s)/condition(s)?\n\n\tY => Yes\n\tN => No\n\t blank => Not Answered',
        yesNoNA);
      let answer4B = validatePrompt(
        '4B) Has a pre-existing disease/condition worsen?\n\n\tY => Yes\n\tN => No\n\t blank => Not Answered',
        yesNoNA);
      let answer5A = validatePrompt(
        '5A) Updates on family history of first degree relative(s) with Alzheimer-like dementia since Eligibility visit?\n\n\tY => Yes\n\tN => No\n\t blank => Not Answered',
        yesNoNA);
      let answer5C = validatePrompt(
        '5C) Do you have a family member who was enrolled in the PREVENT-AD study since your Eligibility visit?\n\n\tY => Yes\n\tN => No\n\t blank => Not Answered',
        yesNoNA);
      let answer5D = validatePrompt(
        '5D) Any changes in habits since your Eligibility visit?\n\n\tY => Yes\n\tN => No\n\t blank => Not Answered',
        yesNoNA);
      // Initialize and set to empty string the variables for the questions
      // that can be skipped given the value of the preceding question
      let answer6 = '';
      let answer6Explanation = '';
      let answer6ExplanationStatus = '';
      let answer7 = '';
      let answer7Explanation = '';
      let answer7ExplanationStatus = '';
      let answer8 = '';
      let answer8Explanation1 = '';
      let answer8Explanation1Status = '';
      let answer8Explanation2 = '';
      let answer8Explanation2Status = '';
      let answer9 = '';
      let answer9Explanation1 = '';
      let answer9Explanation1Status = '';
      let answer9Explanation2 = '';
      let answer9Explanation2Status = '';
      let answer10 = '';
      let answer10Explanation1 = '';
      let answer10Explanation1Status = '';
      let answer10Explanation2 = '';
      let answer10Explanation2Status = '';
      let answer11 = '';
      let answer11Explanation1 = '';
      let answer11Explanation1Status = '';
      let answer11Explanation2 = '';
      let answer11Explanation2Status = '';
      let answer12 = '';
      let answer12Explanation1 = '';
      let answer12Explanation1Status = '';
      let answer12Explanation2 = '';
      let answer12Explanation2Status = '';
      let answer13 = '';
      // If the value of the question 5D is yes, prompt for all questions
      if (answer5D === 'yes') {
        // Use the validatePrompt question to get the values and assign to
        // initialized variables
        answer6 = validatePrompt(
          '6) Appetite habits\n\n\tN => Normal\n\tA => Abnormal\n\t blank => Not Answered',
          {
            'N': 'normal',
            'A': 'abnormal',
            '': 'not_answered'
          }
        );
        // if the answer matches the criteria, prompt for the explanation
        answer6Explanation =
          answer6 === 'abnormal' ?
            window.prompt('If appetite is abnormal, please specify.') :
            '';
        // if the answer matches the criteria and the explanation is empty,
        // prompt for status
        answer6ExplanationStatus =
          answer6 === 'abnormal' && answer6Explanation === '' ?
            validatePrompt(
              '6) Availability of justification for appetite\n\n\tN => Not answered\n\t blank => blank',
              nullNA) :
            '';
        answer7 = validatePrompt(
          '7) Sleeping habits\n\n\tN => Normal\n\tA => Abnormal\n\t blank => Not Answered',
          {
            'N': 'normal',
            'A': 'abnormal',
            '': 'not_answered'
          }
        );
        answer7Explanation =
          answer7 === 'abnormal' ?
            window.prompt('If sleeping is abnormal, please specify.') :
            '';
        answer7ExplanationStatus =
          answer7 === 'abnormal' && answer7Explanation === '' ?
            validatePrompt(
              '7) Availability of justification for sleeping\n\n\tN => Not answered\n\t blank => blank',
              nullNA) :
            '';
        answer8 = validatePrompt(
          '8) Cigarette smoking\n\n\tN => Never\n\tS => Stopped\n\tY => Yes\n\tblank => Not Answered',
          consumptionStatus);
        answer8Explanation1 =
          answer8 === 'stopped' ?
            window.prompt('If stopped using cigarettes, when?') :
            '';
        answer8Explanation1Status =
          answer8 === 'stopped' && answer8Explanation1 === '' ?
            validatePrompt(
              '8) Availability of justification for when cigarettes consumption stopped\n\n\tN => Not answered\n\t blank => blank',
              nullNA) :
            '';
        answer8Explanation2 =
          answer8 === 'yes' ?
            window.prompt('If yes, using cigarettes, please specify quantity') :
            '';
        answer8Explanation2Status =
          answer8 === 'yes' && answer8Explanation2 === '' ?
            validatePrompt(
              '8) Availability of justification on the quantity of cigarettes\n\n\tN => Not answered\n\t blank => blank',
              nullNA) :
            '';
        answer9 = validatePrompt(
          '9) Cigar smoking\n\n\tN => Never\n\tS => Stopped\n\tY => Yes\n\tblank => Not Answered',
          consumptionStatus);
        answer9Explanation1 =
          answer9 === 'stopped' ?
            window.prompt('If cigar smoking stopped, when?') :
            '';
        answer9Explanation1Status =
          answer9 === 'stopped' && answer9Explanation1 === '' ?
            validatePrompt(
              '9) Availability of justification for when the cigar smoking stopped\n\n\tN => Not answered\n\t blank => blank',
              nullNA) :
            '';
        answer9Explanation2 =
          answer9 === 'yes' ?
            window.prompt('If yes, cigar smoking, please specify quantity') :
            '';
        answer9Explanation2Status =
          answer9 === 'yes' && answer9Explanation2 === '' ?
            validatePrompt(
              '9) Availability of justification on the quantity of cigar smoking\n\n\tN => Not answered\n\t blank => blank',
              nullNA) :
            '';
        answer10 = validatePrompt(
          '10) Pipe smoking\n\n\tN => Never\n\tS => Stopped\n\tY => Yes\n\tblank => Not Answered',
          consumptionStatus);
        answer10Explanation1 =
          answer10 === 'stopped' ?
            window.prompt('If stopped pipe smoking, when?') :
            '';
        answer10Explanation1Status =
          answer10 === 'stopped' && answer10Explanation1 === '' ?
            validatePrompt(
              '10) Availability of justification for when the pipe smoking stopped\n\n\tN => Not answered\n\t blank => blank',
              nullNA) :
            '';
        answer10Explanation2 =
          answer10 === 'yes' ?
            window.prompt('If yes, pipe smoking, please specify quantity') :
            '';
        answer10Explanation2Status =
          answer10 === 'yes' && answer10Explanation2 === '' ?
            validatePrompt(
              '10) Availability of justification on the quantity of pipe smoking\n\n\tN => Not answered\n\t blank => blank',
              nullNA) :
            '';
        answer11 = validatePrompt(
          '11) Drug consumption\n\n\tN => Never\n\tS => Stopped\n\tY => Yes\n\tblank => Not Answered',
          consumptionStatus);
        answer11Explanation1 =
          answer11 === 'stopped' ?
            window.prompt('If stopped using drugs, when?') :
            '';
        answer11Explanation1Status =
          answer11 === 'stopped' && answer11Explanation1 === '' ?
            validatePrompt(
              '11) Availability of justification for when the drug usage stopped\n\n\tN => Not answered\n\t blank => blank',
              nullNA) :
            '';
        answer11Explanation2 =
          answer11 === 'yes' ?
            window.prompt('If yes, using drugs, please specify quantity') :
            '';
        answer11Explanation2Status =
          answer11 === 'yes' && answer11Explanation2 === '' ?
            validatePrompt(
              '11) Availability of justification on the quantity drugs used\n\n\tN => Not answered\n\t blank => blank',
              nullNA) :
            '';
        answer12 = validatePrompt(
          '12) Alcohol consumption\n\n\tN => Never\n\tS => Stopped\n\tY => Yes\n\tblank => Not Answered',
          consumptionStatus);
        answer12Explanation1 =
          answer12 === 'stopped' ?
            window.prompt('If stopped consuming alcohol, when?') :
            '';
        answer12Explanation1Status =
          answer12 === 'stopped' && answer12Explanation1 === '' ?
            validatePrompt('12) Availability of justification for when the alcohol consumption stopped\n\n\tN => Not answered\n\t blank => blank',
              nullNA) :
            '';
        answer12Explanation2 =
          answer12 === 'yes' ?
            window.prompt('If yes, consuming alcohol, please specify quantity') :
            '';
        answer12Explanation2Status =
          answer12 === 'yes' && answer12Explanation2 === '' ?
            validatePrompt(
              '12) Availability of justification on the quantity of alcohol consumed\n\n\tN => Not answered\n\t blank => blank',
              nullNA) :
            '';
        answer13 = validatePrompt(
          '13) Is there any abuse or dependence?\n\n\tY => Yes\n\tN => No\n\tblank => Not Answered',
          yesNoNA
        );
      }
      let answer14 = window.prompt('14) Description of physical activity (type and hours per week)');
      let answer14Status = answer14 === '' ?
        validatePrompt(
        'Availability of the description of physical activity\n\n\tN => Not Answered\n\tblank => blank',
        nullNA) :
        '';
      let answer14Level = validatePrompt(
        '14) Physical activity level\n\n\tL => Light Intensity\n\tRL => Regular Light Intensity\n\tRM => Regular Moderate Intensity\n\tRH => Regular Heavy Intensity\n\tblank => Not Answered',
        {
          'L': 'light_intensity',
          'RL': 'reg_light_intensity',
          'RM': 'reg_mod_intensity',
          'RH': 'reg_high_intensity',
          '': 'not_answered'
        });
      let answer6primeA = validatePrompt(
        '6\'A) Was blood collected for routine labs at this visit?\n\n\tY => Yes\n\tN => No\n\tblank => Not Answered',
        yesNoNA);
      let answer6primeAJustification =
        answer6primeA === 'no' ?
          window.prompt('If no, no blood collected for routine labs, reason') :
          '';
      let answer6primeAJustificationStatus =
        answer6primeA === 'no' && answer6primeAJustification === '' ?
          validatePrompt(
            'Availability of the justification for the absence of blood collection for labs\n\n\tblank => blank\n\tN => Not Answered',
            nullNA) :
          '';
      let answer6primeB = validatePrompt(
        '6\'B) Was blood collected for biosamples at this visit?\n\n\tY => Yes\n\tN => No\n\tblank => Not Answered',
        yesNoNA);
      let answer6primeBJustification =
        answer6primeB === 'no' ?
          window.prompt('If no, no blood collected for biosamples, reason') :
          '';
      let answer6primeBJustificationStatus =
        answer6primeB === 'no' && answer6primeBJustification === '' ?
          validatePrompt(
            'Availability of the justification for the absence of blood collection for biosamples\n\n\tblank => blank\n\tN => Not Answered',
            nullNA) :
          '';
      let answer9primeA = window.prompt('Systolic pressure');
      answer9primeA =
        answer9primeA === null ?
          '' :
          answer9primeA;
      let answer9primeAJustification =
        answer9primeA === '' ?
          validatePrompt(
            'Availability of the value for systolic pressure\n\n\tblank => blank\n\tN => Not Answered',
            nullNA) :
          '';
      let answer9primeB = window.prompt('Diastolic pressure');
      answer9primeB =
        answer9primeB === null ?
          '' :
          answer9primeB;
      let answer9primeBJustification =
        answer9primeB === '' ?
          validatePrompt(
            'Availability of the value for diastolic pressure\n\n\tblank => blank\n\tN => Not Answered',
            nullNA) :
          '';
      let answer10prime = validatePrompt(
        '10\') Are the blood pressure values recorded considered to be in the normal range?\n\n\tY => Yes\n\tN => No\n\tblank => Not Answered',
        yesNoNA);
      let answer11primeA = window.prompt('11\') Pulse (/min)');
      answer11primeA =
        answer11primeA === null ?
          '' :
          answer11primeA;
      let answer11primeAJustification =
        answer11primeA === '' ?
          validatePrompt(
            'Availability of the value for pulse\n\n\tblank => blank\n\tN => Not Answered',
            nullNA) :
          '';
      let answer11primeB = validatePrompt(
        '11\'B) Is the pulse regular or irregular?\n\n\tR => Regular\n\tI => Irregular\n\tblank => Not Answered',
        {
          'R': 'regular',
          'I': 'irregular',
          '': 'not_answered'
        }
      );
      let answer12primeA = window.prompt('12\'A) Weight');
      answer12primeA =
        answer12primeA === null ?
          '' :
          answer12primeA;
      let answer12primeAJustification =
        answer12primeA === '' ?
          validatePrompt(
        'Availability of the value for weight\n\n\tblank => blank\n\tN => Not Answered',
        nullNA) :
      '';
      // Use the SweetAlert equivalent of the 'confirm' prompt to display
      // the extracted values as a table matching the visual aspect of
      // the form
      // Note1: the way to call such a function as changed in later
      // versions of SweetAlert
      // Note2: the {$varname} syntax might look like smarty but is,
      // in this case, due to variable substitution on a multi-line
      // string
      swal({
        title: 'AutoFill Values',
        type: 'info',
        showConfirmButton: true,
        showCancelButton: true,
        confirmButtonText: 'Set Values',
        cancelButtonText: 'Cancel',
        closeOnClickOutside: false,
        closeOnEscape: false,
        html: true,
        text: `
                      <p>The values you've provided and the static values have been tabulated.</p>
                      <p>Confirm to transcribe.</p>
`
      }, function() {
        // If the user confirmed the prompt, set the values extracted
        // to matching the matching inputs
        //
        // Static Inputs
        //
        // Question 3) Medical Questionnaire
        $('select[name="3_medical_questionnaire_a"]').val('not_answered');
        $('select[name="3_medical_questionnaire_b"]').val('not_answered');
        $('select[name="3_medical_questionnaire_c"]').val('not_answered');
        // Question 3) Symptoms
        $('select[name="drug_allergy"]').val('not_answered');
        $('select[name="sinusitis"]').val('not_answered');
        $('select[name="smell_loss"]').val('not_answered');
        $('select[name="pruritis"]').val('not_answered');
        $('select[name="urticaria"]').val('not_answered');
        $('select[name="pigmentation_changes"]').val('not_answered');
        $('select[name="erythema_rash"]').val('not_answered');
        $('select[name="bruising"]').val('not_answered');
        $('select[name="petechiae_purpura"]').val('not_answered');
        $('select[name="epistaxis"]').val('not_answered');
        $('select[name="hemoptysis"]').val('not_answered');
        $('select[name="hematemesis"]').val('not_answered');
        $('select[name="melena"]').val('not_answered');
        $('select[name="rectal_bleeding"]').val('not_answered');
        $('select[name="hematochezia"]').val('not_answered');
        $('select[name="vaginal_bleeding"]').val('not_answered');
        $('select[name="hematuria"]').val('not_answered');
        $('select[name="anemia"]').val('not_answered');
        $('select[name="hemorrhage"]').val('not_answered');
        $('select[name="hemorrhage_specify_status"]').val('not_answered');
        $('select[name="urinary_reduction"]').val('not_answered');
        $('select[name="incontinence"]').val('not_answered');
        $('select[name="shortness_of_breath"]').val('not_answered');
        $('select[name="peripheral_oedema"]').val('not_answered');
        $('select[name="unexplained_weight_gain"]').val('not_answered');
        $('select[name="unexplained_weight_loss"]').val('not_answered');
        $('select[name="dysphagia"]').val('not_answered');
        $('select[name="dyspepsia"]').val('not_answered');
        $('select[name="nausea"]').val('not_answered');
        $('select[name="acid_reflux"]').val('not_answered');
        $('select[name="other_abdominal_pain"]').val('not_answered');
        $('select[name="stomatitis_pharyngitis"]').val('not_answered');
        $('select[name="vomiting"]').val('not_answered');
        $('select[name="diarrhea"]').val('not_answered');
        $('select[name="costovertebral_tenderness_back"]').val('not_answered');
        $('select[name="lower_back_pain"]').val('not_answered');
        $('select[name="tinnitus"]').val('not_answered');
        $('select[name="dizziness_vertigo"]').val('not_answered');
        $('select[name="insomnia"]').val('not_answered');
        $('select[name="headache"]').val('not_answered');
        $('select[name="numbness_tingling"]').val('not_answered');
        $('select[name="tremor_shakiness"]').val('not_answered');
        $('select[name="falls"]').val('not_answered');
        $('select[name="fainting_syncopy"]').val('not_answered');
        $('select[name="uncontrolled_high_blood_pressure"]').val('not_answered');
        $('select[name="uncontrolled_hyperglycemia"]').val('not_answered');
        $('select[name="other_symptom1"]').val('not_answered');
        $('select[name="other_symptom1_specify_status"]').val('not_answered');
        $('select[name="other_symptom2"]').val('not_answered');
        $('select[name="other_symptom2_specify_status"]').val('not_answered');
        $('select[name="other_symptom3"]').val('not_answered');
        $('select[name="other_symptom3_specify_status"]').val('not_answered');
        $('select[name="other_symptom4"]').val('not_answered');
        $('select[name="other_symptom4_specify_status"]').val('not_answered');
        $('select[name="other_symptom5"]').val('not_answered');
        $('select[name="other_symptom5_specify_status"]').val('not_answered');
        // Question 4) Since the last visit
        $('select[name="4_new_symptoms"]').val('not_answered');
        // Question 5) Updates on family history
        $('select[name="family_memory"]').val('not_answered');
        // Question 15) Was a physical done at the visit
        $('select[name="physical"]').val('no');
        // Question 16) Rectal examination
        $('select[name="rectal_exam"]').val('no');
        // Question 17) Genital examination
        $('select[name="genital_exam"]').val('no');
        // Question 18) Neurological examination
        $('select[name="neurological_exam"]').val('no');
        // Question 7'A) Urine collection labs
        $('select[name="7_urinalysis_chemstrip"]').val('no');
        $('textarea[name="7_urinalysis_chemstrip_reason"]').val('');
        $('select[name="7_urinalysis_chemstrip_reason_status"]').val('not_answered');
        // Question 7'B) Urine collection biosamples
        $('select[name="7_urine_biosamples"]').val('no');
        $('textarea[name="7_urine_biosamples_reason"]').val('');
        $('select[name="7_urine_biosamples_reason_status"]').val('not_answered');
        // Question 7'C) Glucose
        $('select[name="7_glucose"]').val('not_answered');
        // Question 7'D) Protein
        $('select[name="7_protein"]').val('not_answered');
        // Question 8') EKG
        $('select[name="8_EKG"]').val('no');
        $('textarea[name="8_EKG_no_reason"]').val('');
        $('select[name="8_EKG_no_reason_status"]').val('not_answered');
        // Question 12'A) Weight
        $('select[name="12_weight_units"]').val('kg');
        // Question 12'B)
        $('select[name="5_continue_cohort"]').val('not_answered');
        // Question 12'C)
        $('select[name="5_continue_trial"]').val('not_answered');
        //
        // Prompted values inputs
        //
        // Question 4B) Been diagnosed with new problem

        $('select[name="4_new_conditions"]').val(answer4A);
        // Question 4C) Pre-existing condition worsen
        $('select[name="4_worsened_conditions"]').val(answer4B);
        // Question 5A) Update on family history
        $('select[name="family_update"]').val(answer5A);
        // Question 5C) Family member enrolled since Eligibility
        $('select[name="family_enrollment"]').val(answer5C);
        // Question 5D) Lifestyle updates
        $('select[name="habits_update"]').val(answer5D);
        // Lifestyle habits
        // Appetite
        $('select[name="appetite_habits_update"]').val(answer6);
        $('textarea[name="abnormal_appetite_update"]').val(answer6Explanation);
        $('select[name="abnormal_appetite_update_status"]').val(answer6ExplanationStatus);
        // Sleeping
        $('select[name="sleeping_habits_update"]').val(answer7);
        $('textarea[name="abnormal_sleeping_update"]').val(answer7Explanation);
        $('select[name="abnormal_sleeping_update_status"]').val(answer7ExplanationStatus);
        // Cigarette
        $('select[name="cigarette_smoking_update"]').val(answer8);
        $('textarea[name="cigarette_stopped_update"]').val(answer8Explanation1);
        $('select[name="cigarette_stopped_update_status"]').val(answer8Explanation1Status);
        $('textarea[name="cigarette_yes_update"]').val(answer8Explanation2);
        $('select[name="cigarette_yes_update_status"]').val(answer8Explanation2Status);
        // Cigar
        $('select[name="cigar_smoking_update"]').val(answer9);
        $('textarea[name="cigar_stopped_update"]').val(answer9Explanation1);
        $('select[name="cigar_stopped_update_status"]').val(answer9Explanation1Status);
        $('textarea[name="cigar_yes_update"]').val(answer9Explanation2);
        $('select[name="cigar_yes_update_status"]').val(answer9Explanation2Status);
        // Pipe
        $('select[name="pipe_smoking_update"]').val(answer10);
        $('textarea[name="pipe_stopped_update"]').val(answer10Explanation1);
        $('select[name="pipe_stopped_update_status"]').val(answer10Explanation1Status);
        $('textarea[name="pipe_yes_update"]').val(answer10Explanation2);
        $('select[name="pipe_yes_update_status"]').val(answer10Explanation2Status);
        // Drugs
        $('select[name="drug_consumption_update"]').val(answer11);
        $('textarea[name="drug_stopped_update"]').val(answer11Explanation1);
        $('select[name="drug_stopped_update_status"]').val(answer11Explanation1Status);
        $('textarea[name="drug_yes_update"]').val(answer11Explanation2);
        $('select[name="drug_yes_update_status"]').val(answer11Explanation2Status);
        // Alcohol
        $('select[name="alcohol_consumption_update"]').val(answer12);
        $('textarea[name="alcohol_stopped_update"]').val(answer12Explanation1);
        $('select[name="alcohol_stopped_update_status"]').val(answer12Explanation1Status);
        $('textarea[name="alcohol_yes_update"]').val(answer12Explanation2);
        $('select[name="alcohol_yes_update_status"]').val(answer12Explanation2Status);
        // Dependence
        $('select[name="dependency_update"]').val(answer13);
        // Question 14A) Physical activity description
        $('textarea[name="physical_activity_description_update"]').val(answer14);
        $('select[name="physical_activity_description_update_status"]').val(answer14Status);
        // Question 14B) Physical activity level
        $('select[name="activity_level_update"]').val(answer14Level);
        // Question 6'A) Blood collection for labs
        $('select[name="6_blood_labs"]').val(answer6primeA);
        $('textarea[name="6_blood_labs_reason"]').val(answer6primeAJustification);
        $('select[name="6_blood_labs_reason_status"]').val(answer6primeAJustificationStatus);
        // Question 6'B) Blood collection for biosamples
        $('select[name="6_blood_biosamples"]').val(answer6primeB);
        $('textarea[name="6_blood_biosamples_reason"]').val(answer6primeBJustification);
        $('select[name="6_blood_biosamples_reason_status"]').val(answer6primeBJustificationStatus);
        // Question 9') Blood pressure
        $('input[name="9_systolic_bp"]').val(answer9primeA);
        $('select[name="9_systolic_bp_status"]').val(answer9primeAJustification);
        $('input[name="9_diastolic_bp"]').val(answer9primeB);
        $('select[name="9_diastolic_bp_status"]').val(answer9primeBJustification);
        // Question 10') BP range
        $('select[name="10_bp_range"]').val(answer10prime);
        // Question 11') Pulse
        $('input[name="11_pulse"]').val(answer11primeA);
        $('select[name="11_pulse_status"]').val(answer11primeAJustification);
        $('select[name="11_pulse_regularity"]').val(answer11primeB);
        // Question 12') Weight
        $('input[name="12_weight"]').val(answer12primeA);
        $('select[name="12_weight_status"]').val(answer12primeAJustification);
        // Sending form
        $('input[name="fire_away"]').trigger('click');
      });
    });
  }
});
/**
 * Function which prompts for an input from the user using the default
 * JS utility and checks if the answer provided matches the possible
 * answer given. If it doesn't match, it repeats the prompts until
 * a valid answer is given.
 * @param {string}  text        Text of the question of the prompt
 * @param {object}  answers     Object which maps the possible input values to
 *                              the corresponding output values to be returned
 * @return {string|null}    Expected value from the answers object or null if
 *                          the prompt was canceled
 */
function validatePrompt(text, answers) {
  // Initialize a variable for the answer input
  let answer;
  do {
    // if the answer is defined (any run after the first)
    if (typeof answer !== 'undefined') {
      // alert the user that the answer is invalid
      window.alert('Invalid answer. Please follow the format.');
    }
    // update the answer to the value from the prompt
    answer = window.prompt(text);
    // if the answer is null, the user clicked cancel on the prompt
    if (answer === null) {
      // return a null value
      return answer;
    }
    // transform answer to uppercase
    answer = answer.toUpperCase();
    // while the answer is not a key of the possible answers' object, repeat
  } while (!Object.keys(answers).includes(answer));
  // return the value associated with input given from the answers' object
  return answers[answer];
}
