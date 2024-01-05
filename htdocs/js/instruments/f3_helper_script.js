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
        'not_answered' :
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
          'not_answered' :
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
          'not_answered' :
          '';
      let answer9primeA = window.prompt('Systolic pressure');
      answer9primeA =
        answer9primeA === null ?
          '' :
          answer9primeA;
      let answer9primeAJustification =
        answer9primeA === '' ?
          'not_answered' :
          '';
      let answer9primeB = window.prompt('Diastolic pressure');
      answer9primeB =
        answer9primeB === null ?
          '' :
          answer9primeB;
      let answer9primeBJustification =
        answer9primeB === '' ?
          'not_answered' :
          '';
      let answer10prime = answer9primeAJustification === 'not_answered' && answer9primeBJustification === 'not_answered' ?
        'not_answered' :
        validatePrompt(
        '10\') Are the blood pressure values recorded considered to be in the normal range?\n\n\tY => Yes\n\tN => No\n\tblank => Not Answered',
        yesNoNA);
      let answer11primeA = window.prompt('11\') Pulse (/min)');
      answer11primeA =
        answer11primeA === null ?
          '' :
          answer11primeA;
      let answer11primeAJustification =
        answer11primeA === '' ?
          'not_answered' :
          '';
      let answer11primeB = answer11primeAJustification === 'not_answered' ?
        'not_answered' :
        validatePrompt(
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
          'not_answered' :
        '';
      //
      //              Updating inputs
      //
      // Static Inputs
      //
      // Question 3) Medical Questionnaire
      assignValue('select[name="3_medical_questionnaire_a"]');
      assignValue('select[name="3_medical_questionnaire_b"]');
      assignValue('select[name="3_medical_questionnaire_c"]');
      // Question 3) Symptoms
      assignValue('select[name="drug_allergy"]');
      assignValue('select[name="sinusitis"]');
      assignValue('select[name="smell_loss"]');
      assignValue('select[name="pruritis"]');
      assignValue('select[name="urticaria"]');
      assignValue('select[name="pigmentation_changes"]');
      assignValue('select[name="erythema_rash"]');
      assignValue('select[name="bruising"]');
      assignValue('select[name="petechiae_purpura"]');
      assignValue('select[name="epistaxis"]');
      assignValue('select[name="hemoptysis"]');
      assignValue('select[name="hematemesis"]');
      assignValue('select[name="melena"]');
      assignValue('select[name="rectal_bleeding"]');
      assignValue('select[name="hematochezia"]');
      assignValue('select[name="vaginal_bleeding"]');
      assignValue('select[name="hematuria"]');
      assignValue('select[name="anemia"]');
      assignValue('select[name="hemorrhage"]');
      assignValue('select[name="hemorrhage_specify_status"]');
      assignValue('select[name="urinary_reduction"]');
      assignValue('select[name="incontinence"]');
      assignValue('select[name="shortness_of_breath"]');
      assignValue('select[name="peripheral_oedema"]');
      assignValue('select[name="unexplained_weight_gain"]');
      assignValue('select[name="unexplained_weight_loss"]');
      assignValue('select[name="dysphagia"]');
      assignValue('select[name="dyspepsia"]');
      assignValue('select[name="nausea"]');
      assignValue('select[name="acid_reflux"]');
      assignValue('select[name="other_abdominal_pain"]');
      assignValue('select[name="stomatitis_pharyngitis"]');
      assignValue('select[name="vomiting"]');
      assignValue('select[name="diarrhea"]');
      assignValue('select[name="costovertebral_tenderness_back"]');
      assignValue('select[name="lower_back_pain"]');
      assignValue('select[name="tinnitus"]');
      assignValue('select[name="dizziness_vertigo"]');
      assignValue('select[name="insomnia"]');
      assignValue('select[name="headache"]');
      assignValue('select[name="numbness_tingling"]');
      assignValue('select[name="tremor_shakiness"]');
      assignValue('select[name="falls"]');
      assignValue('select[name="fainting_syncopy"]');
      assignValue('select[name="uncontrolled_high_blood_pressure"]');
      assignValue('select[name="uncontrolled_hyperglycemia"]');
      assignValue('select[name="other_symptom1"]');
      assignValue('select[name="other_symptom1_specify_status"]');
      assignValue('select[name="other_symptom2"]');
      assignValue('select[name="other_symptom2_specify_status"]');
      assignValue('select[name="other_symptom3"]');
      assignValue('select[name="other_symptom3_specify_status"]');
      assignValue('select[name="other_symptom4"]');
      assignValue('select[name="other_symptom4_specify_status"]');
      assignValue('select[name="other_symptom5"]');
      assignValue('select[name="other_symptom5_specify_status"]');
      // Question 4) Since the last visit
      assignValue('select[name="4_new_symptoms"]');
      // Question 5) Updates on family history
      assignValue('select[name="family_memory"]');
      // Question 15) Was a physical done at the visit
      assignValue('select[name="physical"]', 'no');
      // Question 16) Rectal examination
      assignValue('select[name="rectal_exam"]', 'no');
      // Question 17) Genital examination
      assignValue('select[name="genital_exam"]', 'no');
      // Question 18) Neurological examination
      assignValue('select[name="neurological_exam"]', 'no');
      // Question 7'A) Urine collection labs
      assignValue('select[name="7_urinalysis_chemstrip"]', 'no');
      assignValue('textarea[name="7_urinalysis_chemstrip_reason"]', '');
      assignValue('select[name="7_urinalysis_chemstrip_reason_status"]');
      // Question 7'B) Urine collection biosamples
      assignValue('select[name="7_urine_biosamples"]', 'no');
      assignValue('textarea[name="7_urine_biosamples_reason"]', '');
      assignValue('select[name="7_urine_biosamples_reason_status"]');
      // Question 7'C) Glucose
      assignValue('select[name="7_glucose"]');
      // Question 7'D) Protein
      assignValue('select[name="7_protein"]');
      // Question 8') EKG
      assignValue('select[name="8_EKG"]', 'no');
      assignValue('textarea[name="8_EKG_no_reason"]', '');
      assignValue('select[name="8_EKG_no_reason_status"]');
      // Question 12'A) Weight
      assignValue('select[name="12_weight_units"]', 'kg');
      // Question 12'B)
      assignValue('select[name="5_continue_cohort"]');
      // Question 12'C)
      assignValue('select[name="5_continue_trial"]');
      //
      // Prompted values inputs
      //
      // Question 4B) Been diagnosed with new problem
      assignValue('select[name="4_new_conditions"]', answer4A);
      // Question 4C) Pre-existing condition worsen
      assignValue('select[name="4_worsened_conditions"]', answer4B);
      // Question 5A) Update on family history
      assignValue('select[name="family_update"]', answer5A);
      // Question 5C) Family member enrolled since Eligibility
      assignValue('select[name="family_enrollment"]', answer5C);
      // Question 5D) Lifestyle updates
      assignValue('select[name="habits_update"]', answer5D);
      //
      // Lifestyle habits
      //
      // Appetite
      assignValue('select[name="appetite_habits_update"]', answer6);
      assignValue('textarea[name="abnormal_appetite_update"]', answer6Explanation);
      assignValue('select[name="abnormal_appetite_update_status"]', answer6ExplanationStatus);
      // Sleeping
      assignValue('select[name="sleeping_habits_update"]', answer7);
      assignValue('textarea[name="abnormal_sleeping_update"]', answer7Explanation);
      assignValue('select[name="abnormal_sleeping_update_status"]', answer7ExplanationStatus);
      // Cigarette
      assignValue('select[name="cigarette_smoking_update"]', answer8);
      assignValue('textarea[name="cigarette_stopped_update"]', answer8Explanation1);
      assignValue('select[name="cigarette_stopped_update_status"]', answer8Explanation1Status);
      assignValue('textarea[name="cigarette_yes_update"]', answer8Explanation2);
      assignValue('select[name="cigarette_yes_update_status"]', answer8Explanation2Status);
      // Cigar
      assignValue('select[name="cigar_smoking_update"]', answer9);
      assignValue('textarea[name="cigar_stopped_update"]', answer9Explanation1);
      assignValue('select[name="cigar_stopped_update_status"]', answer9Explanation1Status);
      assignValue('textarea[name="cigar_yes_update"]', answer9Explanation2);
      assignValue('select[name="cigar_yes_update_status"]', answer9Explanation2Status);
      // Pipe
      assignValue('select[name="pipe_smoking_update"]', answer10);
      assignValue('textarea[name="pipe_stopped_update"]', answer10Explanation1);
      assignValue('select[name="pipe_stopped_update_status"]', answer10Explanation1Status);
      assignValue('textarea[name="pipe_yes_update"]', answer10Explanation2);
      assignValue('select[name="pipe_yes_update_status"]', answer10Explanation2Status);
      // Drugs
      assignValue('select[name="drug_consumption_update"]', answer11);
      assignValue('textarea[name="drug_stopped_update"]', answer11Explanation1);
      assignValue('select[name="drug_stopped_update_status"]', answer11Explanation1Status);
      assignValue('textarea[name="drug_yes_update"]', answer11Explanation2);
      assignValue('select[name="drug_yes_update_status"]', answer11Explanation2Status);
      // Alcohol
      assignValue('select[name="alcohol_consumption_update"]', answer12);
      assignValue('textarea[name="alcohol_stopped_update"]', answer12Explanation1);
      assignValue('select[name="alcohol_stopped_update_status"]', answer12Explanation1Status);
      assignValue('textarea[name="alcohol_yes_update"]', answer12Explanation2);
      assignValue('select[name="alcohol_yes_update_status"]', answer12Explanation2Status);
      // Dependence
      assignValue('select[name="dependency_update"]', answer13);
      // Question 14A) Physical activity description
      assignValue('textarea[name="physical_activity_description_update"]', answer14);
      assignValue('select[name="physical_activity_description_update_status"]', answer14Status);
      // Question 14B) Physical activity level
      assignValue('select[name="activity_level_update"]', answer14Level);
      // Question 6'A) Blood collection for labs
      assignValue('select[name="6_blood_labs"]', answer6primeA);
      assignValue('textarea[name="6_blood_labs_reason"]', answer6primeAJustification);
      assignValue('select[name="6_blood_labs_reason_status"]', answer6primeAJustificationStatus);
      // Question 6'B) Blood collection for biosamples
      assignValue('select[name="6_blood_biosamples"]', answer6primeB);
      assignValue('textarea[name="6_blood_biosamples_reason"]', answer6primeBJustification);
      assignValue('select[name="6_blood_biosamples_reason_status"]', answer6primeBJustificationStatus);
      // Question 9') Blood pressure
      assignValue('input[name="9_systolic_bp"]', answer9primeA);
      assignValue('select[name="9_systolic_bp_status"]', answer9primeAJustification);
      assignValue('input[name="9_diastolic_bp"]', answer9primeB);
      assignValue('select[name="9_diastolic_bp_status"]', answer9primeBJustification);
      // Question 10') BP range
      assignValue('select[name="10_bp_range"]', answer10prime);
      // Question 11') Pulse
      assignValue('input[name="11_pulse"]', answer11primeA);
      assignValue('select[name="11_pulse_status"]', answer11primeAJustification);
      assignValue('select[name="11_pulse_regularity"]', answer11primeB);
      // Question 12') Weight
      assignValue('input[name="12_weight"]', answer12primeA);
      assignValue('select[name="12_weight_status"]', answer12primeAJustification);
      // Triggering the submitting of the form
      $('input[name="fire_away"]').trigger('click');
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
/**
 * Wrapper function for the assignment of a value to an element using jQuery.
 * @param {string}  selector    CSS selector of the targeted element
 * @param {string}  value       Text value to be given to the element
 * @param {boolean} disabled    Enablement state of the element
 */
function assignValue(
  selector,
  value = 'not_answered',
  disabled = false) {
  // Adjusting the disabled property is necessary due to legacy
  // issues with the validation which disables some fields which shouldn't
  // be disabled while doing validation, thus causing issues with the POST
  // Note: Shouldn't be necessary after proper refactoring
  $(selector).val(value).prop('disabled', disabled);
}
