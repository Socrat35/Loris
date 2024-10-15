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
  // Add select input listeners
  addSelectInputListeners();
  // Add listeners for hidden inputs
  addHiddenInputListeners();
  // Add listeners for double-clicks on questions
  addDoubleClickListeners();
  // Add button listeners
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
  if ($('#data-entry-table1').length) {
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
    // Reload the page following the format accepted by the rewrite rules
    window.location.href = '/' +
      candID + '/' +
      sessionID + '/' +
      'HQ/Data_Entry/?' +
      'Test_Language=' + testLanguage +
      '&commentID=' + commentID;
  });
}

/**
 * Function which adds listeners to the hidden inputs of each question
 * used to track the administration status of individual questions.
 */
function addHiddenInputListeners() {
  // On change of the value of the administration status of a question
  $('input[type="hidden"].question-administration').on('change', function(e) {
    let value = $(e.target).val();
    let container = $(e.target).parent();
    // If the administration is set to true
    if (value === 'true') {
      // Toggle the container's class to question-asked
      $(container).toggleClass('question-asked question-not-asked');
      // For each radio and textarea controls in the container
      $('input[type="radio"], textarea', container).each(function(index, element) {
        // Enable
        $(element).prop('disabled', false);
      });
      // If the administration is set to false
    } else if (value === 'false') {
      // Toggle the container class
      $(container).toggleClass('question-asked question-not-asked');
      // For each radio and textarea controls in the container
      $('input[type="radio"], textarea', container).each(function(index, element) {
        // If a radio element
        if ($(element)[0].tagName === 'INPUT') {
          // Set checked to false
          $(element).prop('checked', false);
          // If textarea
        } else {
          // Set to empty
          $(element).val('');
        }
        // Disable both radio and textarea elements
        $(element).prop('disabled', true);
      });
    }
  });
}

/**
 * Function which adds a double-click listener to question containers.
 */
function addDoubleClickListeners() {
  // On double-clicking a question container
  $('.question-container').on('dblclick', function(e) {
    // If the form is not frozen
    if ($('input[type="hidden"][name="frozen"]').val() === '') {
      // Get container if event is triggered on element of container
      let container = $(e.target).closest('.question-container');
      // Get the administration value of the question
      let value = $('input[type="hidden"].question-administration', container).val();
      // If the question is administered
      if (value === 'true') {
        // Set administration to false
        $('input[type="hidden"].question-administration', container).val('false');
        // If the question is not administered
      } else {
        // Set administration to true
        $('input[type="hidden"].question-administration', container).val('true');
      }
      // Trigger a change event on the question administration hidden input
      $('input[type="hidden"].question-administration', container).trigger('change');
    }
  });
}

/**
 * Function which adds the listeners for the various buttons.
 */
function addButtonListeners() {
  // Add reset button listener
  addResetButtonListener();
  // Add submit button listener
  addSubmitButtonListener();
}

/**
 * Function which adds a listener on the reset button of the data entry page.
 */
function addResetButtonListener() {
  // For clicks on the reset button
  $('#reset_button').on('click', function(e) {
    // Prevent default behavior
    e.preventDefault();
    // Set instrument embargo and language to default values
    $('#Embargo').val('Internal');
    $('#test_language').val('fr');
    // Empty the radios
    $('input[type=radio]').each(function(index, element) {
      $(element).prop('checked', false);
    });
    // Empty the text boxes
    $('textarea').each(function(index, element) {
      $(element).val('');
    });
    // Setting values for default justified binary questions (Q1-Q5)
    for (let i = 1; i < 6; i++) {
      // Get hidden input node and question container
      let hiddenInput = $(`input[type="hidden"][name="q${i}_administration"]`);
      let container = $(hiddenInput).parent();
      // Set administration to true
      $(hiddenInput).val('true');
      // Enable radio and textarea elements
      $('.question-answer > label > input, .question-comment > textarea', container).each(function(index, element) {
        $(element).prop('disabled', false);
      });
      // Set class to question-asked
      $(container).removeClass('question-not-asked').addClass('question-asked');
    }
    // Setting values for default text questions
    let textQuestions = {6: 'true', 7: 'false', 8: 'false', 9: 'false', 10: 'false'};
    // For each question, set defaults
    Object.keys(textQuestions).forEach(function(questionID) {
      // Get hidden input node and question container
      let hiddenInput = $(`input[type="hidden"][name="q${questionID}_administration"]`);
      let container = $(hiddenInput).parent();
      // Set administration to default value for the question
      $(hiddenInput).val(textQuestions[questionID]);
      // Enable textarea elements on question that are active by default
      $('.question-answer > textarea', container).each(function(index, element) {
        $(element).prop('disabled', textQuestions[questionID] !== 'true');
      });
      // Set the container class to match the default administration
      $(container).removeClass('question-not-asked question-asked').addClass(textQuestions[questionID] === 'true' ? 'question-asked' : 'question-not-asked');
    });
  });
}

