/**
 * Helper script for the modified Short-Form McGill Pain Questionnaire (mSFMPQ) instrument.
 *
 * @author Jean-Michel Raoult <jean-michel.raoult.comtl@ssss.gouv.qc.ca>
 */

'use strict';

// Object containing a color gradient from green to red in percentages by
// increments of 5.
// Source: https://stackoverflow.com/questions/4161369/html-color-codes-red-to-yellow-to-green
const gradients = {
  0: '#57bb8a',
  5: '#63b682',
  10: '#73b87e',
  15: '#84bb7b',
  20: '#94bd77',
  25: '#a4c073',
  30: '#b0be6e',
  35: '#c4c56d',
  40: '#d4c86a',
  45: '#e2c965',
  50: '#f5ce62',
  55: '#f3c563',
  60: '#e9b861',
  65: '#e6ad61',
  70: '#ecac67',
  75: '#e9a268',
  80: '#e79a69',
  85: '#e5926b',
  90: '#e2886c',
  95: '#e0816d',
  100: '#dd776e'
};

// jQuery function for waiting until the page is ready
$(document).ready(function() {
  // Adjusts the background color of the Window Difference cell
  dynamicallyAdjustWindowDifferenceBackgroundColor();
  // Removes the info tables for the data entry page
  adjustDefaultDisplayElementsForDataEntry();
  // Adding listeners for changes to the instrument settings
  instrumentSettingsEventHandler();
  // Adding button listeners
  addButtonListeners();
  // Add listeners to radio buttons
  addRadioButtonListeners();
  // Add listener to the range input
  addRangeInputListener();
  // Add listeners to number fields
  addNumberInputListeners();
  // Initialize radio buttons
  $('#data_entry_form input[type="radio"]').trigger('change');
  // Initialize range input
  $('#5_Visual_Pain_Intensity').trigger('change');
});

/**
 * Function which removes default elements from the display to maximize
 * the space available for data entry.
 */
function adjustDefaultDisplayElementsForDataEntry() {
  // If the data entry table structure exists (data entry page only)
  if ($('input[type="hidden"][name="commentID"]').length === 0) {
    // Detach the current lorisworkspace div
    let currentSpace = $('#lorisworkspace').detach();
    // Remove the two information tables from their div and append the
    // saved structure to the proper element
    $('div.inset > div:nth-child(2)').empty().append(currentSpace);
  }
}

/**
 * Function which, if it exists, adjusts the background color
 * of the Window Difference cell on a gradient from red to green
 * with anything over 6 months being the maximum red.
 */
function dynamicallyAdjustWindowDifferenceBackgroundColor() {
  // If the content of the cell for Window Difference exists (top page only)
  if ($('#windowDifferenceCell > p').length) {
    // Parse the content of the cell as a positive integer
    let difference = Math.abs(parseInt($('#windowDifferenceCell > p').html(), 10));
    // Set the default background color to red
    let backgroundColor = gradients[100];
    // If the difference is smaller than 6 months (180 days, more or less)
    if (difference < 180) {
      // Set the background color variable as the closest percentage by 5 value
      // of the color gradient
      backgroundColor = gradients[Math.round(difference / 5) * 5];
    }
    // Apply the background color variable to the CSS of the Window Difference
    // cell
    $('#windowDifferenceCell').css({backgroundColor: backgroundColor});
  }
}

/**
 * Function which adds an event handler for changes to the instrument
 * settings controls. This event handler uses information parsed from
 * the address and the new setting values to produce a GET request
 * and reload the page with the new settings applied.
 */
function instrumentSettingsEventHandler() {
  // Event handler if there is a change on one of the select element
  // which control the settings of the instrument
  $('select.test_settings_options').on('change', function(e) {
    e.preventDefault();
    // Parse the candID, sessionID and commentID from the address produced
    // by the .htaccess rewrite rules of the site
    let locationParameters = $(location).attr('href').match(/^https:\/\/.+\/([0-9]+)\/([0-9]+).+commentID=([0-9A-Za-z_]+)$/);
    // Assign the values to separate variables
    let candID = locationParameters[1];
    let sessionID = locationParameters[2];
    let commentID = locationParameters[3];
    // Fetch the values of the select controls and assign them to variables
    let testLanguage = $('#test_language_select').val();
    // Reload the page following the format accepted by the rewrite rules
    window.location.href = '/' +
      candID + '/' +
      sessionID + '/' +
      'mSFMPQ/Data_Entry/?' +
      'Test_Language=' + testLanguage +
      '&commentID=' + commentID;
  });
}

