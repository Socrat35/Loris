/**
 * Helper script for the Inclusion/Exclusion instrument's "helper" button.
 * This is a quick and dirty hack and should be removed when the instrument
 * has been refactored to a more usable form.
 *
 * @author Jean-Michel Raoult <jean-michel.raoult.comtl@ssss.gouv.qc.ca>
 */

'use strict';

// jQuery function for waiting until the page is ready
$(document).ready(function() {
  // If the page has the hidden element indicating that it's the 3rd page of f3
  // and the page is not frozen (save button named 'fire_away' present)
  if ($('input[name="page"][value="inclusion_exclusion_page1"]').length === 1 &&
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
    // When the dynamically created button is clicked
    $('#auto-fill-button').on('click', function() {
      // Getting the prompted values
      let answer1 = validatePrompt(
       '1) Is the participant 60 years and older or 55 and older if current' +
        ' age is within 15 years relative\'s age at onset of AD?\n\n\t' +
        'Y => Yes\n\tN => No\n\t blank => Not Answered',
       yesNoNA);
      let answer2 = validatePrompt(
        '2) Does the participant have 6 years or more of formal education?' +
        '\n\n\tY => Yes\n\tN => No\n\t blank => Not Answered',
        yesNoNA);
      let answer3 = validatePrompt(
        '3) Can the participant read or write French or English fluently ' +
        'enough to participate in written testing?\n\n\t' +
        'Y => Yes\n\tN => No\n\t blank => Not Answered',
        yesNoNA);
      let answer4 = validatePrompt(
        '4) Does the participant have a positive family history of AD?' +
        '\n\n\tY => Yes\n\tN => No\n\t blank => Not Answered',
        yesNoNA);
      let answer5 = validatePrompt(
        '5) Does the participant have a collateral respondent who is ' +
        'available and willing to come to each follow-up visit to provide ' +
        'information on the cognitive and health status of the participant?' +
        '\n\n\tY => Yes\n\tN => No\n\t blank => Not Answered',
        yesNoNA);
      let answer6 = validatePrompt(
        '6) Is the participant willing to undergo blood tests annually?' +
        '\n\n\tY => Yes\n\tN => No\n\t blank => Not Answered',
        yesNoNA);
      let answer6AB = validatePrompt(
        '6A) Is the participant willing to undergo lumbar punctures, PET ' +
        'scanning and MRI examinations on a annual basis?\n\n\t' +
        'Y => Yes\n\tN => No\n\t blank => Not Answered',
        yesNoNA);
      let answer7 = validatePrompt(
        '7) Is the participant willing to consider participation in one or ' +
        'more sub-studies?\n\n\tY => Yes\n\tN => No\n\t blank => Not Answered',
        yesNoNA);
      let answer9 = validatePrompt(
        '9) Is the participant willing to participate in regular visits?' +
        '\n\n\tY => Yes\n\tN => No\n\t blank => Not Answered',
        yesNoNA);
      let answer10 = validatePrompt(
        '10) Is the participant willing to sign a consent form?\n\n\t' +
        'Y => Yes\n\tN => No\n\t blank => Not Answered',
        yesNoNA);
      let answer11 = validatePrompt(
        '11) Is the participant known to have, or to have been, ' +
        'diagnosed with a memory disorder by a healthcare provider or a ' +
        'PREVENT-AD staff member?\n\n\t' +
        'Y => Yes\n\tN => No\n\t blank => Not Answered',
        yesNoNA);
      let answer12 = validatePrompt(
        '12) Is the participant using available medication for their memory' +
        ' (such as memantine, donepezil, rivastigmine, galantamine)?\n\n\t' +
        'Y => Yes\n\tN => No\n\t blank => Not Answered',
        yesNoNA);
      let answer14 = validatePrompt(
        '14) Is the participant using vitamin E at a greater dosage than ' +
        '600 i.u. per day?\n\n\tY => Yes\n\tN => No\n\t blank => Not Answered',
        yesNoNA);
      let answer17 = validatePrompt(
        '17) Does the participant have a clinically significant ' +
        'hypertension, anemia, liver disease or kidney disease?\n\n\t' +
        'Y => Yes\n\tN => No\n\t blank => Not Answered',
        yesNoNA);
      let answer18 = validatePrompt(
        '18) Does the participant regularly use systemic or inhalation ' +
        'corticosteroids 4 or more times a week?\n\n\t' +
        'Y => Yes\n\tN => No\n\t blank => Not Answered',
        yesNoNA);
      let answer19 = validatePrompt(
        '19) Does the participant use warfarin, ticlopidine, clopidogrel ' +
        'or similar anticoagulants?\n\n\t' +
        'Y => Yes\n\tN => No\n\t blank => Not Answered',
        yesNoNA);
      let answer21 = validatePrompt(
        '21) Does the participant suffer from any inflammatory or chronic ' +
        'pain conditions that necessitate regular use of opiates, NSAIDs or ' +
        'aspirin?\n\n\tY => Yes\n\tN => No\n\t blank => Not Answered',
        yesNoNA);
      let answer22A = validatePrompt(
        '22A) Is the participant currently being treated for ADHD after ' +
        'being diagnosed for it by an healthcare provider?\n\n\t' +
        'Y => Yes\n\tN => No\n\t blank => Not Answered',
        yesNoNA);
      let answer23 = validatePrompt(
        '23) Is the participant in another trial that interferes with ' +
        'PREVENT-AD or any of its derivative protocols?\n\n\t' +
        'Y => Yes\n\tN => No\n\t blank => Not Answered',
        yesNoNA);
      let answer24 = validatePrompt(
        '24) Does the current plasma of the participant have a creatinine ' +
        'level larger than 1.5 mg/dL (132 mmol/L)?\n\n\t' +
        'Y => Yes\n\tN => No\n\t blank => Not Answered',
        yesNoNA);
      let answer25 = validatePrompt(
        '25) Is the participant on current alcohol, barbiturate or ' +
        'benzodiazepine use or dependence (in the opinion of the the study ' +
        'physician)?\n\n\tY => Yes\n\tN => No\n\t blank => Not Answered',
        yesNoNA);
      let answer29 = validatePrompt(
        '29) After revision of lab results, neuropsychological evaluation ' +
        'and physical examination, does the participant meet all eligibility ' +
        'criteria to the PREVENT-AD cohort?\n\n\t' +
        'Y => Yes\n\tN => No\n\t blank => Not Answered',
        yesNoNA);
      let answer29date = answer29 === 'yes' ?
        validatePromptDate(
          'Date of eligibility\n (i.e. YYYY-MM-DD, 2023-12-03)') :
        null;
      let answer29Status = answer29date === '' ? 'not_answered' : null;
      let answer29A = validatePrompt(
        'Does the participant agree to enroll?\n\n\t' +
        'Y => Yes\n\tN => No\n\t blank => Not Answered',
        yesNoNA);
      let answer29F = validatePrompt(
        'If POSTPONE, FINAL DECISION IS:?\n\n\t' +
        'Y => Yes\n\tN => No\n\t blank => Not Answered',
        yesNoNA);
      let answer30 = window.prompt('Comments?');
      let answer30Status = answer30 === '' ? 'not_answered' : null;
      //
      //              Updating inputs
      //
      // Dynamic Inputs
      //
      // Question 1)
      assignValue('select[name="1_age"]', answer1);
      // Question 2)
      assignValue('select[name="2_education"]', answer2);
      // Question 3)
      assignValue('select[name="3_language"]', answer3);
      // Question 4)
      assignValue('select[name="4_alzheimer_family_history"]', answer4);
      // Question 5)
      assignValue('select[name="5_collateral_respondent"]', answer5);
      // Question 6)
      assignValue('select[name="6_blood_urine"]', answer6);
      // Question 6A)
      assignValue('select[name="lp_csf_collection"]', answer6AB);
      // Question 6B)
      assignValue('select[name="mri_fmri_scans"]', answer6AB);
      // Question 7)
      assignValue('select[name="7_sub_studies"]', answer7);
      // Question 9)
      assignValue('select[name="9_regular_visits"]', answer9);
      // Question 10)
      assignValue('select[name="10_consent"]', answer10);
      // Question 11)
      assignValue('select[name="11_memory_disorder"]', answer11);
      // Question 12)
      assignValue('select[name="12_memory_medication"]', answer12);
      // Question 14)
      assignValue('select[name="14_vitamin_e"]', answer14);
      // Question 17)
      assignValue(
        'select[name="17_clinically_significant_condition"]',
        answer17);
      // Question 18)
      assignValue('select[name="18_corticosteroids"]', answer18);
      // Question 19)
      assignValue('select[name="19_anticoagulant"]', answer19);
      // Question 21)
      assignValue('select[name="21_pain_opiates"]', answer21);
      // Question 22A)
      assignValue('select[name="adhd_diagnosis"]', answer22A);
      // Question 23)
      assignValue('select[name="23_trial_interference"]', answer23);
      // Question 24)
      assignValue('select[name="24_plasma_creatinine"]', answer24);
      // Question 25)
      assignValue('select[name="25_substance_dependence"]', answer25);
      // Question 28)
      assignValue('select[name="28_other_condition"]', answer17);
      // Question 29)
      assignValue('select[name="29_eligibility"]', answer29);
      // Question 29date)
      assignValue('input[name="eligibility_date_date"]', answer29date);
      // Question 29status)
      assignValue(
        'select[name="eligibility_date_date_status"]',
        answer29Status);
      // Question 29A)
      assignValue('select[name="enroll_agreement"]', answer29A);
      // Question 29F)
      assignValue(
        'select[name="eligibility_probucol_postpone_final"]',
        answer29F);
      // Question 30)
      assignValue('textarea[name="comments"]', answer30);
      // Question 30Status)
      assignValue('select[name="comments_status"]', answer30Status);
      //
      // Static Inputs
      //
      // Question 5A) Genetic Testing of APOE and other risk factors
      assignValue('select[name="genetic_testing"]');
      // Question 8) Willingness to limit medicine uses
      assignValue('select[name="8_limit_med_use"]');
      // Question 9A) Willingness to limit medicine uses that affect QTc
      assignValue('select[name="limit_med_prolong_QTc"]');
      // Question 9B) Willingness to use lipid lowering drugs for a trial
      assignValue('select[name="remain_lipid_lowering"]');
      // Question 13) Usage of cognitive enhancers
      assignValue('select[name="13_cognitive_enhansers"]');
      // Question 15) History of ulcer complications
      assignValue('select[name="15_ulcer_complications"]');
      // Question 16) History of ulcers
      assignValue('select[name="16_uncomplicated_ulcer"]');
      // Question 16A) History of heart disease
      assignValue('select[name="heart_history"]');
      // Question 16B) Corrected QT interval larger than 450 ms
      assignValue('select[name="corrected_QT_interval"]');
      // Question 17A) Concurrent OTC or prescription medicine known to prolong
      // QTc
      assignValue('select[name="concurrent_med_prolong"]');
      // Question 20) History of hypersensitivity or allergic responses to
      // specific medications
      assignValue('select[name="20_allergies"]');
      // Question 22) Taking insulin or a modified prepared dietary formulation
      assignValue('select[name="22_insulin"]');
      // Question 26) Condition against taking probucol or other apoe inducer
      assignValue('select[name="26_other_condition_drug"]');
      // Question 27) Condition against taking insufflations of intra-nasal insulin
      assignValue('select[name="27_other_condition_intra_nasal"]');
      // Question 29B) Eligibility of enrollment in probucol
      assignValue('select[name="eligibility_probucol"]');
      // Question 29CStatus) Comments about probucol
      assignValue('select[name="eligibility_probucol_comments_status"]');
      // Question 29DStatus) Date status probucol eligibility
      assignValue('select[name="eligibility_probucol_date_date_status"]');
      // Question 29E) Enrollment probucol
      assignValue('select[name="enroll_agreement_probucol"]');
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
 * Function which prompts the user using the basic JS utility for a date or
 * a blank value then validates said date using basic regex and JS methods.
 *
 * Note: The validation using the creation of a date object is not
 * completely reliable (see the behavior around February), nor is the simplified
 * regex used. The main check to make sure that the date will be valid is that
 * the DB will refuse an invalid date while saving
 * @param       {string}    text    Text to be used by the prompt
 * @return     {*|string}    Blank, null or date string provided
 */
function validatePromptDate(text) {
  // Initialize a variable for the answer input
  let answer;
  // Initialize a variable for the Date object
  let date;
  // Create test regex
  let regex = new RegExp(
    /^20[0-5][0-9]-(0[0-9]|1[0-2])-(0[1-9]|1[0-9]|2[0-9]|3[0-1])$/,
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
    }
    // Create a date object using the date string for validation
    date = new Date(answer);
    // while the answer is not empty or not valid, repeat loop
  } while (answer !== '' && (!regex.test(answer) || isNaN(date)));
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

