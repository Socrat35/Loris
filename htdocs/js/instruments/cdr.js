/**
 * Helper script for the two pages of the cdr instrument.
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
// Handle for the C3 current results graph object
let currentResultsChart;
// Handle for the C3 longitudinal results graph object
let longitudinalResults;
// Mapping for current results' columns
let crMap = {Memory: 2,
  Orientation: 3,
  Judgment: 4,
  Community: 5,
  Hobbies: 6,
  Care: 7,
  SumBoxes: 8,
  TotalComputed: 9,
  TotalManual: 10};
// Mapping for longitudinal results' columns
let lrMap = {Visit: 1,
  Language: 2,
  Memory: 45,
  Orientation: 71,
  Judgment: 93,
  Community: 110,
  Hobbies: 121,
  Care: 127,
  SumBoxes: 129,
  TotalComputed: 130,
  TotalManual: 131};
// jQuery function for waiting until the page is ready
$(document).ready(function() {
  // If on a data entry page of the instrument
  if (['Data_Entry_Subject', 'Data_Entry_Informant']
    .includes($('input[type=hidden][name=page]').val())) {
    // Removes the info tables for the data entry pages
    adjustDefaultDisplayElementsForDataEntry();
    // If the form is unfrozen
    if ($('#isFrozen').val() === 'false') {
      // Add listeners
      _addInstrumentSettingsListeners();
      _addScoreDescriptionListeners();
      _addConditionalFieldsListeners();
      _addSubcategoryScoresListeners();
      _addResetButtonListener();
      _addSubmitButtonListener();
      // Initialize the select controls to their set values
      $('select.category-score:first-child').trigger('change');
    }
    // If on the top page of the instrument
  } else {
    // Adjusts the background color of the Window Difference cell
    dynamicallyAdjustWindowDifferenceBackgroundColor();
    // add tooltips
    addTopTooltips();
    // Add modal state handlers
    addModalStateHandlers();
    // Add session button listeners for the top page
    addSessionButtonListeners();
    // Add listeners for the defaults button of the top page
    addDefaultsButtonListener();
    // Add listeners for the customization buttons of the top page modal
    addCustomizationButtonListeners();
    // Initialize the buttons on the top page
    $('label.sessionButton > input[type=checkbox]').trigger('change');
    $('#setDefaultTableBtn').trigger('change');
    // Initialize the results' charts
    initializeResultsCharts();
  }
});

/**
 * Function which removes default elements from the display to maximize
 * the space available for data entry.
 */
function adjustDefaultDisplayElementsForDataEntry() {
  // Detach the current lorisworkspace div
  let currentSpace = $('#lorisworkspace').detach();
  // Remove the two information tables from their div and append the
  // saved structure to the proper element
  $('div.inset > div:nth-child(2)').empty().append(currentSpace);
}

/**
 * Function which adds listeners for the instrument settings select controls.
 */
function _addInstrumentSettingsListeners() {
  $('select.test-settings').on('change', function(e) {
    // Prevent the default behavior
    e.preventDefault();
    // Parse the candID, sessionID and commentID from the address produced
    // by the .htaccess rewrite rules of the site
    let locationParameters = $(location)
      .attr('href')
      .match(/^https:\/\/.+\/([0-9]+)\/([0-9]+)\/(\w+)\/(\w+).+commentID=([0-9A-Za-z_]+)$/);
    // Assign the values to separate variables
    let candID = locationParameters[1];
    let sessionID = locationParameters[2];
    let instrumentName = locationParameters[3];
    let pageName = locationParameters[4];
    let commentID = locationParameters[5];
    // Fetch the values of the select controls and assign them to variables
    let testLanguage = $('#test_language').val();
    // Reload the page following the format accepted by the rewrite rules
    window.location.href = '/' +
      candID + '/' +
      sessionID + '/' +
      instrumentName + '/' +
      pageName + '/?' +
      'Test_Language=' + testLanguage +
      '&commentID=' + commentID;
  });
}

/**
 * Function which adds a listener to the category scores to implement changes
 * to the description cell to match the scores' values.
 * @private
 */
function _addScoreDescriptionListeners() {
  // On changes to a category score
  $('select.category-score').on('change', function(e) {
    // Get the option selected
    let option = $('option:selected', e.target);
    // Get the node of the description cell
    let target = $(e.target).parent().next();
    // Empty the cell
    $(target).empty();
    // If the option selected is not empty
    if ($(option).val() !== '') {
      // Append a string to describe the value to the description cell based on the option's
      // value-title and value-description properties
      $(target).append($('<span></span>').text($(option).attr('value-title'))
        .addClass('bold')).append('<br/>').append($('<span></span>')
        .text($(option).attr('value-description')).addClass('small'));
    }
  });
}

/**
 * Function which adds listeners to implement the inter-field logical constraints.
 * @private
 */
