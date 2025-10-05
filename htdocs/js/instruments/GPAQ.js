/**
 * Helper script for the two pages of the Global Physical Activity Questionnaire (GPAQ).
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
  // Adding listeners to radio inputs
  addRadioInputListeners();
  // Adding number inputs listeners
  addNumberInputListeners();
  // Initialize radio buttons
  $('#data-entry-table1 input[type="radio"]').trigger('change');
  // Initialize days inputs
  $('input[type="number"].days-question').trigger('change');
});

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
      'GPAQ/Data_Entry/?' +
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
    // Get unsupported characters matches
    let matches = $('#Comments').val().match(/[^()?!:0-9a-z,\.'\-\/àÀâÂçÇéÉèÈêÊëËîÎïÏôÔÖöûÛùÙüÜÿŸñæœ ]/gi);
    // If there were matches
    if (matches) {
      // stop propagation
      e.preventDefault();
      // Add errors to object
      errors.Comments = matches.toString();
    }
    // If there were errors in the object
    if (Object.keys(errors).length > 0) {
      // prompt a message with all the errors
      _submitErrorMessage(
        errors,
        'There are invalid characters in:',
        'Comments: Invalid Characters');
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
    // Uncheck all radio controls
    $('input[type="radio"]').prop('checked', false).trigger('change');
    // Blank the text input
    $('input[type="number"], textarea').val('');
  });
}

/**
 *
 * Function to add listeners to number input fields.
 *
 */
function addNumberInputListeners() {
  // Add listeners to the hours input fields
  _addHoursInputListeners();
  // Add listeners to the minutes input fields
  _addMinutesInputListeners();
  // Add listeners to the days input fields
  _addDaysQuestionListeners();
}

/**
 *
 * Function to add listeners to the hours input field to update the matching
 * minutes field to a minimum value when applicable.
 *
 * @private
 */
function _addHoursInputListeners() {
  // For changes on an hours input field
  $('input[type="number"].hours-input').on('change', function(e) {
    // Get the name of the matching minutes input field
    let matchingMinutes = $(e.target).attr('id').slice(0, -1) + 'm';
    // If the hours fields is not blank and the minutes field is
    if ($(e.target).val() !== '' && $('#' + matchingMinutes).val() === '') {
      // Set minutes field to 0
      $('#' + matchingMinutes).val('0');
    }
  });
}

/**
 *
 * Function to add listeners to the minutes input field to update the matching
 * hours field to a minimum value when applicable.
 *
 * @private
 */
function _addMinutesInputListeners() {
  // For changes on a minutes input field
  $('input[type="number"].minutes-input').on('change', function(e) {
    // Get the ID of the matching hours field
    let matchingHours = $(e.target).attr('id').slice(0, -1) + 'h';
    // If the matching hours field is empty while the minutes field is not
    if ($(e.target).val() !== '' && $('#' + matchingHours).val() === '') {
      // Set hours field to 0
      $('#' + matchingHours).val('0');
    }
  });
}

/**
 *
 * Function to add listeners to the days input fields to adjust the required
 * parameter where applicable.
 *
 * @private
 */
function _addDaysQuestionListeners() {
  // For changes on a days input
  $('input[type="number"].days-question').on('change', function(e) {
    // Get the matching time inputs row
    let timeRowNode = $(e.target).closest('tr').next();
    // If the days value is empty or equal to 0
    if ($(e.target).val() === '' || $(e.target).val() === '0') {
      // Set time fields to optional
      $('input[type="number"]', timeRowNode).attr('required', false);
      // If the days value mandates times values
    } else {
      // Make time fields mandatory
      $('input[type="number"]', timeRowNode).attr('required', true);
    }
  });
}

/**
 *
 * Function to add listeners to the radio button inputs.
 *
 */
function addRadioInputListeners() {
  // Add listeners to the gating questions for each subdomain
  _addGatingQuestionListeners();
}

/**
 *
 * Function to add listeners to the gating questions of the subdomains.
 *
 * @private
 */
function _addGatingQuestionListeners() {
  // For changes to radio inputs in the data entry table
  $('#data-entry-table1 input[type="radio"]').on('change', function(e) {
    // Get nodes for the matching days and times
    let daysRowNode = $(e.target).closest('tr').next();
    let timeRowNode = $(e.target).closest('tr').next().next();
    // If the gating question has a check
    if ($(`input[type="radio"][name=${$(e.target).prop('name')}]:checked`).length === 1) {
      // If the checked value matches the current event
      if ($(e.target).prop('checked')) {
        // If the checked value allows for sub-questions
        if ($(e.target).val() === '1') {
          // Show the subdomain
          $(daysRowNode).removeClass('hidden');
          $(timeRowNode).removeClass('hidden');
          // Update required parameter for the input field
          $('input[type="number"]', daysRowNode).prop('required', true).trigger('change');
          $('input[type="number"]', timeRowNode).prop('required', true).trigger('change');
        // If the checked value doesn't allow sub-questions
        } else {
          // hide the subdomain
          $(daysRowNode).addClass('hidden');
          $(timeRowNode).addClass('hidden');
          // Update required parameter for the input field
          $('input[type="number"]', daysRowNode).prop('required', false).trigger('change');
          $('input[type="number"]', timeRowNode).prop('required', false).trigger('change');
        }
      }
      // If the gating question is undefined
    } else {
      // hide the subdomain
      $(daysRowNode).addClass('hidden');
      $(timeRowNode).addClass('hidden');
      // Update required parameter for the matching input fields
      $('input[type="number"]', daysRowNode).prop('required', false).trigger('change');
      $('input[type="number"]', timeRowNode).prop('required', false).trigger('change');
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
