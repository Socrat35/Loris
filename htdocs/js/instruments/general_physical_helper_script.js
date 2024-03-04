/**
 * Helper script for the General Physical instrument's "helper" button.
 * This is a quick and dirty hack and should be removed when the instrument
 * has been refactored to a more usable form.
 *
 * @author Jean-Michel Raoult <jean-michel.raoult.comtl@ssss.gouv.qc.ca>
 */

'use strict';

// jQuery function for waiting until the page is ready
$(document).ready(function() {
  // If the page is not frozen (save button named 'fire_away' present)
  if ($('input[name="fire_away"]').length === 1) {
    // If the page has the hidden element for the first page of the general
    // physical instrument
    if ($('input[name="page"][value="general_physical_page1"]').length === 1) {
      // Add the helper button
      addHelperButton();
      // Add the appropriate listener for the helper button
      addFirstPageListener();
      // If the page has the hidden element for the second page of the general
      // physical instrument
    } else if ($('input[name="page"][value="general_physical_page2"]').length === 1) {
      // Add the helper button
      addHelperButton();
      // Add the appropriate listener for the helper button
      addSecondPageListener();
      // If the page has the hidden element for the third page of the general
      // physical instrument
    } else if ($('input[name="page"][value="general_physical_page3"]').length === 1) {
      // Add the helper button
      addHelperButton();
      // Add the appropriate listener for the helper button
      addThirdPageListener();
    }
  }
});
/**
 *
 * Function which dynamically creates a helper button HTML element
 * and appends it to the appropriate location in the DOM of the page.
 *
 */
function addHelperButton() {
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
}
/**
 *
 * Function which adds a listener on the dynamically created helper button. This
 * version auto-completes the first page of the general physical instrument where
 * there are both static and dynamic values to fulfil.
 *
 */