function _addConditionalFieldsListeners() {
  // If on informant's page
  if ($('input[type="hidden"][name="page"]').val() === 'Data_Entry_Informant') {
    $('input[name="Informant_C1_Q1"]').on('change', function() {
      if ($('input[name="Informant_C1_Q1"]:checked').val() === '1') {
        _enableRadioInputs('Informant_C1_Q1a');
      } else {
        _disableAndClearRadioInputs('Informant_C1_Q1a');
      }
    });
    $('input[name="Informant_C3_Q4"]').on('change', function() {
      if ($('input[name="Informant_C3_Q4"]:checked').val() === '3') {
        $('#Informant_C3_Q4_Justification').prop('disabled', false);
      } else {
        $('#Informant_C3_Q4_Justification')
          .prop('value', '').prop('disabled', true);
      }
    });
    $('input[name="Informant_C4_Q1"]').on('change', function() {
      let value = $('input[name="Informant_C4_Q1"]:checked').val();
      if (value === '1') {
        _disableAndClearRadioInputs('Informant_C4_Q2');
        _enableRadioInputs('Informant_C4_Q3');
      } else if (value === '2') {
        _enableRadioInputs('Informant_C4_Q2');
        _disableAndClearRadioInputs('Informant_C4_Q3');
      } else {
        _disableAndClearRadioInputs('Informant_C4_Q2');
        _disableAndClearRadioInputs('Informant_C4_Q3');
      }
    });
    $('input[name="Informant_C4_Q4"]').on('change', function() {
      if ($('input[name="Informant_C4_Q4"]:checked').val() === '1') {
        _enableRadioInputs('Informant_C4_Q4a', true);
      } else {
        _disableAndClearRadioInputs('Informant_C4_Q4a', true);
        _disableAndClearRadioInputs('Informant_C4_Q4b');
        _disableAndClearRadioInputs('Informant_C4_Q5');
      }
    });
    $('input[name="Informant_C4_Q4a"]').on('change', function() {
      let value = $('input[name="Informant_C4_Q4a"]:checked').val();
      if (value === '1') {
        _disableAndClearRadioInputs('Informant_C4_Q4b');
        _enableRadioInputs('Informant_C4_Q5');
      } else if (value === '2') {
        _enableRadioInputs('Informant_C4_Q4b');
        _disableAndClearRadioInputs('Informant_C4_Q5');
      } else {
        _disableAndClearRadioInputs('Informant_C4_Q4b');
        _disableAndClearRadioInputs('Informant_C4_Q5');
      }
    });
    $('input[name="Informant_C4_Q8"]').on('change', function() {
      if ($('input[name="Informant_C4_Q8"]:checked').val() === '2') {
        $('#Informant_C4_Q8a').prop('disabled', false);
      } else {
        $('#Informant_C4_Q8a').val('').prop('disabled', true);
      }
    });
    // Initialize the field values for trigger fields
    $('input[name="Informant_C1_Q1"],' +
      'input[name="Informant_C3_Q4"],' +
      'input[name="Informant_C4_Q1"],' +
      'input[name="Informant_C4_Q4"],' +
      'input[name="Informant_C4_Q4a"],' +
      'input[name="Informant_C4_Q8"]').trigger('change');
  }
}

/**
 * Wrapper function to enable all inputs with the provided name and trigger,
 * if specified, an event on each.
 * @param {string}  name          Name shared by the inputs to be enabled
 * @param {Boolean}  forwardEvent Should an event be triggered on the enabled field
 * @param {String}  eventType     Event type to be triggered on the fields
 * @private
 */
function _enableRadioInputs(name, forwardEvent = false, eventType = 'change') {
  // if an event needs to be triggered
  if (forwardEvent) {
    // Enable all inputs sharing the name and trigger events
    $(`input[name="${name}"]`).prop('disabled', false).trigger(eventType);
    // If no events needed
  } else {
    // Just enable the inputs
    $(`input[name="${name}"]`).prop('disabled', false);
  }
}

/**
 * Wrapper function to disable and clear all inputs with the name provided and
 * trigger, if specified, an event on each.
 * @param {String}  name          Name shared by the inputs
 * @param {Boolean} forwardEvent  Should an event be triggered on the enabled field
 * @param {String}  eventType     Event type to be triggered on the fields
 * @private
 */
function _disableAndClearRadioInputs(
  name,
  forwardEvent = false,
  eventType = 'change') {
  // If an event needs to be triggered
  if (forwardEvent) {
    // Uncheck all inputs of the name provided, disable them and trigger event
    $(`input[name="${name}"]`).prop('checked', false).prop('disabled', true)
      .trigger(eventType);
    // If no event
  } else {
    // uncheck and disable the inputs
    $(`input[name="${name}"]`).prop('checked', false).prop('disabled', true);
  }
}

/**
 * Function which adds a listener to the select controls for the category scores
 * @private
 */
function _addSubcategoryScoresListeners() {
  // When a category score is changed
  $('select.category-score').on('change', function() {
    // Get the scores of all categories and filter out the empty ones
    let scores = [$('#C1_Score').val(),
      $('#C2_Score').val(),
      $('#C3_Score').val(),
      $('#C4_Score').val(),
      $('#C5_Score').val(),
      $('#C6_Score').val()].filter(score => {
        return score !== '';
      });
    // If all category scores are not empty
    if (scores.length === 6) {
      // Compute the CDR Score
      $('#CDR_Score_Computed').val(_computeCDRScore(...scores));
      // Parse the scores to floats, sum their values and assign it to the SB input
      $('#Sum_Category_Scores')
        .val(scores.map(x => Number.parseFloat(x))
          .reduce((acc, val) => val + acc, 0));
      // Set the manual score control to not required
      $('#CDR_Score_Manual').prop('required', false);
      // If at least one category score is missing
    } else {
      // Blank the CDR score and the SB
      $('#CDR_Score_Computed').val('').trigger('change');
      $('#Sum_Category_Scores').val('');
      // If on partial administration, set manual score to 'required'. If on all or none, set to not required
      $('#CDR_Score_Manual')
        .prop('required', $('#Administration').val() === 'Partial');
    }
  });
}

/**
 *
 * Implementation to match the NACC website's (https://naccdata.org/data-collection/tools-calculators/cdr)
 * version written and updated by Jack Baty (jack@wubios.wustl.edu). This implementation
 * doesn't match exactly what is described in the article, but was validated by
 * the original author so it will be used here.
 *
 * @param {string} memory             Score for the memory category
 * @param {string} orientation        Score for the orientation category
 * @param {string} judgement          Score for the judgment and problem-solving category
 * @param {string} communityAffairs   Score for the community affairs category
 * @param {string} homeHobbies        Score for the home and hobbies category
 * @param {string} personal           Score for the personal care category
 * @return {number}  Global CDR score
 * @private
 */
