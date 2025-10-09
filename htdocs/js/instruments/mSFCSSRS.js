/**
 * Helper script for the two pages of the mSFCSSRS instrument.
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
  // Adding radio button listeners
  addRadioButtonListeners();
  // Adding select listeners
  addSelectListeners();
  // Initialize radio buttons and select controls
  $('table.data-entry-table input[type="radio"], table.data-entry-table select').trigger('change');
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
      'mSFCSSRS/Data_Entry/?' +
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
    // Blank the textareas and selects
    $('table.data-entry-table select, textarea').val('').trigger('change');
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
    // For each textarea in the form
    $('#data_entry_form textarea').each(function(index, element) {
      // Get unsupported characters matches
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
        'There are invalid characters in:',
        'Invalid Characters in text fields');
      return;
    }
  });
}

/**
 *
 * Function to add listeners to the radio button inputs.
 *
 */
function addRadioButtonListeners() {
  _addConditionalMandatoryDescriptionListeners();
  _addFollowUpQuestionsListener();
  _addLethalityQuestionsListeners();
}

/**
 *
 * Function to add listeners to the radio inputs of questions with
 * conditional descriptions.
 *
 * @private
 */
function _addConditionalMandatoryDescriptionListeners() {
  // For changes to radio inputs in the table where there are conditional descriptions
  $('#data-entry-table-1 input[type="radio"]').on('change', function(e) {
    // Get the node of the description row matching the question row of the input
    let descriptionRowNode = $(e.target).parent().parent().parent().parent().next();
    // If the parameter has a checked value
    if ($(`#data-entry-table-1 input[type="radio"][name="${$(e.target).prop('name')}"]:checked`).length === 1) {
      // If the value is the checked value
      if ($(e.target).prop('checked')) {
        // If the value matches the triggering value
        if ($(e.target).val() === '1') {
          // Make the matching textarea mandatory if in an Administration ALL
          $('td > textarea', descriptionRowNode).prop('required', $('input[type="hidden"][name="Administration"]').val() === 'All');
          // Show the matching description row
          $(descriptionRowNode).removeClass('hidden');
          // If the value doesn't match the triggering value
        } else {
          // Make the matching textarea not mandatory
          $('td > textarea', descriptionRowNode).prop('required', false);
          // Hide the matching description row
          $(descriptionRowNode).addClass('hidden');
        }
      }
      // If the parameter doesn't have a value
    } else {
      // Make the matching textarea not mandatory
      $('td > textarea', descriptionRowNode).prop('required', false);
      // Hide the matching description
      $(descriptionRowNode).addClass('hidden');
    }
  });
}

/**
 *
 * Function to add a listener to the input of the question which gates the follow-up questions
 * of the first section.
 *
 * @private
 */
function _addFollowUpQuestionsListener() {
  // For changes on the input of the gating question
  $('#data-entry-table-1 input[type="radio"][name="q2"]').on('change', function(e) {
    // If the parameter has a checked value
    if ($(`#data-entry-table-1 input[type="radio"][name="q2"]:checked`).length === 1) {
      // If the value matches the checked value
      if ($(e.target).prop('checked')) {
        // If the value matches the triggering value
        if ($(e.target).val() === '1') {
          // Update requirement if in administration all and cascade to
          // update the description rows visibility
          $('#data-entry-table-1 input[type=radio][name="q3"],' +
            '#data-entry-table-1 input[type=radio][name="q4"],' +
            '#data-entry-table-1 input[type=radio][name="q5"]').prop('required', $('input[type="hidden"][name="Administration"]').val() === 'All').trigger('change');
          // Show questions rows
          $('#q3_question_row,#q4_question_row,#q5_question_row').removeClass('hidden');
          // If the value doesn't match the triggering value
        } else {
          // Update required properties and cascade
          $('#data-entry-table-1 input[type=radio][name="q3"],' +
            '#data-entry-table-1 input[type=radio][name="q4"],' +
            '#data-entry-table-1 input[type=radio][name="q5"]').prop('required', false).trigger('change');
          // Hide questions rows
          $('#q3_question_row,#q4_question_row,#q5_question_row,' +
            '#q3_description_row,#q4_description_row,#q5_description_row').addClass('hidden');
        }
      }
      // If the parameter doesn't have a value
    } else {
      // Update required properties
      $('#data-entry-table-1 input[type=radio][name="q3"],' +
        '#data-entry-table-1 input[type=radio][name="q4"],' +
        '#data-entry-table-1 input[type=radio][name="q5"]').prop('required', false).trigger('change');
      // Hide questions rows
      $('#q3_question_row,#q4_question_row,#q5_question_row,' +
        '#q3_description_row,#q4_description_row,#q5_description_row').addClass('hidden');
    }
  });
}