function addFirstPageListener() {
  $('#auto-fill-button').on('click', function() {
    // Object to map input values to select values for a nullable yes/no select
    let yesNoNA = {
      'Y': 'yes',
      'N': 'no',
      '': 'not_answered'
    };
    // Prompting for Question 1) with regex validation
    let answer1 = validatePromptRegEx(
      '1) Blood Pressure in mmHg (i.e. 120/80)',
      /^\d{2,3}\/\d{2,3}$/,
      true);
    // If question 1 is empty, set status
    let answer1Status = answer1 === '' ? 'not_answered' : null;
    // Prompting for question 2 if question 1 is answered
    let answer2 = answer1 === '' || answer1 === null ?
      'not_answered' :
      validatePrompt('2) Are the values recorded for blood ' +
        'pressure considered in the normal range?\n\n\t' +
        'Y => Yes\n\tN => No\n\t blank => Not Answered', yesNoNA);
    // Prompting for question 2A if question 2 has a no answer
    let answer2A = answer2 === 'no' ?
      validatePromptRegEx(
        'Second blood pressure measurement in mmHg after a 5 minutes rest' +
        ' period. (i.e. 180/80)',
        /^\d{2,3}\/\d{2,3}$/,
        true) :
      null;
    // Set status for question 2A
    let answer2AStatus = answer2A === null || answer2A === '' ?
      'not_answered' :
      null;
    // Prompting for question 3
    let answer3 = validatePromptRegEx(
      '3) Pulse in bpm (i.e. 60)',
      /^\d{2,3}$/,
      true
    );
    // Set status for question 3
    let answer3Status = answer3 === '' ? 'not_answered' : null;
    // Prompting for question 3A if question 3 was answered
    let answer3A = answer3 === '' || answer3 === null ?
      'not_answered' :
      validatePrompt(
        'Is the pulse regular or irregular?\n\n\t' +
        'I => Irregular\n\tR => Regular\n\tN => Not answered\n\tblank => Blank',
        {'I': 'irregular', 'R': 'regular', 'N': 'not_answered', '': ''}
      );
    // Prompting for question 4
    let answer4 = validatePromptRegEx(
      '4) Weight in kilograms (i.e. 120.5)',
      /^\d{2,3}(\.\d)?$/,
      true
    );
    // Set question 4 units if answered
    let answer4A = answer4 === '' ? 'not_answered' : 'kg';
    // Prompting for question 5
    let answer5 = validatePromptRegEx(
      '5) Height in centimeters (i.e. 170.3)',
      /^\d{3}(\.\d)?$/,
      true
    );
    // Set question 5 units
    let answer5A = answer5 === '' ? 'not_answered' : 'cm';
    // Prompting for question 6
    let answer6 = validatePrompt('6) Was blood collected during the ' +
      'eligibility visit?\n\n\tY => Yes\n\tN => No\n\t blank => Not Answered',
      yesNoNA);
    // Prompting for question 6 justification if no or not answered answers
    // to question 6
    let answer6Justification = answer6 === 'no' || answer6 === 'not_answered' ?
      window.prompt('If not, please provide a reason') :
      '';
    // Set question 6 justification status
    let answer6JustificationStatus =
      answer6Justification === null || answer6Justification === '' ?
        'not_answered' :
        '';
    //
    //              Updating inputs
    //
    // Dynamic Inputs
    //
    // Question 1) Blood pressure
    assignValue('textarea[name="1_blood_pressure"]', answer1);
    // Question 1) Status
    assignValue('select[name="1_blood_pressure_status"]', answer1Status);
    // Question 2) Normality of blood pressure range
    assignValue('select[name="2_blood_pressure_range"]', answer2);
    // Question 2A) If out of range, second measurement
    assignValue('textarea[name="blood_pressure_out_of_range"]',
      answer2A);
    // Question 2A) Status
    assignValue('select[name="blood_pressure_out_of_range_status"]',
      answer2AStatus);
    // Question 3) Pulse in bpm
    assignValue('input[name="3_pulse"]', answer3);
    // Question 3) Status
    assignValue('select[name="3_pulse_status"]', answer3Status);
    // Question 3A) Regularity of pulse
    assignValue('select[name="3_pulse_regularity"]', answer3A);
    // Question 4) Weight in kilograms
    assignValue('textarea[name="4_weight"]', answer4);
    // Question 4A) Units of weight
    assignValue('select[name="4_weight_units"]', answer4A);
    // Question 5) Height in centimeters
    assignValue('textarea[name="5_height"]', answer5);
    // Question 5A) Units of height
    assignValue('select[name="5_height_units"]', answer5A);
    // Question 6) Blood collection
    assignValue('select[name="6_blood_collection"]', answer6);
    // Question 6A) Reason for missing blood collection
    assignValue('textarea[name="6_blood_collection_reason"]',
      answer6Justification);
    // Question 6A) Status
    assignValue('select[name="6_blood_collection_reason_status"]',
      answer6JustificationStatus);
    //
    // Static Inputs
    //
    // Question 7) Urinalysis by chemstrip
    assignValue('select[name="7_urinalysis"]');
    // Question 7) Justification Status
    assignValue('select[name="7_urinalysis_reason_status"]');
    // Question 7A) Glucose
    assignValue('select[name="7_glucose"]');
    // Question 7B) Protein
    assignValue('select[name="7_protein"]');
    // Question 7C) Abnormalities in urine
    assignValue('select[name="urine_other_abnormalities"]');
    // Question 7C) Justification
    assignValue('select[name="urine_other_abnormalities_specify_status"]');
    // Question 8) Resting EKG
    assignValue('select[name="8_resting_ekg"]');
    // Question 8A) Location of the taken EKG
    assignValue('select[name="resting_ekg_yes_location"]');
    // Question 8A) Justification Status
    assignValue('select[name="resting_ekg_yes_location_specify_status"]');
    // Question 8B) Reason for not taking an EKG
    assignValue('select[name="resting_ekg_no_location_reason_status"]');
    // Question 8C) Interpretation of resting EKG
    assignValue('select[name="resting_ekg_interpretation"]');
    // Question 8D) Interpretation of abnormalities status
    assignValue('select[name="resting_ekg_interpretation_abnormal_status"]');
    // Question 8E) QTcB interval of EL visit status
    assignValue('select[name="el_qtcb_interval_status"]');
    // Question 8F) QTcB interval of BL visit status
    assignValue('select[name="bl_qtcb_interval_status"]');
    // Question 8G) Average of the EL and BL QTcB intervals status
    assignValue('select[name="el_bl_average_qtcb_interval_status"]');
    // Question 9) Following sump
    assignValue('select[name="9_no_symptoms"]');
    // Question 9A) Allergic reaction
    assignValue('select[name="9_drug_reaction"]');
    // Question 9B) Sinusitis
    assignValue('select[name="9_sinusitis"]');
    // Question 9C) Loss of smell
    assignValue('select[name="9_loss_smell"]');
    // Question 9D) Pruritis
    assignValue('select[name="9_pruritis"]');
    // Question 9E) Urticaria
    assignValue('select[name="9_urticaria"]');
    // Question 9F) Pigmentation changes
    assignValue('select[name="9_pigmentation_changes"]');
    // Question 9G) Erythema Rash
    assignValue('select[name="9_erythema_rash"]');
    // Question 9H) Bruising
    assignValue('select[name="9_bruising"]');
    // Question 9I) Petechiae
    assignValue('select[name="9_petechiae_purpura"]');
    // Question 9J) Epistaxis
    assignValue('select[name="9_epistaxis"]');
    // Question 9K) Hemoptysis
    assignValue('select[name="9_hemoptysis"]');
    // Question 9L) Hematemesis
    assignValue('select[name="9_hematemesis"]');
    // Question 9M) Melena
    assignValue('select[name="9_melena"]');
    // Question 9N) Rectal Bleeding
    assignValue('select[name="9_rectal_bleeding"]');
    // Question 9O) Hematochezia
    assignValue('select[name="9_hematochezia"]');
    // Question 9P) Vaginal Bleeding
    assignValue('select[name="9_vaginal_bleeding"]');
    // Question 9Q) Hematuria
    assignValue('select[name="9_hematuria"]');
    // Question 9R) Anemia
    assignValue('select[name="9_anemia"]');
    // Question 9S) Hemorrhage
    assignValue('select[name="9_hemorrhage"]');
    // Question 9T) Urinary output reduction
    assignValue('select[name="9_urinary_output_reduction"]');
    // Question 9U) Incontinence
    assignValue('select[name="9_incontinence"]');
    // Question 9V) Shortness of breath
    assignValue('select[name="9_shortness_breath"]');
    // Question 9W) Peripheral oedema
    assignValue('select[name="9_peripheral_oedema"]');
    // Question 9X) Weight gain
    assignValue('select[name="9_weight_gain"]');
    // Question 9Y) Weight loss
    assignValue('select[name="9_weight_loss"]');
    // Question 9Z) Acid reflux
    assignValue('select[name="9_acid_reflux_heartburn"]');
    // Question 9AA) Dysphagia
    assignValue('select[name="9_dysphagia"]');
    // Question 9AB) Dyspepsia
    assignValue('select[name="9_dyspepsia"]');
    // Question 9AC) Nausea
    assignValue('select[name="9_nausea"]');
    // Question 9AD) Abdominal pain
    assignValue('select[name="9_abdominal_pain"]');
    // Question 9AE) Stomatitis
    assignValue('select[name="9_stomatitis_pharyngitis"]');
    // Question 9AF) Vomiting
    assignValue('select[name="9_vomiting"]');
    // Question 9AG) Diarrhea
    assignValue('select[name="9_diarrhea"]');
    // Question 9AH) Costovertebral tenderness
    assignValue('select[name="9_costovertebral_tenderness"]');
    // Question 9AI) Back pain
    assignValue('select[name="9_back_pain"]');
    // Question 9AJ) Tinnitus
    assignValue('select[name="9_tinnitus"]');
    // Question 9AK) Dizziness/vertigo
    assignValue('select[name="9_dizziness_vertigo"]');
    // Question 9AL) Insomnia
    assignValue('select[name="9_insomnia"]');
    // Question 9AM) Headache
    assignValue('select[name="9_headache"]');
    // Question 9AN) Numbness
    assignValue('select[name="9_numbness"]');
    // Question 9AO) Tremor
    assignValue('select[name="9_tremor"]');
    // Question 9AP) Falls
    assignValue('select[name="9_falls"]');
    // Question 9AQ) Heart palpitations
    assignValue('select[name="9_heart_palpitations"]');
    // Question 9AR) Lightheadedness
    assignValue('select[name="9_lightheadedness"]');
    // Question 9AS) Fainting
    assignValue('select[name="9_fainting"]');
    // Question 9AT) Generalized weakness
    assignValue('select[name="9_generalized_weakness"]');
    // Question 9AU) Other symptom 1
    assignValue('select[name="9_other_1"]');
    // Question 9AV) Other symptom 1 specification status
    assignValue('select[name="9_other_1_specify_status"]');
    // Question 9AU) Other symptom 2
    assignValue('select[name="9_other_2"]');
    // Question 9AV) Other symptom 2 specification status
    assignValue('select[name="9_other_2_specify_status"]');
    // Question 9AU) Other symptom 3
    assignValue('select[name="9_other_3"]');
    // Question 9AV) Other symptom 3 specification status
    assignValue('select[name="9_other_3_specify_status"]');
    // Question 9AU) Other symptom 4
    assignValue('select[name="9_other_4"]');
    // Question 9AV) Other symptom 4 specification status
    assignValue('select[name="9_other_4_specify_status"]');
    // Question 9AU) Other symptom 5
    assignValue('select[name="9_other_5"]');
    // Question 9AV) Other symptom 5 specification status
    assignValue('select[name="9_other_5_specify_status"]');
    // Question 9AU) Other symptom 6
    assignValue('select[name="9_other_6"]');
    // Question 9AV) Other symptom 6 specification status
    assignValue('select[name="9_other_6_specify_status"]');
    // Triggering the submitting of the form
    $('input[name="fire_away"]').trigger('click');
  });
}
/**
 *
 * Function which adds a listener on the dynamically created helper button. This
 * version auto-completes the second page of the general physical instrument,
 * page which maps to a part of the physical that is not done anymore,
 * hence, the more generic approach taken since chances of changes to specific
 * answers is highly remote.
 *
 */