function _computeCDRScore(memory,
  orientation,
  judgement,
  communityAffairs,
  homeHobbies,
  personal) {
  let memoryScore = parseFloat(memory);
  let scores = [memoryScore,
    parseFloat(orientation),
    parseFloat(judgement),
    parseFloat(communityAffairs),
    parseFloat(homeHobbies),
    parseFloat(personal)];
  let scoreCDR = 0;
  let equalToMemory = 0;
  let greaterThanMemory = 0;
  let lesserThanMemory = 0;
  let subscores = {0: 0,
    0.5: 0,
    1: 0,
    2: 0,
    3: 0};
  // for all scores except "memory"
  for (let i = 1; i < scores.length; i++) {
    // increment the counter matching the relationship between the subcategory
    // score and the memory subscore
    if (scores[i] > memoryScore) {
      greaterThanMemory += 1;
    } else if (scores[i] === memoryScore) {
      equalToMemory += 1;
    } else if (scores[i] < memoryScore) {
      lesserThanMemory += 1;
    }
    // Increment the subscore couter for the matching value
    subscores[scores[i]] += 1;
  }
  // RULE = "1"
  /* CDR = M if at least three secondary categories are given the same
     score as memory.*/
  if (equalToMemory >= 3) {
    scoreCDR = memoryScore;
    // RULE = "2"
    /* Whenever three or more secondary categories
     are given a score greater or less than the memory score,
     CDR = score of the majority of secondary categories */
  } else if (greaterThanMemory + lesserThanMemory >= 3) {
    if (Math.abs(greaterThanMemory - lesserThanMemory) > 1) {
      // Note: here the implementation uses a carry over value for
      // the CDR score in ascending order of the score value being evaluated
      // which is not stipulated in the article. The current function matches
      // the reference implementation but the discrepancy between the rule and
      // the implementation merits remarking
      let max = 0;
      // Extract the possible scores, parse to float, order in ascending value
      // and for each the values
      Object.keys(subscores)
        .map(Number.parseFloat)
        .sort()
        .forEach(function(score) {
        // If the score's number of instances is larger than the running
        // max and the score is not equal to memory
          if (subscores[score] >= max && memoryScore !== score) {
            // Update running max
            max = subscores[score];
            // Set CDR score to current score
            scoreCDR = score;
          }
        });
    }
  }
  // RULE = "8"
  /* When three secondary categories are scored on one side of M and
     two secondary categories are scored on the other side of M, CDR = M.*/
  if ((greaterThanMemory === 3 && lesserThanMemory === 2) ||
    (greaterThanMemory === 2 && lesserThanMemory === 3)) {
    scoreCDR = memoryScore;
  }
  // RULE = "3"
  // When M = 0.5, CDR = 1 if at least three of the other categories are scored
  // one or greater.
  if (memoryScore === 0.5) {
    if ((subscores[1] + subscores[2] + subscores[3]) >= 3) {
      scoreCDR = 1;
      // RULE = "4"
      // if M = 0.5, CDR cannot be 0...it can only be 0.5
    } else {
      scoreCDR = 0.5;
    }
  }
  // RULE = "5"
  // if M = 0, CDR = 0 unless there is impairment (0.5 or greater) in two or more
  // secondary categories, in which case CDR = 0.5.
  if (memoryScore === 0) {
    if ((subscores[0.5] + subscores[1] + subscores[2] + subscores[3]) >= 2) {
      scoreCDR = 0.5;
      // RULE = "6"
      // if M = 0, CDR = 0 unless there is impairment (0.5 or greater) in two or more
      // secondary categories, in which case CDR = 0.5.
    } else {
      scoreCDR = 0;
    }
  }
  // RULE = "7"
  // With ties in the secondary categories on one side of M, choose the tied
  // scores closest to M for CDR.
  if (
    (greaterThanMemory === 4 || lesserThanMemory === 4) &&
    ((subscores[0] === 2 && subscores[0.5] === 2) ||
      (subscores[0] === 2 && subscores[1] === 2) ||
      (subscores[0] === 2 && subscores[2] === 2) ||
      (subscores[0.5] === 2 && subscores[1] === 2) ||
      (subscores[0.5] === 2 && subscores[2] === 2) ||
      (subscores[0.5] === 2 && subscores[3] === 2) ||
      (subscores[1] === 2 && subscores[2] === 2) ||
      (subscores[1] === 2 && subscores[3] === 2) ||
      (subscores[2] === 2 && subscores[3] === 2))
  ) {
    let equalScores = [];
    // For each possible subscore value
    Object.keys(subscores).forEach(function(score) {
      // If the value has two instances
      if (subscores[score] === 2) {
        // Parse and add to the array
        equalScores.push(Number.parseFloat(score));
      }
    });
    // If the difference between the first score and memory is smaller than
    // with the second score
    if (Math.abs(equalScores[0] - memory) <
      Math.abs(equalScores[1] - memory)) {
      // Set CDR to first score
      scoreCDR = equalScores[0];
      // If the difference between the first score and memory is larger than with
      // the second score
    } else {
      // Set CDR to second score
      scoreCDR = equalScores[1];
    }
  }
  // RULE = "9"
  // When only one or two secondary categories are given the same score as M,
  // CDR = M as long as no more than two secondary categories are on either
  // side of M.
  if (equalToMemory === 1 || equalToMemory === 2) {
    if (greaterThanMemory <= 2 && lesserThanMemory <= 2) {
      scoreCDR = memoryScore;
    }
  }
  // RULE = 10
  // When M = 1 or greater, CDR cannot be 0; in this circumstance, CDR = 0.5
  // when the majority of secondaries are 0
  // Note: again, here we're matching the reference implementation despite
  // the fact that it ignores the third part of the predicate ( && subscores[0] >= 3)
  if (memoryScore >= 1 && scoreCDR === 0) {
    scoreCDR = 0.5;
  }
  return scoreCDR;
}