/**
 *
 * Function to add listeners to button elements.
 *
 */
function addButtonListeners() {
  _addResetButtonListener();
  _addSubmitButtonListener();
}

/**
 *
 * Function to add a listener to the submit button of the Add category modal.
 *
 * @private
 */
function _addSubmitButtonListener() {
  $('#submit-button').on('click', function(e) {
    // Initialize an errors' object
    let errors = {};
    // Test value range of the range input
    let visualPainSlider = parseFloat($('#5_Visual_Pain_Intensity').val());
    // If the value is outside the permitted range
    if (isNaN(visualPainSlider) || (visualPainSlider < 0 && visualPainSlider !== -1) || visualPainSlider > 10) {
      // Stop propagation
      e.preventDefault();
      // Add error message to object
      errors['Visual Pain Slider'] = visualPainSlider + ' value is invalid.';
    }
    // Get unsupported characters matches
    $('#Comments, #2_Chronic_Pain_Source_Description').each(function(index, element) {
      let matches = $(element).val().match(/[^()?!:0-9a-z,\.'\-\/àÀâÂçÇéÉèÈêÊëËîÎïÏôÔÖöûÛùÙüÜÿŸñæœ ]/gi);
      // If there were matches
      if (matches) {
        // stop propagation
        e.preventDefault();
        // Add errors to object
        errors[$(element).prop('name')] = matches.toString();
      }
    });
    // If there were errors in the object
    if (Object.keys(errors).length > 0) {
      // prompt a message with all the errors
      _submitErrorMessage(
        errors,
        'The following fields have errors:',
        'Errors in the Data');
      return;
    }
  });
}

/**
 *
 * Function to add a listener to the reset button of the data entry page.
 *
 */
function _addResetButtonListener() {
  // For a click on the button
  $('#reset-button').on('click', function() {
    // Uncheck all radio and checkbox controls
    $('input[type="radio"], input[type="checkbox"]').prop('checked', false).trigger('change');
    // Blank the inputs for numbers, text, range and the textareas
    $('input[type="number"], input[type="text"], textarea').val('');
    // Resets the range input
    $('input[type="range"]').val(-1).trigger('change');
  });
}

/**
 *
 * Function to add listeners to radio inputs.
 *
 */
function addRadioButtonListeners() {
  _addGatingQuestionListener();
  _addDescriptionFieldListener();
}

/**
 *
 * Function to add a listener to the test's gating question.
 *
 * @private
 */
function _addGatingQuestionListener() {
  // For changes to radio inputs in the container of the gating question
  $('div.gating-question table.data-entry-table input[type="radio"]').on('change', function(e) {
    // If that input has a checked value
    if ($(`input[type="radio"][name=${$(e.target).prop('name')}]:checked`).length === 1) {
      // If the target is the checked value
      if ($(e.target).prop('checked')) {
        // If the value of the target allows for other questions
        if ($(e.target).val() === '1') {
          // Show the scoring questions containers
          $('div.scoring-question').removeClass('hidden');
          // For all the types of inputs of the scoring questions,
          // make required if administering the instrument completely
          $('div.scoring-question input[type="radio"], ' +
            'div.scoring-question input[type="range"], ' +
            'div.scoring-question input[type="number"]').prop(
            'required',
            $('input[type="hidden"][name="Administration"]').val() === 'All');
          // If the value doesn't allow other questions
        } else {
          // Hide the scoring questions and make the matching inputs non required
          $('div.scoring-question').addClass('hidden');
          $('div.scoring-question input').prop('required', false);
        }
      }
      // If the parameter doesn't have a value
    } else {
      // Hide the scoring questions and make them optional
      $('div.scoring-question').addClass('hidden');
      $('div.scoring-question input').prop('required', false);
    }
  });
}

/**
 *
 * Function to add a listener to the radio value which has an attached description.
 *
 * @private
 */
function _addDescriptionFieldListener() {
  // For changes to the radio inputs of the question which has a value with an
  // attached description
  $('input[type="radio"][name="2_Chronic_Pain_Source"]').on('change', function(e) {
    // If the parameter is checked
    if ($('input[type="radio"][name="2_Chronic_Pain_Source"]:checked').length === 1) {
      // If the event's target is checked
      if ($(e.target).prop('checked')) {
        // If the value mandates a description
        if ($(e.target).val() === '4') {
          // Show the description
          $('#2_Chronic_Pain_Source_Description').removeClass('hidden');
          $('#2_Chronic_Pain_Source_Description').prop('required', $('input[type="hidden"][name="Administration"]').val() === 'All');
        // If the value doesn't allow for a description
        } else {
          // Hide the description
          $('#2_Chronic_Pain_Source_Description').addClass('hidden');
          $('#2_Chronic_Pain_Source_Description').prop('required', false);
        }
      }
      // If the parameter doesn't have a value
    } else {
      // Hide the description and make it optional
      $('#2_Chronic_Pain_Source_Description').addClass('hidden');
      $('#2_Chronic_Pain_Source_Description').prop('required', false);
    }
  });
}

/**
 *
 * Function to add listeners to the range inputs.
 *
 */
function addRangeInputListener() {
  _addVisualPainRangeListener();
}

/**
 *
 * Function to add a listener to the range input to update the nearby text
 * input which serves as a display of its value.
 *
 * @private
 */
function _addVisualPainRangeListener() {
  // For changes to the range input
  $('#5_Visual_Pain_Intensity').on('change', function(e) {
    // Get the instrument's language
    let language = $('#test_language_select').val();
    // Parse the value of the input as a float
    let score = parseFloat($(e.target).val());
    // Initialize the message to be displayed in the text input
    let message = '';
    // If the value couldn't be parsed or is smaller than the minimum value
    if (isNaN(score) || score < 0) {
      message = language === 'fr' ? 'Aucune valeur' : 'No Value';
    // If the value could be parsed and is within expectations
    } else if (score >= 0 && score <= 10) {
      message = score;
    // if the value could be parsed but is outside the expected values
    } else {
      message = language === 'fr' ? 'Valeur invalide' : 'Invalid Value';
    }
    // Update the text input with the crafted message
    $('#Visual_Pain_Intensity_value').val(message);
  });
}

/**
 *
 * Function to add listeners to the number inputs.
 *
 */
function addNumberInputListeners() {
  // Add listener to the years input field
  _addYearsInputListener();
  // Add listener to the months input field
  _addMonthsInputListener();
}

/**
 *
 * Function to add a listener to the years field to autofill the matching
 * months field if empty.
 *
 * @private
 */
function _addYearsInputListener() {
  // For changes or loss of focus to the years input field
  $('input[type="number"][name="3_Chronic_Pain_Length_Years"]').on('change blur', function(e) {
    // Get the months field
    let months = $('input[type="number"][name="3_Chronic_Pain_Length_Months"]');
    // If the years field is not blank and the months field is
    if ($(e.target).val() !== '' && $(months).val() === '') {
      // Set months field to minimum value
      $(months).val('0');
    }
  });
}

/**
 *
 * Function to add listener to the months field to autofill the matching years
 * field if empty.
 *
 * @private
 */
function _addMonthsInputListener() {
  // For changes or loss of focus of the months field
  $('input[type="number"][name="3_Chronic_Pain_Length_Months"]').on('change blur', function(e) {
    // Get the years field node
    let years = $('input[type="number"][name="3_Chronic_Pain_Length_Years"]');
    // If the years field is empty while the months field is not
    if ($(e.target).val() !== '' && $(years).val() === '') {
      // Set years field to minimum value
      $(years).val('0');
    }
  });
}

/**
 * Wrapper function for validation prompt error messages on the data entry page.
 * @param {Object} errors       Object containing the errors to be listed in the
 *                              prompt
 * @param {string}  description Description to preface the listing of the errors
 * @param {string}  title       Title of the prompt
 * @private
 */
function _submitErrorMessage(errors, description, title) {
  // Initialize the error HTML string
  let message = `<p class="text-center">${description}</p><ul class="text-left">`;
  // Add each error as an item in the error list
  Object.keys(errors).forEach(function(element) {
    message += '<li>' + errors[element] + ' (' + element + ')</li>';
  });
  // Close the list
  message += '</ul>';
  // Prompt the message
  fancyErrorPrompt(title, message);
}

/**
 * Function which creates a SweetAlert error prompt.
 * @param {string} title    Title of the error prompt
 * @param {string} message  Message to be displayed in the error prompt
 */
function fancyErrorPrompt(title, message) {
  swal({
    title: title,
    type: 'error',
    text: message,
    html: true
  });
}