function addSecondPageListener() {
  $('#auto-fill-button').on('click', function() {
    // Selecting all select elements with both form-control
    // and input-sm classes
    // Note: A more generic select would also catch hidden
    // elements of other controls on the page
    $('select.form-control.input-sm').each(function() {
      assignValue(this);
    });
    // Triggering the submitting of the form
    $('input[name="fire_away"]').trigger('click');
  });
}
/**
 *
 * Function which adds a listener on the dynamically created helper button. This
 * version auto-completes the third page of the general physical instrument,
 * page which maps to a part of the physical that is not done anymore,
 * hence, the more generic approach taken since chances of changes to specific
 * answers is highly remote.
 *
 */
function addThirdPageListener() {
  $('#auto-fill-button').on('click', function() {
    // Selecting all select elements with both form-control
    // and input-sm classes
    // Note: A more generic select would also catch hidden
    // elements of other controls on the page
    $('select.form-control.input-sm').each(function() {
      assignValue(this);
    });
    // Triggering the submitting of the form
    $('input[name="fire_away"]').trigger('click');
  });
}
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
 *
 * Function which prompt and validates using the provided regex
 * pattern and the basic JS utility. It also allows a boolean
 * to specify the validity of an empty answer.
 *
 * @param   {string}    text        Text of the prompt to the user
 * @param   {RegExp}    pattern     Pattern used to check the validity of the answer
 * @param   {boolean}   validEmpty  Is an empty answer a valid answer
 * @return {*|string}    Validated answer to the prompt or null if the prompt was
 *                        canceled
 */
function validatePromptRegEx(text, pattern, validEmpty) {
  // Initialize a variable for the answer input
  let answer;
  // Create test regex
  let regex = new RegExp(
    pattern,
    'g'
  );
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
      // if the answer is blank and the validation supports a blank value
    } else if (answer === '' && validEmpty) {
      // return an empty string
      return answer;
    }
    // while the answer is not empty or not valid, repeat loop
  } while (!regex.test(answer));
  // return the value
  return answer;
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