/**
 * Function which adds a listener to the reset button to correctly
 * reset the inputs to their default values instead of their original ones.
 * @private
 */
function _addResetButtonListener() {
  $('#reset_button').on('click', function(e) {
    e.preventDefault();
    let interviewee = $('input[type=hidden][name=page]')
      .val() === 'Data_Entry_Informant' ? 'Informant' : 'Subject';
    // Reset the interviewee modality and date to default values
    $(`#${interviewee}_Date_taken`).val('');
    $(`#${interviewee}_ModalityID`).val('1');
    // Blank the scores select elements
    $('select.category-score,' +
      '#Sum_Category_Scores,' +
      '#CDR_Score_Manual,' +
      '#CDR_Score_Computed').val('').trigger('change');
    // Blank the possible inputs for the current interviewee
    $('input[type=radio]:not(:disabled)')
      .prop('checked', false).trigger('change');
    // Blank the textareas
    $('textarea:not(:disabled)').val('');
    // Blank the text inputs
    $('input[type=text]:not(:disabled)').val('');
    // Blank the checkboxes
    $('input[type=checkbox]:not(:disabled)').prop('checked', false);
  });
}

/**
 * Function which adds a listener to the submit button to test for some
 * errors and nag, if necessary, based on the category scores' values.
 * @private
 */
