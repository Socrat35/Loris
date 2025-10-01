/**
 * Helper script for the two pages of the PSQI instrument.
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
  // Add radio button listeners
  addRadioButtonListeners();
  // Adding button listeners
  addButtonListeners();
  // Initialize radio buttons
  $('input[type="radio"]:checked').trigger('change');
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
      'PSQI/Data_Entry/?' +
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
 * Function to add a listener to the reset button of the data entry page.
 *
 */
function _addResetButtonListener() {
  // For a click on the button
  $('#reset-button').on('click', function() {
    // Uncheck all radio controls
    $('input[type="radio"]').prop('checked', false).trigger('change');
    // Blank the text input
    $('input[type="text"], textarea').val('');
    // Blank the time inputs
    $('input[type="time"]').val('');
  });
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
    // For each text input or a text area
    $('textarea, input[type="text"]', '#data_entry_form').each(function() {
      // Get unsupported characters matches
      let matches = $(this).val().match(/[^()%?!:0-9a-z,\.'\-\/àÀâÂçÇéÉèÈêÊëËîÎïÏôÔÖöûÛùÙüÜÿŸñæœ ]/gi);
      // If there were matches
      if (matches) {
        // stop propagation
        e.preventDefault();
        // Add errors to object
        errors[$(this).prop('name')] = matches.toString();
      }
    });
    // If there were errors in the object
    if (Object.keys(errors).length > 0) {
      // prompt a message with all the errors
      _submitErrorMessage(
        errors,
        'There are invalid characters in:',
        'Pittsburg Sleep Quality Index: Invalid Characters');
      return;
    }
  });
}

/**
 *
 * Function to add listener to radio inputs value changes.
 *
 */
function addRadioButtonListeners() {
  // Add listeners for attached descriptions
  _addAttachedDescriptionListeners();
  // Add listener for the optional questions
  _addOptionalQuestionsListener();
}

/**
 *
 * Function to add a listener to the questions which include a conditional description field.
 *
 * @private
 */
function _addAttachedDescriptionListeners() {
  // For changes on either of those questions
  $('input[type="radio"][name="q5j"], input[type="radio"][name="q11e"]').on('change', function(e) {
    // If the value is checked and would trigger the optional description
    if ($(e.target).prop('checked') && parseInt($(e.target).val(), 10) > 0) {
      // Show the text input and set to required if in 'All' administration
      $('#' + $(e.target).prop('name') + '_description').removeClass('hidden').prop('required', $('input[name="Administration"][value="All"]').length === 1);
      // If the value is not checked or wouldn't trigger the optional description
    } else {
      // Hide the text input and remove the required parameter
      $('#' + $(e.target).prop('name') + '_description').addClass('hidden').prop('required', false);
    }
  });
}

/**
 *
 * Function to add listeners to radio inputs which have conditional questions
 * attached to their value.
 *
 * @private
 */
function _addOptionalQuestionsListener() {
  // For value changes to the question which controls subsequent conditional questions
  $('input[type="radio"][name="q10"]').on('change', function(e) {
    // If that question has a value which triggers the conditional questions
    if ($(e.target).prop('checked') && parseInt($(e.target).val(), 10) > 0) {
      // Show the container of the conditional questions
      $('#q11-container').removeClass('hidden');
      // Set the radio inputs of the conditional questions to required if in 'All' administration
      $('input[type="radio"]', '#q11-container').prop('required', $('input[name="Administration"][value="All"]').length === 1);
      // If the conditional subquestion with an attached description is checked,
      // trigger a change event on that input to update the required values for
      // that description
      $('input[type="radio"][name="q11e"]:checked', '#q11-container').trigger('change');
    // If the question is empty or has a value which doesn't involve the conditional questions
    } else {
      // Hide the conditional questions container
      $('#q11-container').addClass('hidden');
      // Set all conditional inputs to not required
      $('input[type="radio"], input[type="text"]', '#q11-container').prop('required', false);
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
