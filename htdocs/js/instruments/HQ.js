/**
 * Helper script for the two pages of the Health Questionnaire (HQ) instrument.
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
  // Add listeners for select elements
  addSelectInputListeners();
  // Add listeners for radio elements
  addRadioInputListeners();
  // Add listeners for the buttons
  addButtonListeners();
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
  if ($('#data-entry-table4').length) {
    // Detach the current lorisworkspace div
    let currentSpace = $('#lorisworkspace').detach();
    // Remove the two information tables from their div and append the
    // saved structure to the proper element
    $('div.inset > div:nth-child(2)').empty().append(currentSpace);
  }
}

/**
 * Function to add listeners for the select elements of
 * the data entry page which set instrument-wide values.
 */
function addSelectInputListeners() {
  // For the select control with the test-settings class
  $('select.test-settings').on('change', function(e) {
    // Prevent the default behavior
    e.preventDefault();
    // Parse the candID, sessionID and commentID from the address produced
    // by the .htaccess rewrite rules of the site
    let locationParameters = $(location).attr('href')
      .match(/^https:\/\/.+\/([0-9]+)\/([0-9]+).+commentID=([0-9A-Za-z_]+)$/);
    // Assign the values to separate variables
    let candID = locationParameters[1];
    let sessionID = locationParameters[2];
    let commentID = locationParameters[3];
    // Fetch the values of the select controls and assign them to variables
    let testLanguage = $('#test_language').val();
    let testVersion = $('#test_version').val();
    // Reload the page following the format accepted by the rewrite rules
    window.location.href = '/' +
      candID + '/' +
      sessionID + '/' +
      'HQ/Data_Entry/?' +
      'Test_Language=' + testLanguage +
      '&Test_Version=' + testVersion +
      '&commentID=' + commentID;
  });
}

/**
 * Function which adds a listener to the radio buttons of the justified
 * binary questions to update the associated justifications' visibility and
 * required status when the checked state of the radio buttons change.
 */
function addRadioInputListeners() {
  // On state change of the radio buttons for justified binary questions
  $('input.justified-binary-question').on('change', function(e) {
    // QuestionID value
    let identifier = $(e.target).prop('name');
    // Node of the table row matching the changed radio button value
    let parent = $(e.target).parents()[4];
    // If the checked value is Yes
    if ($(e.target).val() === '1') {
      // Show the cell with the justification
      $('td:nth-child(2)', parent).removeClass('hidden');
      // Set the english justification to required
      $('#' + identifier + '_justification_en').prop('required', true);
      // If the checked value is No
    } else if ($(e.target).val() === '0') {
      // Hide the cell with the justification
      $('td:nth-child(2)', parent).addClass('hidden');
      // Remove the requirement for the english justification
      $(`#${identifier}_justification_en`).prop('required', false);
      // If the value is something else (blank in this case due to reset)
    } else {
      // Hide the cell with the justification
      $('td:nth-child(2)', parent).addClass('hidden');
      // Remove the requirement for the english justification
      $(`#${identifier}_justification_en`).prop('required', false);
    }
  });
  // Initialize the states of the justifications
  $('input.justified-binary-question:checked').trigger('change');
}

/**
 * Function which adds listeners for the buttons.
 */
function addButtonListeners() {
  // Add reset button listener
  addResetButtonListener();
  // Add submit button listener
  addSubmitButtonListener();
}

/**
 * Function which resets the data entry page to a blank value instead of
 * the starting state of the standard reset action.
 */
function addResetButtonListener() {
  // For clicks on the reset button
  $('#reset_button').on('click', function(e) {
    // Prevent default behavior
    e.preventDefault();
    // Set instrument embargo to default values
    $('#Embargo').val('Internal');
    // Empty the comments
    $('#Comments').val('');
    // Empty the text input fields
    $('input.text-question[type=text]').each(function(index, element) {
      $(element).val('');
    });
    // Empty the radios
    $('input[type=radio]').each(function(index, element) {
      $(element).prop('checked', false);
    });
    // Empty the justifications textareas
    $('.justified-binary-justification-cell > div > textarea')
      .each(function(index, element) {
        // Empty the textarea
        $(element).val('');
        // Remove the requirement property
        $(element).prop('required', false);
      });
    // Hide the justifications cells
    $('.justified-binary-justification-cell').each(function(index, element) {
      $(element).addClass('hidden');
    });
  });
}

/**
 * Function to add a listener to the submit button to do a more complex
 * validation of values in the front-end to avoid data loss with failed
 * server-side validation.
 */
function addSubmitButtonListener() {
  $('#fire_control').on('submit click', function(e) {
    // For all text inputs and textareas
    $('textarea, input.text-question[type=text]').each(function(index, element) {
      // If not empty
      if ($(element).val() !== '') {
        // Use regex to find invalid characters
        let matches = $(element).val()
          .match(/[^\w\s\d\.\-_~,;:\[\]\(\)\?!'ÀàÂâÄäÇçÉéÈèÊêÌìÏïÔôÖöÒòÙùÛûÜü]/g);
        // If matches were found
        if (matches !== null) {
          // Stop the propagation
          e.preventDefault();
          // If the element is a text input
          if ($(element)[0].tagName === 'INPUT') {
            // Display an error message appropriate for a text answer
            fancyErrorPrompt(
              'Error',
              `The answer ${$(element).val()} uses unsupported characters:` + matches);
            // If the element is a textarea
          } else if ($(element)[0].tagName === 'TEXTAREA') {
            // Display an error message appropriate for a textarea
            fancyErrorPrompt(
              'Error',
              `The ${$(element).prop('name').slice(-2) === 'fr' ? 'French' : 'English'} justification of question ${$(element).attr('displayNumber')}) uses unsupported characters:` + matches);
          }
          // Break out of the each() loop using a false return
          return false;
        }
      }
    });
    // Validate that all defined justified binary questions have their mandatory justification
    $('input.justified-binary-question[type=radio]').each(function(index, element) {
      // Get the name and display number of the radio button
      let name = $(element).prop('name');
      let displayNumber = $(element).attr('displayNumber');
      // If the radio button is a Yes and the matching English justification
      // is empty
      if (
        $(`input[type=radio][name=${name}]:checked`).val() === '1' &&
        $(`#${name}_justification_en`).val() === '') {
        // Prevent propagation
        e.preventDefault();
        // Display an appropriate message
        fancyErrorPrompt(
          'Error',
          `Question ${displayNumber}) needs a mandatory English justification.`);
        // Break out of the each() loop using a false return
        return false;
      }
    });
  });
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
    text: message
  });
}