function _addSubmitButtonListener() {
  $('#fire_control').on('click', function(e) {
    // Initialize the errors object
    let errors = {};
    // Validate that no textarea or text inputs include
    // unsupported characters
    $('textarea:not(:disabled),' +
      '#data_entry_form input[type="text"]:not(:disabled)').each(function() {
        let matches = $(this).val()
          .match(/[^()?!:0-9a-z,\.'\-\/àâçéèêëîïôûùüÿñæœ ]/gi);
        if (matches) {
          e.preventDefault();
          errors[$(this).prop('name')] = matches.toString();
        }
      });
    // Prompt error message for invalid characters in comments
    if (Object.keys(errors).length !== 0) {
      _submitErrorMessage(
        errors,
        'There are invalid characters in some of the comments' +
        ' or text fields of the form: ',
        'Invalid Comments Characters');
      return;
    }
    // Initialize the impaired categories object
    let impairedCategories = {};
    // For all the categories
    for (let i = 1; i < 7; i++) {
      // Get the score
      let score = Number.parseFloat($(`#C${i}_Score`).val());
      // If the score is larger or equal to 0.5
      if (score >= 0.5) {
        // Add score and category to the object
        impairedCategories[i] = score;
      }
    }
    // If there are 1 or more impaired categories
    if (Object.keys(impairedCategories).length > 0) {
      // If the partial entry input is not set
      if ($('#isPartialEntryAcceptable').val() === '') {
        e.preventDefault();
        let messageString = '<p>Categories with an impairment score of 0.5 or ' +
          'more are present:</p><br/>';
        Object.keys(impairedCategories).forEach(function(category) {
          messageString += `<p>Category ${category}: Score of ${impairedCategories[category]}</p>`;
        });
        messageString += '<br/><p>Please make sure that the amount of ' +
          'questions answered for those categories matches your targeted ' +
          'level of data entry.</p>';
        swal({
          title: 'Categories with impairment detected',
          type: 'warning',
          showCancelButton: true,
          showConfirmButton: true,
          cancelButtonText: 'Back to data entry',
          confirmButtonText: 'Confirmed',
          text: messageString,
          html: true
          // If nag screen is confirmed
        }, function() {
          // Set partial entry input to 1
          $('#isPartialEntryAcceptable').val('1');
        });
      }
    }
  });
}

/**
 * Function which, if it exists, adjusts the background color
 * of the Window Difference cell on a gradient from red to green
 * with anything over 6 months being the maximum red.
 */
function dynamicallyAdjustWindowDifferenceBackgroundColor() {
  // If on the top page
  if (['Data_Entry_Informant', 'Data_Entry_Subject']
    .includes($('input[type=hidden][name=page]').val()) === false) {
    // Parse the content of the cell as a positive integer
    let difference = Math.abs(parseInt($('#windowDifferenceCell > p')
      .html(), 10));
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
 * Function to add bootstrap tooltips to specific elements of the top page.
 */
function addTopTooltips() {
  // For all session buttons when on top page
  $('label.sessionButton').each(function(index, element) {
    // Make the button tooltip
    makeSessionButtonTooltip(element);
  });
}

/**
 * Function which adds listeners to the state of display of the
 * customization modal.
 */
function addModalStateHandlers() {
  // Add handlers for when the modal is shown
  addShowModalHandler();
}

/**
 * Listener which triggers the update of the customization buttons upon
 * showing the modal.
 */
function addShowModalHandler() {
  $('#customizationModal').on('show.bs.modal', function() {
    updateCustomizationButtons();
  });
}

/**
 * Function which adds listeners to the session buttons of the top page.
 */
function addSessionButtonListeners() {
  // For every checkbox type input with a sessionButton label
  $('label.sessionButton > input[type=checkbox]').on('change', function(e) {
    // If selected
    if ($(e.target).prop('checked')) {
      // Remove the hidden class from the matching row in the results table
      $('#' + $(e.target).prop('id').slice(0, -6) + 'row')
        .removeClass('hiddenRow');
      // If deselected
    } else {
      // Hide the matching row from the results table
      $('#' + $(e.target).prop('id').slice(0, -6) + 'row')
        .addClass('hiddenRow');
    }
    // Update the chart to match the currently shown results
    updateResultsChart();
  });
}

/**
 * Function which adds a listener to the defaults button of the top page.
 */
function addDefaultsButtonListener() {
  // For any changes on the defaults button for the longitudinal results
  $('#setDefaultTableBtn').on('change', function(e) {
    // If the button was checked
    if ($(e.target).prop('checked')) {
      // Hide all columns
      $('#longitudinal-results-table > thead > tr > th,' +
        '#longitudinal-results-table > tbody > tr > td')
        .each(function(index, element) {
          $(element).hide();
        });
      // The default columns in the longitudinal results table
      let defaults = [lrMap.Visit, lrMap.Memory, lrMap.Orientation,
        lrMap.Judgment, lrMap.Community, lrMap.Hobbies, lrMap.Care,
        lrMap.SumBoxes, lrMap.TotalComputed, lrMap.TotalManual];
      // Show the default columns
      defaults.forEach(function(value) {
        $('#longitudinal-results-table > thead > tr > th:nth-child(' + value + '),' +
          '#longitudinal-results-table > tbody > tr > td:nth-child(' + value + ')').each(function(index, element) {
            $(element).show();
          });
      });
      // If the button is unchecked
    } else {
      // Show all columns
      $('#longitudinal-results-table > thead > tr > th,' +
        '#longitudinal-results-table > tbody > tr > td')
        .each(function(index, element) {
          $(element).show();
        });
    }
  });
}

/**
 * Function which adds listeners to the customization buttons of the modal.
 */
function addCustomizationButtonListeners() {
  $('#customizationModal label').each(function(index, value) {
    $(value).on('click', function(e) {
      let checkbox = $('input[type=checkbox]', e.target);
      // Toggle the visibility of the associated column in the longitudinal
      // results table
      $('#longitudinal-results-table > thead > tr > th:nth-child(' + $(checkbox).attr('data-column') + '),' +
        '#longitudinal-results-table > tbody > tr > td:nth-child(' + $(checkbox).attr('data-column') + ')').each(function(index, element) {
          $(element).toggle();
        });
      // Toggle the class of the longitudinal button
      $(e.target).toggleClass('btn-danger btn-success');
    });
  });
}

/**
 * Function which updates the customization buttons of the modal based on
 * the visibility of their matching columns in the longitudinal results
 * page.
 */
function updateCustomizationButtons() {
  $('#customizationModal input[type=checkbox]').each(function(index, value) {
    if ($('#longitudinal-results-table > thead > tr > th:nth-child(' + $(value).attr('data-column') + ')').is(':visible')) {
      $(value).prop('checked', true);
      $($(value).parent()).removeClass().addClass('btn btn-success active');
    } else {
      $(value).prop('checked', false);
      $($(value).parent()).removeClass().addClass('btn btn-danger active');
    }
  });
}

/**
 * Function which calculates the data object and display the matching chart
 * if on the top page.
 */
function initializeResultsCharts() {
  // Construct the charts
  displayChartedResults();
  // Show default data on charts
  showDefaultChartData();
}

/**
 * Function which resets the charts' visibilities to the default
 */
function showDefaultChartData() {
  _setDefaultVisibilityCurrentResults();
  _setDefaultVisibilityLongitudinalResults();
}

/**
 * Function which sets the default visibility of the current results' chart.
 */
function _setDefaultVisibilityCurrentResults() {
  // If the chart is defined
  if (currentResultsChart !== undefined) {
    // Show all series
    currentResultsChart.show();
    // Hide the secondary series
    currentResultsChart.hide('Sum Of Boxes');
    // Blank the x tick value matching the secondary axis
    // get categories
    let categories = currentResultsChart.categories();
    // Blank the last one
    categories.splice(-1, 1, '');
    // Update categories
    currentResultsChart.categories(categories);
  }
}

/**
 * Function which sets the default visibility of the longitudinal results' chart.
 */
function _setDefaultVisibilityLongitudinalResults() {
  // If the chart is defined
  if (longitudinalResults !== undefined) {
    // Show all series
    longitudinalResults.show();
    // Hide the secondary series
    longitudinalResults.hide('Sum Of Boxes');
  }
}

/**
 * Function which updates the longitudinal results' charts to match the currently
 * displayed information.
 */
function updateResultsChart() {
  // If the chart exists
  if (longitudinalResults !== undefined &&
    longitudinalResults !== null) {
    // Unload the chart's values
    // Note: async issues if done is not used
    longitudinalResults.unload({
      // When done
      done: function() {
        // Build the data object for the matching chart
        let data = buildLongitudinalDataObject();
        // If there's at least 1 point to display
        if (data[0].length > 1) {
          // Load the data into the chart
          longitudinalResults.load({
            done: _setDefaultVisibilityLongitudinalResults(),
            columns: data
          });
        }
      }
    });
  }
}

/**
 * Function which displays the C3 charts of the top page.
 */
function displayChartedResults() {
  // Build the data object for the current results' chart
  let data = buildCurrentResultsChartData();
  // Generate the current results' chart and associate to matching handle
  currentResultsChart = _generateC3Chart(
    '#currentResultsChart',
    {'Scores': 'bar', 'Sum Of Boxes': 'bar'},
    data,
    {'Scores': 'y', 'Sum Of Boxes': 'y2'},
    _onClickHandlerCurrentResultsChart,
    '',
    'Scores',
    'Sum Of Boxes',
    [],
    ['Sum Of Boxes'],
    false);
  // Build the longitudinal data object
  data = buildLongitudinalDataObject();
  // Build the config object for longitudinal results
  let configObjects = buildLongitudinalConfigObject(data);
  // Generate the C3 chart using both objects
  longitudinalResults = _generateC3Chart(
    '#longitudinalResultsChart',
    configObjects.types,
    data,
    configObjects.axes,
    _onClickHandlerLongitudinalResultsChart,
    '',
    'Scores',
    'Sum Of Boxes',
    [],
    configObjects.series,
    false,
    true,
    true,
    'outer-center',
    'outer-middle',
    'outer-middle',
    {top: 5, bottom: 5},
    {top: 5, bottom: 5});
}

/**
 * Function which builds the data object for the longitudinal results' C3 chart
 * when viewed changes in categories' values over time.
 * @return {[]} array of arrays that can be used as a column value for C3
 */
function buildLongitudinalDataObject() {
  // Initialize array for longitudinal results
  let data = [
    ['x'],
    ['Memory'],
    ['Orientation'],
    ['Judgment'],
    ['Community'],
    ['Hobbies'],
    ['Personal Care'],
    ['CDR Score (Computed)'],
    ['CDR Score (Manual)'],
    ['Sum Of Boxes']];
  // For all rows of the results table which are not hidden
  $('#longitudinal-results-table > tbody > tr:not(.hiddenRow)')
    .each(function(index, element) {
      // Take the visit label from the first cell of the row
      let visitLabel = (($('td:nth-child(1) > a', element).html())
        .replace('<br><span class="font-xsmall">', ' ('))
        .replace('</span>', ')');
      // Initialize the scores array
      let scores = [];
      // For all columns matching a category's score
      [lrMap.Memory, lrMap.Orientation, lrMap.Judgment,
        lrMap.Community, lrMap.Hobbies, lrMap.Care,
        lrMap.TotalComputed, lrMap.TotalManual,
        lrMap.SumBoxes].forEach(function(value) {
        // Push the parsed values to the scores' array
          scores.push(parseFloatCell(value, element));
        });
      // If at least one score is non-null
      if (scores.filter(value => value !== null).length >= 1) {
        // Push the name of the visit to the data array
        data[0].push(`${visitLabel}`);
        // Push the category scores to the matching indices of the data array
        scores.forEach(function(score, index) {
          data[index + 1].push(score);
        });
      }
    });
  // Return the array
  return data;
}

/**
 * Function which builds the data object for the C3 chart of the currents
 * results on the top page.
 * @return {[]}    array of arrays that can be used as a column value for C3
 */
function buildCurrentResultsChartData() {
  // Initialize array for current results
  // Note: the duplication of Sum Of Boxes is necessary to offset
  // the secondary axis series while respecting the internal logic
  // of the C3 implementation
  let data = [['x', 'Memory', 'Orientation', 'Judgment', 'Community', 'Hobbies',
    'Personal Care', 'CDR Score(Computed)', 'CDR Score(Manual)', 'Sum Of Boxes'],
    ['Scores'],
    ['Sum Of Boxes']];
  // Get the first row of the body of the current results table
  let row = $('#results-table > tbody > tr:nth-child(1)');
  // Initialize the scores array
  let scores = [];
  // For each column matching a category score
  [crMap.Memory, crMap.Orientation, crMap.Judgment, crMap.Community,
    crMap.Hobbies, crMap.Care, crMap.TotalComputed, crMap.TotalManual]
    .forEach(function(value) {
    // Push the parsed value for the category score to the scores array
      scores.push(parseFloatCell(value, row));
    });
  // If at least one value of the scores is not null
  if (scores.filter(value => value !== null).length >= 1) {
    // Push all scores to the matching arrays of the data object and include
    // null padding for the secondary series alignment
    data[1] = data[1].concat(scores).concat([null]);
  }
  // Get the sum of boxes value
  let sum = parseFloatCell(crMap.SumBoxes, row);
  // If the sum is defined
  if (sum !== null) {
    // Push a padded array with the sum value to the proper column of the data
    // object
    data[2] = data[2].concat([null, null, null, null, null, null, null, null]).concat([sum]);
  }
  // Return the array
  return data;
}

/**
 * Function which builds a configuration object to use in the generation of a
 * C3 chart generation using a dynamic number of series.
 * @param {[]}  data  Data object used for the generation of the C3 chart
 * @return {{types: {}, series: *[], axes: {}}}   Configuration object holding
 *                                                values for the types, axes
 *                                                and series parameters of a C3
 *                                                chart
 *
 */
function buildLongitudinalConfigObject(data) {
  // Initialize the configuration object
  let configObject = {types: {}, axes: {}, series: []};
  // For each element of the data object
  data.forEach(function(element, index) {
    // If not part of the header row of the data object
    if (index > 0) {
      // If the name of the row doesn't match the secondary axis series (Sum Of Boxes)
      if (element[0].search('Sum') === -1) {
        // Add row name to the types as a line
        configObject.types[element[0]] = 'line';
        // Add row name to the axes as belonging to the main axis
        configObject.axes[element[0]] = 'y';
        // If the name of the row matches
      } else {
        // Add row name to the types as a line
        configObject.types[element[0]] = 'line';
        // Add row name to the axes as belonging to the second axis
        configObject.axes[element[0]] = 'y2';
        // Add row name to the series which belong to the second axis
        configObject.series.push(element[0]);
      }
    }
  });
  // Return the configuration object
  return configObject;
}

/**
 * Wrapper function which allows the generation of a C3 chart object.
 * @param {string} bindElement        ID of the DIV anchor
 * @param {Object}  types             List of the series and their types
 * @param {[][]}  columns             Series data using the C3 object format
 * @param {Object}  axes              List of the series and the axis they belong to
 * @param {Function}  onclickHandler  Handler for clicks on the legend
 * @param {string}  xLabel            Name of the X axis
 * @param {string}  yLabel            Name of the Y axis
 * @param {string}  y2Label           Name of the secondary Y axis
 * @param {[]}  lines                 Names and location of the extra Y grid lines
 * @param {[]}  y2Series              List of the series belonging to the secondary
 *                                    Y axis
 * @param {boolean} y2Showing         Should the secondary axis be visible by default
 * @param {boolean} isZoomable        Zoom functionality of the chart
 * @param {boolean} isRescalable      Rescaling functionality of the chart
 * @param {string}  xPosition         Position of the label of the X axis
 * @param {string}  yPosition         Position of the label of the Y axis
 * @param {string}  y2Position        Position of the label of the secondary Y axis
 * @param {Object}  yPadding          Object holding the padding settings for the Y axis
 * @param {Object}  y2Padding         Object holding the padding settings for the Y2 axis
 * @return {Object}   handle on the generated C3 chart
 * @private
 */
function _generateC3Chart(
  bindElement,
  types,
  columns,
  axes,
  onclickHandler,
  xLabel = '',
  yLabel = '',
  y2Label = '',
  lines = [],
  y2Series = [],
  y2Showing = true,
  isZoomable = true,
  isRescalable = true,
  xPosition = 'outer-center',
  yPosition = 'outer-middle',
  y2Position = 'outer-middle',
  yPadding = {bottom: 0, top: 0},
  y2Padding = {bottom: 0, top: 0}) {
  return c3.generate({
    bindto: bindElement,
    data: {
      empty: {
        label: {
          text: 'No Displayable Data Selected'
        }
      },
      x: 'x',
      types: types,
      columns: columns,
      axes: axes
    },
    axis: {
      x: {
        type: 'category',
        label: {
          text: xLabel,
          position: xPosition
        }
      },
      y: {
        min: 0,
        max: 3,
        padding: yPadding,
        label: {
          text: yLabel,
          position: yPosition
        }
      },
      y2: {
        center: 9,
        show: y2Showing,
        padding: y2Padding,
        label: {
          text: y2Label,
          position: y2Position
        }
      }
    },
    grid: {
      y: {
        lines: lines
      }
    },
    legend: {
      item: {
        onclick: function(id) {
          onclickHandler(this.api, id, columns[0].slice(1), y2Series);
        }
      }
    },
    zoom: {
      enabled: isZoomable,
      rescale: isRescalable
    }
  });
}

/**
 * Function to handle the visibility of the secondary axis and the secondary
 * axis series in a C3 graph object of the current results.
 * @param {Object}  handle    Handle to the C3 graph object
 * @param {String}  id        Identifier of the series clicked
 * @param {[]}  categories    List of the categories associated with the chart
 * @param {[]}  y2Series      Identifiers of the series associated to the secondary axis
 * @private
 */
function _onClickHandlerCurrentResultsChart(
  handle,
  id,
  categories,
  y2Series) {
  // Toggle the series matching the legend element clicked
  handle.toggle(id);
  // List all series shown
  let seriesShown = handle.data.shown();
  // Filter all series shown that belong to the secondary axis
  let y2SeriesShown = seriesShown
    .filter(series => y2Series
      .includes(series.id)).length;
  // Set the visibility of the secondary axis based on the presence
  // of series belonging to the secondary axis
  _sety2AxisVisibility(
    y2SeriesShown >= 1,
    handle);
  // If a secondary axis series is shown
  if (y2SeriesShown >= 1) {
    // Set all x tick values to their original values
    handle.categories(categories);
    // If the secondary axis is not shown
  } else {
    // Blank the last category
    categories.splice(-1, 1, '');
    // Set the categories to the new values
    handle.categories(categories);
  }
}

/**
 * Function to handle the visibility of the secondary axis and the secondary
 * axis series in a C3 graph object for the longitudinal results
 * @param {Object}  handle    Handle to the C3 graph object
 * @param {String}  id        Identifier of the series clicked
 * @param {[]}  categories    List of the categories associated with the chart
 * @param {[]}  y2Series      Identifiers of the series associated to the secondary axis
 * @private
 */
function _onClickHandlerLongitudinalResultsChart(
  handle,
  id,
  categories,
  y2Series) {
  // Toggle the series matching the legend element clicked
  handle.toggle(id);
  // List all series shown
  let seriesShown = handle.data.shown();
  // Filter all series shown that belong to the secondary axis
  let y2SeriesShown = seriesShown
    .filter(series => y2Series
      .includes(series.id)).length;
  // Set the visibility of the secondary axis based on the presence
  // of series belonging to the secondary axis
  _sety2AxisVisibility(
    y2SeriesShown >= 1,
    handle);
}

/**
 * Function which sets the visibility of the Y2 axis of a C3 chart. This
 * is necessary due to missing functionality in the current API. Should be
 * replaced with a native API call as soon as possible.
 * @param {boolean} visibility  Visibility of the second Y axis
 * @param {Object} chartHandle    C3 Object of the chart to be updated
 */
function _sety2AxisVisibility(visibility, chartHandle) {
  // Set the internal visibility of the y2 axis to the matching parameter
  chartHandle.internal.config.axis_y2_show = visibility;
  // Toggle the style of the y2 axis based on set visibility
  chartHandle.internal.axes.y2.style('visibility', visibility ? 'visible' : 'hidden');
  // Redraw chart to update display
  chartHandle.internal.redraw();
}

/**
 * Function which parses the data of a float cell result into a number.
 * @param {int} column  Number of the column of the cell in the results table
 * @param {jQuery} element  jQuery node of the cell's row
 * @return {?number}  Score or null
 */
function parseFloatCell(column, element) {
  // Take the value from the cell of the column identified using the
  // context provided
  let result = $('td:nth-child(' + column + ')', element).html();
  // If the value is empty, null or doesn't exist, set to null, otherwise,
  // parse to float
  result = result === undefined ||
  result === null ||
  result === '' ?
    null :
    isNaN(Number.parseFloat(result)) ?
      null :
      Number.parseFloat(result);
  return result;
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
 * Function which creates session button tooltips based on the properties
 * of the session button
 * @param {jQuery} e  jQuery node of the session button
 */
function makeSessionButtonTooltip(e) {
  // Initialize the HTML string
  let HTMLString = '';
  // Get the reliability level of the button
  let level = $(e).attr('data_level');
  // Append the validity name with the validity color
  HTMLString += `<p>Validity: <span class="${level}">${level}</span></p>`;
  // Get the visit label
  let visitLabel = $(e).attr('data_Visit_label');
  // Append the visit label with the reliability color
  HTMLString += `<p><span class="bold ${level}">${visitLabel}</span></p>`;
  // Get the status of the visit
  let statusTimepoint = $(e).attr('data_visit');
  // Append the status of the visit with appropriate color
  HTMLString += `<p>Status of the timepoint: <span class="${statusTimepoint === 'In Progress' || statusTimepoint === 'Pass' ? 'good-value' : 'bad-value'}">${statusTimepoint}</span></p>`;
  // Get the date of the visit
  let dateVisit = $(e).attr('data_Date_visit');
  // Append the date of the visit
  HTMLString += `<p>Date of Timepoint: ${dateVisit}</p>`;
  // Get the flag status of the instrument for both entries
  let flagStatus1 = $(e).attr('data_Data_entry');
  let flagStatus2 = $(e).attr('data_DDE_Data_entry');
  // Calculate the color of the flag based on value
  let flagStatus1Color = flagStatus1 === 'Complete' ? 'good-value' : flagStatus1 === 'Incomplete' ? 'bad-value' : 'emphasis';
  let flagStatus2Color = flagStatus2 === 'Complete' ? 'good-value' : flagStatus2 === 'Incomplete' ? 'bad-value' : 'emphasis';
  // Get the completion of the instrument for both entries
  let instrumentStatus1 = $(e).attr('data_Completion');
  let instrumentStatus2 = $(e).attr('data_DDE_Completion');
  // Calculate the color of the completion based on value
  let instrumentStatus1Color = instrumentStatus1 === 'Complete' ? 'good-value' : 'bad-value';
  let instrumentStatus2Color = instrumentStatus2 === 'Complete' ? 'good-value' : 'bad-value';
  // Get the administration value for both entries
  let administration1 = $(e).attr('data_Administration');
  let administration2 = $(e).attr('data_DDE_Administration');
  // Calculate the color of the administration based on value
  let administration1Color = administration1 === 'All' ? 'good-value' : administration1 === 'Partial' ? 'bad-value' : 'emphasis';
  let administration2Color = administration2 === 'All' ? 'good-value' : administration2 === 'Partial' ? 'bad-value' : 'emphasis';
  // Append a short table with all the calculated values and colors
  HTMLString += `<table>
      <thead>
          <th></th>
          <th class="text-center bold">#1</th>
          <th class="text-center bold">#2</th>
      </thead>
      <tbody>
          <tr class="text-center">
              <td>Administration</td>
              <td><span class="${administration1Color}">${administration1 === undefined || administration1 === '' ? 'Empty' : administration1}</span></td>
              <td><span class="${administration2Color}">${administration2 === undefined || administration2 === '' ? 'Empty' : administration2}</span></td>
          </tr>
          <tr class="text-center">
              <td>Flag</td>
              <td><span class="${flagStatus1Color}">${flagStatus1 === undefined || flagStatus1 === '' ? 'Empty' : flagStatus1}</span></td>
              <td><span class="${flagStatus2Color}">${flagStatus2 === undefined || flagStatus2 === '' ? 'Empty' : flagStatus2}</span></td>
          </tr>
          <tr class="text-center">
              <td>Instrument</td>
              <td><span class="${instrumentStatus1Color}">${instrumentStatus1}</span></td>
              <td><span class="${instrumentStatus2Color}">${instrumentStatus2}</span></td>
          </tr>
      </tbody>
  </table>`;
  // Remove the attributes used as data sources
  $(e).removeAttr('data_level data_Visit_label data_visit data_Date_visit data_Data_entry data_DDE_Data_entry data_Completion data_DDE_Completion data_Administration data_DDE_Administration');
  // Add a bootstrap tooltip using the generated string to the node
  addBootstrapTooltip($(e).prop('id'), HTMLString);
}

/**
 * Function which adds a Bootstrap tooltip using the specified parameters.
 * @param {string}  id          ID of the HTML element to which the tooltip is linked
 * @param {string}  text        HTML formatted text to be displayed in the tooltip
 * @param {string}  placement   Position to place the tooltip (top, right, bottom, left)
 */
function addBootstrapTooltip(id, text, placement = 'top') {
  // Activate the bootstrap tooltip function for the specified element
  $('#' + id).tooltip(
    {
      html: true,
      placement: placement,
      // The use of body here is important, otherwise the way the tooltips
      // are implemented in the DOM will interfere with the table layout
      container: 'body'
    });
  // Add an event handler for tooltip showing with the provided HTML text
  // content
  $('#' + id).on('show.bs.tooltip', function(e) {
    // Set the text to the defined tooltip text
    $(e.target).attr('data-original-title', text);
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
    text: message,
    html: true
  });
}