/**
 *
 * Function to add a listener to the inputs which gate the lethality question
 * of the second section.
 *
 * @private
 */
function _addLethalityQuestionsListeners() {
  // For changes to the inputs of either of the questions which gate the
  // lethality questions
  $('#data-entry-table-1 input[type="radio"][name="q1"], #data-entry-table-1 input[type="radio"][name="q2"]').on('change', function(e) {
    // If at least one of the parameters has a checked value
    if ($(`#data-entry-table-1 input[type="radio"][name="${$(e.target).prop('name')}"]:checked`).length === 1 ||
      $(`#data-entry-table-1 input[type="radio"][name="${$(e.target).prop('name') === 'q1' ? 'q2' : 'q1'}"]:checked`).length === 1) {
      // If the value matches the checked value
      if ($(e.target).prop('checked')) {
        // If at least one of the parameters matches the triggering value
        if ($(e.target).val() === '1' ||
          $(`#data-entry-table-1 input[type="radio"][name="${$(e.target).prop('name') === 'q1' ? 'q2' : 'q1'}"]:checked`).val() === '1') {
          // Show lethality table
          $('#data-entry-table-2').removeClass('hidden');
          // Update requirement if in administration all and cascade to
          // update the other question
          $('#Actual_Lethality').prop('required', $('input[type="hidden"][name="Administration"]').val() === 'All').trigger('change');
          // If the value doesn't match the triggering value in either parameter
        } else {
          // Hide lethality table
          $('#data-entry-table-2').addClass('hidden');
          // Update required properties
          $('#Actual_Lethality').prop('required', false).trigger('change');
        }
      }
      // If both parameters don't have values
    } else {
      // Hide lethality table
      $('#data-entry-table-2').addClass('hidden');
      // Update required properties
      $('#Actual_Lethality').prop('required', false).trigger('change');
    }
  });
}

/**
 *
 * Function to add listeners to the select elements.
 *
 */
function addSelectListeners() {
  _addActualLethalitySelectListener();
}

/**
 *
 * Function to add a listener to the select element which gates the second
 * lethality question.
 *
 * @private
 */
function _addActualLethalitySelectListener() {
  // For changes on the gating select input
  $('#Actual_Lethality').on('change', function(e) {
    // Get the table's body node
    let tableBodyNode = $(e.target).parent().parent().parent();
    // If the select input matches the triggering value
    if ($(e.target).val() === '0') {
      // Show the question and description rows of the second question
      $('tr.question-row:nth-child(3), tr.question-description:nth-child(4)', tableBodyNode).removeClass('hidden');
      // Update the required parameter of the other select to match administration
      $('#Potential_Lethality').prop('required', $('input[type="hidden"][name="Administration"]').val() === 'All');
      // If the parameter doesn't match the triggering value
    } else {
      // Hide question and description rows of the second question
      $('tr.question-row:nth-child(3), tr.question-description:nth-child(4)', tableBodyNode).addClass('hidden');
      // Update the required parameter
      $('#Potential_Lethality').prop('required', false);
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