/**
 * Function which adds a listener to the submit button of the data entry page.
 */
function addSubmitButtonListener() {
  $('#fire_control').on('submit click', function(e) {
    // For all textareas, check that no invalid characters are used
    $('textarea').each(function(index, element) {
      // If not empty
      if ($(element).val() !== '') {
        // Use regex to find invalid characters
        let matches = $(element).val()
          .match(/[^\w\s\d\.\-_~,;:\[\]\(\)\?!'ÀàÂâÄäÇçÉéÈèÊêÌìÏïÔôÖöÒòÙùÛûÜü]/g);
        // If matches were found
        if (matches !== null) {
          // Stop the propagation
          e.preventDefault();
          // Display an error message appropriate for a textarea
          fancyErrorPrompt(
            'Error',
            `The field ${$(element).prop('name')} uses unsupported characters:` + matches);
          // Break out of the each() loop using a false return
          return false;
        }
      }
    });
    // Validate bounded answers
    if (!_validateBoundedAnswer(
      'question7',
      300,
      70,
      'Please provide the systolic blood pressure as an integer between 70 and 300 mmHg.')) {
      e.preventDefault();
      return false;
    }
    if (!_validateBoundedAnswer(
      'question8',
      200,
      40,
      'Please provide the diastolic blood pressure as an integer between 40 and 200 mmHg.')) {
      e.preventDefault();
      return false;
    }
    if (!_validateBoundedAnswer(
      'question9',
      200,
      40,
      'Please provide the heartbeat as an integer between 40 and 200 beats per minute.')) {
      e.preventDefault();
      return false;
    }
    if (!_validateBoundedAnswer(
      'question10',
      300.0,
      40.0,
      'Please provide the weight as a float between 40.0 and 300.0 pounds.',
      false)) {
      e.preventDefault();
      return false;
    }
  });
}

/**
 * Function which validates the provided numerical answer based on specified
 * bounds and number types, prompts the user in case of error and then returns
 * the validation result.
 * @param {string} id           id of the element to be validated
 * @param {Number} upperBound   Upper bound of the valid numbers
 * @param {Number} lowerBound   Lower bound of the valid numbers
 * @param {string} errorMessage Error message to be displayed for invalid answers
 * @param {boolean} isInteger   Is the answer an integer or a float
 * @returns {boolean}   Was the answer provided valid or not
 * @private
 */
function _validateBoundedAnswer(id, upperBound, lowerBound, errorMessage, isInteger = true) {
  // Extract the value from the id provided
  let text = $(`#${id}`).val();
  // If the element exists and the value is not empty
  if (text !== undefined && text !== '') {
    // If the value is an integer, parseInt, otherwise parseFloat
    let value = isInteger ? Number.parseInt(text, 10) : Number.parseFloat(text);
    // If the value can't be parsed or is outside of bounds
    if (isNaN(value) || value > upperBound || value < lowerBound) {
      // Prompt the error message
      fancyErrorPrompt('Error', errorMessage);
      // Return invalid
      return false;
    }
  }
  // Return valid
  return true;
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
