/**
 * Helper script for the two pages of the RBANS instrument.
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
// Wordlist used in multiple tasks
let wordList = [];
// Handle for the C3 current results graph object
let currentResultsChart;
// Handle for the C3 longitudinal results graph object
let longitudinalResultsChartByVisits;
// Handle for the C3 longitudinal results graph object
let longitudinalResultsChartByDomains;
// Mapping for current results' columns
let crMap = {Idx1: 2,
  Idx2: 3,
  Idx3: 4,
  Idx4: 5,
  Idx5: 6,
  Idx6: 8};
// Mapping for longitudinal results' columns
let lrMap = {Visit: 1,
  Language: 2,
  Version: 3,
  Idx1: 22,
  NIdx1: 23,
  Idx2: 64,
  NIdx2: 65,
  Idx3: 108,
  NIdx3: 109,
  Idx4: 148,
  NIdx4: 149,
  Idx5: 202,
  NIdx5: 203,
  Idx6: 237,
  NIdx6: 238};
// jQuery function for waiting until the page is ready
$(document).ready(function() {
  // If on the data entry page of the instrument
  if ($('input[type=hidden][name=page]').val() === 'Data_Entry') {
    // Removes the info tables for the data entry page
    adjustDefaultDisplayElementsForDataEntry();
    // Add listeners for select elements
    addSelectInputListeners();
    // Setting the wordlist of tasks 1 and 9
    _setWordList();
    // Initialize T1 and T9 displays
    _updateWordListTasksDisplays();
    // Initialize T6 display
    _updateSemanticWordsDisplay();
    // add tooltips
    addDataEntryTooltips();
    // If the form is unfrozen
    if ($('#isFrozen').val() === 'false') {
      // Add listeners for datalist elements
      addDataListListeners();
      // Add text input listeners
      addTextInputListeners();
      // Add radio input listeners
      addRadioButtonListeners();
      // Add listeners for domain blanking
      _addDomainBlankerListeners();
      // Add listeners for forcing task total computation
      _addDoubleClickTotalsListeners();
      // Add listeners for buttons
      _addTaskResetButtonsListeners();
      _addTaskCheatButtonsListeners();
      _addFormResetButtonListener();
      _addSubmitButtonListener();
      // Show empty word for data entry
      _showFirstEmptyWordlistInput();
      _showFirstEmptyTextInput();
      _showFirstEmptyRadioInput();
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
    // Add defaults button listener for the longitudinal table
    addDefaultsButtonListener();
    // Add customization button listeners
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
  // If on the data entry page
  if ($('input[type=hidden][name=page]').val() === 'Data_Entry') {
    // Detach the current lorisworkspace div
    let currentSpace = $('#lorisworkspace').detach();
    // Remove the two information tables from their div and append the
    // saved structure to the proper element
    $('div.inset > div:nth-child(2)').empty().append(currentSpace);
  }
}

/**
 * Function which adds listeners to the select elements.
 */
function addSelectInputListeners() {
  // Add listeners for the instrument settings select controls
  _addInstrumentSettingsListeners();
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
      'RBANS/Data_Entry/?' +
      'Test_Language=' + testLanguage +
      '&Test_Version=' + testVersion +
      '&commentID=' + commentID;
  });
}

/**
 * Function which defines the wordlist array based on the initial values of the
 * datalisted text input element.
 * @private
 */
function _setWordList() {
  // For every option of the word list
  $('datalist > option').each(function() {
    // Add word to the list array
    wordList.push($(this).prop('value'));
  });
}

/**
 * Function to update the classes of the wordlist input to reflect the
 * nature of the answer (good, repetition, intrusion, empty).
 * @private
 */
function _updateWordListTasksDisplays() {
  // for all trials of task 1 (1-4)
  $('#task1-trials-container > div[trial], #task9-trial-container')
    .each(function() {
      // initialize the words object for the trial
      let words = {};
      // for all inputs of a trial
      $('div.wordlist-trial-container > input[list]', this)
        .each(function() {
          let word = $(this).val();
          // remove the class for the input element
          $(this).removeClass('good-word repetition intrusion');
          // if the word is not empty
          if (word.length > 0) {
            // if the word is valid
            if (wordList.includes(word)) {
              // if the valid word has already been used
              if (words.hasOwnProperty(word)) {
                // add repetition class to element
                $(this).addClass('repetition');
                // if the valid word hasn't already been used
              } else {
                // add word to words object
                words[word] = 1;
                // add valid class to element
                $(this).addClass('good-word');
              }
              // if the word is invalid
            } else {
              // add intrusion class to element
              $(this).addClass('intrusion');
            }
            // if the word is empty
          } else {
            // add class to hide element
            $(this).addClass('hiddenInput');
          }
        });
    });
}

/**
 * Function to update the classes of the inputs' containers to reflect the
 * nature of the answer for the semantic word list (repetition)
 * @private
 */
function _updateSemanticWordsDisplay() {
  // initialize the words object for the task
  let words = [];
  // For each word input of task 6
  $('#task6-container ol > li > input').each(function() {
    // Get the input container for styling
    let listItem = $(this).parent();
    // Remove classes from container
    $(listItem).removeClass('repetition hiddenInput');
    // Get the word value
    let word = $(this).val();
    // if the word is not empty
    if (word.length > 0) {
      // if the word has already been used
      if (words.includes(word)) {
        // Add class to container
        $(listItem).addClass('repetition');
        // if the word has yet to be used
      } else {
        // Add word to task words
        words.push(word);
      }
      // if the word is empty
    } else {
      // add class to hide element
      $(listItem).addClass('hiddenInput');
    }
  });
}

/**
 * Function to add bootstrap tooltips to specific elements of the data
 * entry page.
 */
function addDataEntryTooltips() {
  // Add tooltips for task 3
  for (let i = 1; i < 11; i++) {
    // Add a tooltip based on the value of the tooltip property of the element
    addBootstrapTooltip(`task3-item-description-${i}`,
      $(`#task3-item-description-${i}`).attr('tooltip'));
    // Remove the tooltip property of the element
    $(`#task3-item-description-${i}`).removeAttr('tooltip');
  }
  // Add tooltips for task 12
  for (let i = 1; i < 11; i++) {
    // Add a tooltip based on the value of the tooltip property of the element
    addBootstrapTooltip(`task12-item-description-${i}`,
      $(`#task12-item-description-${i}`).attr('tooltip'));
    // Remove the tooltip property of the element
    $(`#task12-item-description-${i}`).removeAttr('tooltip');
  }
}

/**
 * Function which adds listeners to the text inputs linked to a datalist.
 */
function addDataListListeners() {
  // Adding listener to prevent sending enter key press to next element and
  // update the empty instruments shown for each key press
  $('#task1-trials-container > div[trial] > div.wordlist-trial-container > input[list],' +
    '#task9-trial-container > div.wordlist-trial-container > input[list]')
    .on('keypress', function(e) {
      if (e.key === 'Enter') {
        e.preventDefault();
      }
      _showFirstEmptyWordlistInput();
    });
  // When a datalist linked input element of task 1 changes, gains or looses
  // focus
  $('#task1-trials-container > div[trial] > div.wordlist-trial-container > input[list]')
    .on('change input', function(e) {
      // stop propagation
      e.preventDefault();
      // Get trial container
      let trialContainer = $(e.target).closest('div[trial]');
      // Clone a copy of the word list
      let words = [...wordList];
      // Initialize the number of intrusions
      let wrongWords = 0;
      // for each input of the trial container
      $('div > input', trialContainer).each(function() {
        // Get the value of the word
        let word = $(this).val();
        // Get the index of the word
        let indexWord = words.indexOf(word);
        // If the word is valid and unused
        if (indexWord > -1) {
          // remove word
          words.splice(indexWord, 1);
          // If the word is invalid but not empty
        } else if (word !== '') {
          wrongWords += 1;
        }
      });
      // Get the node of the total for the trial
      let totalNode = $(`#T1_Score_${$(trialContainer).attr('trial')}`);
      // Initialize score
      let score = '';
      // If there were valid words
      if (words.length < wordList.length) {
        score = wordList.length - words.length;
        // If there were no valid words but there were non-empty invalid ones
      } else if (wrongWords > 0) {
        score = '0';
      }
      // Set score input to calculated value
      totalNode.val(score).trigger('change');
      // Update the shown empty inputs
      _showFirstEmptyWordlistInput();
    });
  // When a datalist linked input element of task 9 changes, gains or looses
  // focus
  $('#task9-trial-container > div.wordlist-trial-container > input[list]')
    .on('change input', function(e) {
      // stop propagation
      e.preventDefault();
      // Clone a copy of the wordlist
      let words = [...wordList];
      // Initialize the number of intrusions
      let wrongWords = 0;
      // for each input of the task
      $('#task9-trial-container > div.wordlist-trial-container > input[list]')
        .each(function() {
          let indexWord = words.indexOf($(this).val());
          // If the word is valid and unused
          if (indexWord > -1) {
            // remove word
            words.splice(indexWord, 1);
            // If the word is invalid but not empty
          } else if ($(this).val() !== '') {
            wrongWords += 1;
          }
        });
      // Initialize the score
      let score = '';
      // If there were valid words
      if (words.length < wordList.length) {
        // Set score to difference
        score = wordList.length - words.length;
        // If there were no valid words but there were non-empty invalid ones
      } else if (wrongWords > 0) {
        score = '0';
      }
      // Set the total input to the calculated value
      $(`#T9_Total`).val(score).trigger('change');
      // Update the shown empty inputs
      _showFirstEmptyWordlistInput();
    });
}

/**
 * Function which adds listeners for the text input elements.
 */
function addTextInputListeners() {
  // Add listeners for calculated fields
  _addTask1CalculatedFieldsListeners();
  _addTask2CalculatedFieldsListeners();
  _addTask3CalculatedFieldsListeners();
  _addTask4CalculatedFieldsListeners();
  _addTask5CalculatedFieldsListeners();
  _addTask6CalculatedFieldsListeners();
  _addTask7CalculatedFieldsListeners();
  _addTask9CalculatedFieldsListeners();
  _addTask10CalculatedFieldsListeners();
  _addTask12CalculatedFieldsListeners();
}

/**
 * Function which adds listeners for the calculated fields of task 1.
 * @private
 */
function _addTask1CalculatedFieldsListeners() {
  // for changes on a calculated fields of task 1
  $('#task1-container > div.task-results-container > table > tbody > tr > td > input.calculated-field.sub-total').on('change', function() {
    let totals = [
      _validatedIntegerTextInput('#T1_Score_1', 0, 10),
      _validatedIntegerTextInput('#T1_Score_2', 0, 10),
      _validatedIntegerTextInput('#T1_Score_3', 0, 10),
      _validatedIntegerTextInput('#T1_Score_4', 0, 10)];
    // Total Score
    // If all subtotals are valid integers
    if (totals.filter(val => val || val === 0).length === 4) {
      // Set the total to the sum of the totals
      $('#T1_Total').val(totals.reduce(
        (acc, curr) => (acc + curr), 0)
      );
      // If some subtotals are invalid
    } else {
      // set total to empty
      $('#T1_Total').val('');
    }
    // Update task 1 words display
    _updateWordListTasksDisplays();
    // Show first empty word
    _showFirstEmptyWordlistInput();
    // Calculate Repetitions and intrusions
    let errors = {repetitions: 0, intrusions: 0};
    // for all trials of task 1 (1-4)
    $('#task1-trials-container > div[trial]').each(function() {
      // initialize the words object for the trial
      let words = {};
      // for all inputs of a trial
      $('div.wordlist-trial-container > input[list]', this)
        .each(function() {
          let word = $(this).val();
          // if the word is not empty
          if (word.length > 0) {
            // if the word is valid
            if (wordList.includes(word)) {
              // if the valid word has already been used
              if (words.hasOwnProperty(word)) {
                // increment task repetition
                errors.repetitions += 1;
                // if the valid word hasn't already been used
              } else {
                // add word to words object
                words[word] = 1;
              }
              // if the word is invalid
            } else {
              // increment task intrusion value
              errors.intrusions += 1;
            }
            // if the word is empty
          }
        });
    });
    // If the task total is empty, set repetitions and intrusions to blank,
    // otherwise, set to calculated values
    $('#T1_Repetitions').val(
      $('#T1_Total').val() === '' ?
        '' :
        errors.repetitions
    );
    $('#T1_Intrusions').val(
      $('#T1_Total').val() === '' ?
        '' :
        errors.intrusions
    );
  });
}

/**
 * Function to add calculated fields listeners for the text inputs of task 2.
 * @private
 */
function _addTask2CalculatedFieldsListeners() {
  // for changes on calculated fields of task 2
  $('#task2-container input.calculated-field.sub-total')
    .on('change', function() {
      // Initialize total
      let scores = [];
      // Selector for the calculated fields
      let fields = $('#task2-container input.calculated-field.sub-total');
      // For each subtotal
      $(fields).each(function() {
        // Get the score
        let score = $(this).val();
        // Push score if valid, empty otherwise
        scores.push(score === '' ?
          null :
          _validatedIntegerTextInput(
            '#' + $(this).attr('id'),
            0,
            2)
        );
      });
      // If all subtotals are valid integers (zeros are valid)
      if (scores.filter(val => val || val === 0).length === fields.length) {
        // Set the total to the sum of the totals
        $('#T2_Total').val(scores.reduce(
          (acc, curr) => (acc + curr), 0)
        );
        // If some totals are invalid
      } else {
        // set total to empty
        $('#T2_Total').val('');
      }
    });
}

/**
 * Function to add listeners for the calculated fields of task 3.
 * @private
 */
function _addTask3CalculatedFieldsListeners() {
  // for changes on calculated fields of task 3
  $('#task3-container input.calculated-field.sub-total')
    .on('change', function() {
      _updateFigureRecallTotal('3');
    });
}

/**
 * Function to add listeners for calculated fields of task 4.
 * @private
 */
function _addTask4CalculatedFieldsListeners() {
  // For changes on non-calculated fields of task 4
  $('#task4-container input.data-entry').on('change input', function(e) {
    // Prevent event propagation
    e.preventDefault();
    // Get the value of the response
    let response = $(e.target).val();
    // Get the row of the response
    let row = $(e.target).closest('tr');
    // If the response is null
    if (response === '' || response === undefined || response === null) {
      // blank the score in the matching row
      $('input.calculated-field', row).val('');
      // If the response is not null
    } else {
      // Get the correct responses as an array from the row
      let lines = $('td:nth-child(3)', row).text().replace(' ', '').split(',');
      // If the response matches the expected format
      if (response.match(/^([0-9]{1,2})(?:,([0-9]{1,2}))?$/)) {
        // Initialize the score
        let score = 0;
        // For each number of the response
        response.split(',').forEach(function(line) {
          // if the number matches a correct response, increment
          score += lines.includes(line) ? 1 : 0;
        });
        // Set row total to score
        $('input.calculated-field', row).val(score).trigger('change');
        // If the response doesn't match the expected format
      } else {
        // Blank the row total
        $('input.calculated-field', row).val('').trigger('change');
      }
    }
  });
  // for changes on calculated fields of task 4
  $('#task4-container input.calculated-field.sub-total')
    .on('change', function() {
      // Initialize the scores
      let scores = [];
      // Get the subtotal fields
      let fields = $('#task4-container input.calculated-field.sub-total');
      // For each subtotal
      $(fields).each(function() {
        // Get the score
        let score = $(this).val();
        // Push score if valid, empty otherwise
        scores.push(score === '' ?
          null :
          _validatedIntegerTextInput(
            '#' + $(this).attr('id'),
            0,
            2)
        );
      });
      // If all subtotals are valid integers (zeros are valid)
      if (scores.filter(val => val || val === 0).length === fields.length) {
        // Set the total to the sum of the totals
        $('#T4_Total').val(scores.reduce(
          (acc, curr) => (acc + curr), 0)
        );
        // If some totals are invalid
      } else {
        // set total to empty
        $('#T4_Total').val('');
      }
    });
}

/**
 * Function which adds listeners for the calculated fields of task 5.
 * @private
 */
function _addTask5CalculatedFieldsListeners() {
  // For changes on the total of task 5
  $('#T5_Total').on('change', function(e) {
    // Prevent propagation
    e.preventDefault();
    // Get the checked radio inputs from the task
    let fields = $('#task5-container input[type="radio"]:checked');
    // If all answers are checked
    if ($(fields).length === 10) {
      // Initialize the scores
      let scores = [];
      // For every checked radio input
      $(fields).each(function() {
        // Get the field value
        let score = $(this).val();
        // Push score if valid, empty otherwise
        scores.push(score === '' ?
          null :
          _validatedIntegerTextInput(
            '#' + $(this).attr('id'),
            0,
            1)
        );
      });
      // If all subtotals are valid integers (zeros are valid)
      if (scores.filter(val => val || val === 0).length === fields.length) {
        // Set the total to the sum of the totals
        $('#T5_Total').val(scores.reduce(
          (acc, curr) => (acc + curr), 0)
        );
        // If some totals are invalid
      } else {
        // set total to empty
        $('#T5_Total').val('');
      }
      // If some answers aren't checked
    } else {
      // set total to empty
      $('#T5_Total').val('');
    }
  });
}

/**
 * Function which adds listeners for the calculated fields of task 6.
 * @private
 */
function _addTask6CalculatedFieldsListeners() {
  // For each keypress while in an input of task 6
  $('#task6-container ol > li > input').on('keypress', function(e) {
    // If the key pressed is "Enter"
    if (e.key === 'Enter') {
      // Stop event propagation
      e.preventDefault();
    }
    // Update to show at least one empty
    _showFirstEmptyTextInput();
  });
  // for changes on word inputs of task 6
  $('#task6-container ol > li > input').on('change input', function() {
    // Update the words displays
    _updateSemanticWordsDisplay();
    // Show first empty
    _showFirstEmptyTextInput();
    // Calculate Repetitions
    let repetitions = 0;
    // initialize the words object for the task
    let words = [];
    // for all the word inputs of task 6
    $('#task6-container ol > li > input').each(function() {
      // Get the word value
      let word = $(this).val();
      // if the word is not empty
      if (word.length > 0) {
        // if the word has already been used
        if (words.includes(word)) {
          // increment task repetition value
          repetitions += 1;
          // if the word has yet to be used
        } else {
          // Add word to task words
          words.push(word);
        }
      }
    });
    // If there was at least 1 non-zero word
    if (words.length > 0) {
      $('#T6_Repetitions').val(repetitions);
    }
  });
  // for changes on the raw total input of task 6
  $('#T6_Raw_Total').on('change input', function(e) {
    // If raw total is valid
    if (_validatedIntegerTextInput('#T6_Raw_Total', 0, 40)) {
      // Add the semantic adjustment for the version and update the adjusted
      // total field
      $('#T6_Adjusted_Total').val(
        Number.parseInt($(e.target).val(), 10) +
        Number.parseInt($('#Semantic_Adjustment').val(), 10)
      );
      // If empty or invalid
    } else {
      // Blank the adjusted total field
      $('#T6_Adjusted_Total').val('');
    }
  });
}

/**
 * Function to add listeners for the calculated fields of task 7
 * @private
 */
function _addTask7CalculatedFieldsListeners() {
  // For changes on the calculated fields of task 7
  $('#task7-container #data-entry-table14 input[type=text].calculated-field')
    .on('change', function(e) {
      // Stop event propagation
      e.preventDefault();
      // Initialize achieved span width and total score
      let width = 0;
      let total = 0;
      // Boolean on whether the trial was stopped before completion or not
      let stopped = false;
      // Number of lines completed
      let completedLines = 0;
      // For all data entry rows of task 7
      $('#task7-container #data-entry-table14 > tbody > tr').each(function() {
        // Get the score of the row
        let itemScore = $('td > input[type="text"]', this).val();
        // If the score is 1 or 2
        if (itemScore === '1' || itemScore === '2') {
          // Count the line as completed
          completedLines += 1;
          // Get the width from the text of the correct response cell
          width = $('td:nth-child(2)', this).text().replace(' ', '')
            .split('--').length;
          // Increment the total by the score
          total += Number.parseInt(itemScore, 10);
          // If the score is 0
        } else if (itemScore === '0') {
          // Set the trial to stopped
          stopped = true;
          // Break out of the row loop
          return false;
          // For any other value
        } else {
          // Just break out of the row loop
          return false;
        }
      });
      // If the trial was stopped or completed, update with the calculated
      // values, blank otherwise
      $('#T7_Span_Width').val(stopped || completedLines === 8 ? width : '');
      $('#T7_Total').val(stopped || completedLines === 8 ? total : '');
    });
}

/**
 * Function to add listeners for the calculated fields of task 9.
 * @private
 */
function _addTask9CalculatedFieldsListeners() {
  // for changes on calculated fields of task 9
  $('#T9_Total')
    .on('change', function() {
      // Update task 9 words display
      _updateWordListTasksDisplays();
      // show first empty word
      _showFirstEmptyWordlistInput();
      // Calculate Repetitions and intrusions
      let errors = {repetitions: 0, intrusions: 0};
      // initialize the words object
      let words = {};
      // for all inputs of task 9
      $('#task9-trial-container > div.wordlist-trial-container > input[list]')
        .each(function() {
          // Get the word value
          let word = $(this).val();
          // if the word is not empty
          if (word.length > 0) {
            // if the word is valid
            if (wordList.includes(word)) {
              // if the valid word has already been used
              if (words.hasOwnProperty(word)) {
                // increment task repetition value
                errors.repetitions += 1;
                // if the valid word hasn't already been used
              } else {
                // add word to words object
                words[word] = 1;
              }
              // if the word is invalid
            } else {
              // increment task intrusion value
              errors.intrusions += 1;
            }
          }
        });
      // If the task total is empty, set repetitions and intrusions to blank,
      // otherwise, set to calculated values
      $('#T9_Repetitions').val(
        $('#T9_Total').val() === '' ?
          '' :
          errors.repetitions
      );
      $('#T9_Intrusions').val(
        $('#T9_Total').val() === '' ?
          '' :
          errors.intrusions
      );
    });
}

/**
 * Function to add calculated fields listeners for task 10
 * @private
 */
function _addTask10CalculatedFieldsListeners() {
  // for changes on calculated fields radio inputs of task 10
  $('#task10-container input[type=text].calculated-field')
    .on('change', function(e) {
      // Prevent propagation
      e.preventDefault();
      // Initialize score
      let score = 0;
      // Check that all questions are answered
      if ($('#task10-container input[type=radio]:checked').length === 20) {
        // For each checked input
        $('#task10-container input[type=radio]:checked').each(function() {
          // Get the value of the field
          let value = $(this).val();
          // If the value is correct, uppercase N or Y, increment score
          if (value === value.toUpperCase()) {
            score += 1;
          }
        });
        // If there are missing answers
      } else {
        // Blank the score
        score = '';
      }
      // Set the total to the score value
      $('#T10_Total').val(score);
    });
}

/**
 * Function to add listeners to the calculated fields of task 12.
 * @private
 */
function _addTask12CalculatedFieldsListeners() {
  // for changes on calculated fields of task 12
  $('#task12-container input.calculated-field.sub-total')
    .on('change', function() {
      _updateFigureRecallTotal('12');
    });
}

/**
 * Function to add radio input listeners for the task that use them.
 */
function addRadioButtonListeners() {
  _addTask2RadioButtonListeners();
  _addTask3RadioButtonListeners();
  _addTask5RadioButtonListeners();
  _addTask7RadioButtonListeners();
  _addTask10RadioButtonListeners();
  _addTask11RadioButtonListeners();
  _addTask12RadioButtonListeners();
}

/**
 * Function to add radio input listeners for task 2
 * @private
 */
function _addTask2RadioButtonListeners() {
  // For changes on radio inputs of task 2
  $('#task2-container input[type="radio"]').on('change', function(e) {
    // Get the row of the changed input
    let row = $(e.target).closest('tr');
    // Selector for the checked radio inputs
    let fields = $('input[type=radio]:checked', row);
    // If the row has 2 checked radio inputs
    if ($(fields).length === 2) {
      // Initialize the score
      let score = 0;
      // Add the score of each checked input
      $(fields).each(function() {
        score += Number.parseInt($(this).val(), 10);
      });
      // Set the score element as the sum of the values of the checked inputs
      $('input.calculated-field.sub-total', row).val(score);
      // If the row doesn't have 2 checked radio inputs
    } else {
      // Blank the score element
      $('input.calculated-field.sub-total', row).val('');
    }
    // Trigger a change on the score element
    $('input.calculated-field.sub-total', row).trigger('change');
  });
}

/**
 * Function to add listeners to the radio input elements of task 3
 * @private
 */
function _addTask3RadioButtonListeners() {
  // For changes on radio input elements of task 3
  $('#task3-container input[type="radio"]').on('change', function(e) {
    _updateFigureRecallSubTotals(e, '3');
  });
}

/**
 * Function to update the row and columns sub-totals for task 3 and 12.
 * @param {Event} event   Radio input change event that triggered the update
 * @param {String} task   Number of the task to update
 */
function _updateFigureRecallSubTotals(event, task) {
  // Get the row of the changed element
  let row = $(event.target).closest('tr');
  // Get selector for the checked radio inputs
  let fields = $('input[type=radio]:checked', row);
  // If the row has 2 checked radio inputs
  if ($(fields).length === 2) {
    // Initialize the score
    let score = 0;
    // Add the value of the checked elements
    $(fields).each(function() {
      score += Number.parseInt($(this).val(), 10);
    });
    // Set the score element as the sum of the values of the checked radio
    // inputs
    $('input.calculated-field', row).val(score, 10).trigger('change');
    // If the row doesn't have 2 checked radio inputs
  } else {
    // Blank the score element
    $('input.calculated-field', row).val('').trigger('change');
  }
  // Get the table of the row
  let table = $(row).closest('table');
  // Initialize the changed element's type
  let criteriaType = '';
  // Set the value to an object if the changed element has one of the
  // two expected classes
  if ($(event.target).hasClass('drawing')) {
    criteriaType = {columnNumber: 2, totalFieldID: `T${task}_Drawing_Score`};
  } else if ($(event.target).hasClass('placement')) {
    criteriaType = {columnNumber: 3, totalFieldID: `T${task}_Placement_Score`};
  }
  // If the changed input's name was matched to an expected class
  if (typeof criteriaType === 'object') {
    // Get the checked radio inputs for the column of the changed input's type
    let fields = $(`tr > td:nth-child(${criteriaType.columnNumber}) input[type=radio]:checked`, table);
    // If the length matches the number of rows
    if ($(fields).length === 10) {
      // Initialize the score to zero
      let score = 0;
      // for all the checked inputs of the column
      $(fields).each(function() {
        // Add the input's value to the score
        score += Number.parseInt($(this).val(), 10);
      });
      // Set the score to the sum of the inputs' values
      $(`#${criteriaType.totalFieldID}`).val(score);
      // If some inputs aren't selected
    } else {
      // Blank the score input
      $(`#${criteriaType.totalFieldID}`).val('');
    }
    // If the changed input doesn't match an expected class
  } else {
    // Blank the subscores
    $(`#T${task}_Drawing_Score`).val('');
    $(`#T${task}_Placement_Score`).val('');
  }
}

/**
 * Function to update the total for the task 3 or 12.
 * @param {String} task   Number of the task to be updated
 */
function _updateFigureRecallTotal(task) {
  // Initialize the scores
  let scores = [];
  // Selector for the sub-total fields
  let fields = $(`#task${task}-container input.calculated-field.sub-total`);
  // For every sub-total field
  $(fields).each(function() {
    // Push the score if valid, null if invalid or empty
    scores.push(
      $(this).val() === '' ?
        null :
        _validatedIntegerTextInput(
          '#' + $(this).attr('id'),
          0,
          2)
    );
  });
  // If all subtotals are valid integers (zeros are valid)
  if (scores.filter(val => val || val === 0).length === $(fields).length) {
    // Set the total to the sum of the totals
    $(`#T${task}_Total`).val(scores.reduce(
      (acc, curr) => (acc + curr), 0)
    );
    // If some subtotals are invalid
  } else {
    // set total to empty
    $(`#T${task}_Total`).val('');
  }
}

/**
 * Function to add listeners for the radio inputs of task 5.
 * @private
 */
function _addTask5RadioButtonListeners() {
  // For changes on radio inputs of task 5
  $('#task5-container input[type="radio"]').on('change', function() {
    // Trigger a change on the task 5 total score calculated field
    $('#T5_Total').trigger('change');
  });
}

/**
 * Function to add listeners for the radio inputs of task 7.
 * @private
 */
function _addTask7RadioButtonListeners() {
  // For changes on the radio inputs of task 7
  $('#task7-container #data-entry-table14 input[type="radio"]')
    .on('change', function(e) {
      // Stop propagation
      e.preventDefault();
      // Getting the row of the change
      let row = $(e.target).closest('tr');
      // Get the values of the scores of the row
      let series1 = $('td:nth-child(3) > div > label > input[type=radio]:checked', row).val();
      let series2 = $('td:nth-child(5) > div > label > input[type=radio]:checked', row).val();
      // If the first score has full marks
      if (series1 === '2') {
        // Uncheck the score of the second trial
        $('td:nth-child(5) > div > label > input', row).prop('checked', false);
        // Set the row's score to the value of the first trial
        $('td > input[type=text]', row).val('2');
        // If the first trial failed but the second succeeded
      } else if (series1 === '0' && series2 === '1') {
        // Set the row's score to 1
        $('td > input[type=text]', row).val('1');
        // If both trials have failed
      } else if (series1 === '0' && series2 === '0') {
        // Set the row's score to 0
        $('td > input[type=text]', row).val('0');
        // For all the rows after the failed row
        $(row).nextAll().each(function(index, row) {
          // uncheck the radio inputs
          $('input[type=radio]', row).prop('checked', false);
          // blank the score input
          $('td > input[type=text]', row).val('');
        });
        // For all other cases
      } else {
        // Blank the row's score
        $('td > input[type=text]', row).val('');
      }
      // Trigger a change on the row's score
      $('td > input[type=text]', row).trigger('change');
      // Update the display of the radio inputs
      _showFirstEmptyRadioInput();
    });
}

/**
 * Function to add listeners to the radio inputs of task 10.
 * @private
 */
function _addTask10RadioButtonListeners() {
  // For changes on the target classed radio inputs of task 10
  $('#task10-container input[type="radio"]').on('change', function(e) {
    // Prevent propagation
    e.preventDefault();
    // Checked radio input selector
    let fields = $('#task10-container input[type="radio"]:checked');
    // Initialize scores
    let scores = {distractor: 0, target: 0, total: 0};
    // If all items have been checked
    if ($(fields).length === 20) {
      // For each target checked radio input
      $(fields).each(function() {
        // Initialize the field's category
        let fieldCategory = '';
        // If the field has the target category
        if ($(this).hasClass('target')) {
          // Set field category to target
          fieldCategory = 'target';
          // If the field has the distractor category
        } else if ($(this).hasClass('distractor')) {
          // Set field category to distractor
          fieldCategory = 'distractor';
        }
        // If the field has one of the expected class
        if (fieldCategory === 'target' || fieldCategory === 'distractor') {
          // Get the field value
          let value = $(this).val();
          // If the correct value is checked
          if (value === value.toUpperCase()) {
            // Increment the score of the matching category
            scores[fieldCategory] += 1;
          }
          // If the field doesn't have one of the expected classes
        } else {
          // Blank the scores and break out of the items loop
          scores.distractor = '';
          scores.target = '';
          scores.total = '';
          return false;
        }
        // If both the subscores are numbers, calculate the total score
        if (typeof scores.target === 'number' &&
          typeof scores.distractor === 'number') {
          scores.total = scores.target + scores.distractor;
          // If one of the subscores is blanked
        } else {
          // Blank the scores
          scores.distractor = '';
          scores.target = '';
          scores.total = '';
        }
      });
      // If no inputs have been selected
    } else {
      // Blank the scores
      scores.distractor = '';
      scores.target = '';
      scores.total = '';
    }
    // Set the fields to the calculated scores values and trigger changes
    $('#T10_Targets_Score').val(scores.target).trigger('change');
    $('#T10_Distractor_Score').val(scores.distractor).trigger('change');
    $('#T10_Total').val(scores.total).trigger('change');
  });
}

/**
 * Function to add listeners to the radio inputs of task 11.
 * @private
 */
function _addTask11RadioButtonListeners() {
  // For changes on radio inputs of task 11
  $('#task11-container input[type="radio"]').on('change', function() {
    // Initialize the score to zero
    let score = 0;
    // Get the selector for the checked inputs
    let fields = $('#task11-container input[type="radio"]:checked');
    // If the number of checked inputs matches the number of rows
    if ($(fields).length === 12) {
      // For each checked input
      $(fields).each(function() {
        // Add input value to score
        score += Number.parseInt($(this).val(), 10);
      });
      // If some rows aren't checked
    } else {
      // Blank score
      score = '';
    }
    // Set task 11 total input to the calculated score and trigger change
    $('#T11_Total').val(score).trigger('change');
  });
}

/**
 * Function to add listeners to the task 12 radio inputs.
 * @private
 */
function _addTask12RadioButtonListeners() {
  // For changes on radio input elements of task 12
  $('#task12-container input[type="radio"]').on('change', function(e) {
    _updateFigureRecallSubTotals(e, '12');
  });
}

/**
 * Function which blanks the computed domain scores when changes are made
 * to the matching tasks of the same domain on the data entry page.
 * @private
 */
function _addDomainBlankerListeners() {
  // Association between the domains and the related tasks
  let blankingValues = {
    1: [1, 2],
    2: [3, 4],
    3: [5, 6],
    4: [7, 8],
    5: [9, 10, 11, 12]};
  // For each domain
  Object.keys(blankingValues).forEach(function(domain) {
    // Initialize the tasks selector
    let selector = '';
    // For each task associated with the domain
    blankingValues[domain].forEach(function(task) {
      // Append the tasks' inputs to the selector
      selector += `#task${task}-container input,`;
    });
    // Remove the superfluous comma
    selector = selector.slice(0, -1);
    // Blank the calculated values of the domain for changes on the inputs
    // of the related tasks
    $(selector).on('change', function() {
      $(`#domain${domain}-container input`).val('');
      // Also blank the total domain
      $('#domain6-container input').val('');
    });
  });
}

/**
 * Function that adds listeners to inputs holding task totals to support
 * a re-calculation of their values when double-clicked.
 * @private
 */
function _addDoubleClickTotalsListeners() {
  // Task #1
  $('#T1_Score_1, #T1_Score_2, #T1_Score_3, #T1_Score_4, #T1_Total, #T1_Repetitions, #T1_Intrusions').on('dblclick', function() {
    $('#task1-trials-container > div[trial] > div.wordlist-trial-container > input[list]:first-child').trigger('change');
  });
  // Task #2
  $('#task2-container input.calculated-field.sub-total, #T2_Total').on('dblclick', function() {
    $('#task2-container input.calculated-field.sub-total:first-child').trigger('change');
  });
  // Task #3
  $('#T3_Drawing_Score, #T3_Placement_Score, #T3_Total, #task3-container input.calculated-field.sub-total').on('dblclick', function() {
    $('#task3-container input[type="radio"]').trigger('change');
    _updateFigureRecallTotal('3');
  });
  // Task #4
  $('#T4_Total, #task4-container input.calculated-field.sub-total').on('dblclick', function() {
    $('#task4-container input.data-entry').trigger('change');
  });
  // Task #5
  $('#T5_Total').on('dblclick', function() {
    $('#T5_Total').trigger('change');
  });
  // Task #6
  $('#T6_Adjusted_Total').on('dblclick', function() {
    $('#T6_Raw_Total').trigger('change');
  });
  // Task #7
  $('#T7_Total, #T7_Span_Width, #task7-container #data-entry-table14 input[type=text].calculated-field').on('dblclick', function() {
    $('#task7-container #data-entry-table14 input[type="radio"]').trigger('change');
    $('#task7-container #data-entry-table14 input[type=text].calculated-field.first-child').trigger('change');
  });
  // Task #9
  $('#T9_Total, #T9_Repetitions, #T9_Intrusions').on('dblclick', function() {
    $('#task9-trial-container > div.wordlist-trial-container > input[list]:first-child').trigger('change');
  });
  // Task #10
  $('#T10_Distractor_Score, #T10_Targets_Score, #T10_Total').on('dblclick', function() {
    $('#task10-container input[type="radio"]').trigger('change');
  });
  // Task #11
  $('#T11_Total').on('dblclick', function() {
    $('#task11-container input[type="radio"]').trigger('change');
  });
  // Task #12
  $('#T12_Drawing_Score, #T12_Placement_Score, #T12_Total, #task12-container input.calculated-field.sub-total').on('dblclick', function() {
    $('#task12-container input[type="radio"]').trigger('change');
    _updateFigureRecallTotal('12');
  });
}

/**
 * Add listeners to process clicks on the various task resetting buttons.
 * @private
 */
function _addTaskResetButtonsListeners() {
  // For all clicks on a task reset button
  $('button.task-reset-button').on('click', function(e) {
    // Prevent propagation
    e.preventDefault();
    // Get the task number
    let task = $(e.target).val();
    // Blank the associated comments
    $(`#T${task}_Comments`).val('');
    // Switch based on the task
    switch (task) {
      case '1':
        // For all datalist linked text input of task 1
        $('#task1-trials-container > div[trial] > div.wordlist-trial-container > input[list]').each(function() {
          // Set to empty, add hiding class and remove classifying classes
          $(this).val('')
            .addClass('hiddenInput')
            .removeClass('good-word repetition intrusion');
        });
        // Update the shown hidden inputs
        _showFirstEmptyWordlistInput();
        // Trigger changes on the first input of each trial to
        // reset the calculated fields
        $('#task1-trials-container > div[trial]').each(function() {
          $('div.wordlist-trial-container > input', this).each(function() {
            // Trigger the first field
            $(this).trigger('change');
            // Break out of the specific trial loop
            return false;
          });
        });
        break;
      case '2':
        // For all radio buttons
        $('#task2-container input[type="radio"]').each(function() {
          // Set to unchecked
          $(this).prop('checked', false);
        });
        // For all text inputs (answers and repetition and intrusions counters)
        $('#task2-container input[type="text"]').each(function() {
          // Set to blank
          $(this).val('').trigger('change');
        });
        break;
      case '3':
        // For all radio buttons
        $('#task3-container input[type=radio]').each(function() {
          // Set to unchecked and trigger change to blank calculated fields
          $(this).prop('checked', false).trigger('change');
        });
        break;
      case '4':
        $('#task4-container input.data-entry').each(function() {
          // Set to empty and trigger change to blank calculated fields
          $(this).val('').trigger('change');
        });
        break;
      case '5':
        // For all radio buttons
        $('#task5-container input[type=radio]').each(function() {
          // Set to unchecked and trigger change to blank calculated fields
          $(this).prop('checked', false).trigger('change');
        });
        // For all optional responses
        $('#task5-container input.answer[type="text"]').each(function() {
          // Blank the optional response
          $(this).val('');
        });
        break;
      case '6':
        // For all the word data entry inputs
        $('#task6-container input').each(function() {
          // Set to blank
          $(this).val('');
        });
        // Reset the li elements to default class
        $('#task6-container li').each(function() {
          $(this).addClass('hiddenInput');
        });
        // Update the display to show the first empty word data entry input
        _showFirstEmptyTextInput();
        break;
      case '7':
        // For all radio Inputs
        $('#task7-container input[type=radio]').each(function() {
          // Set to unchecked
          $(this).prop('checked', false);
        });
        // Blank the other inputs
        $('#task7-container input[type=text]').each(function() {
          // Set to unchecked
          $(this).val('').trigger('change');
        });
        // Update the enable radio buttons
        _showFirstEmptyRadioInput();
        break;
      case '8':
        // Blank the input
        $('#T8_Total').val('').trigger('change');
        break;
      case '9':
        // For all datalist linked text input of the task
        $('#task9-trial-container > div.wordlist-trial-container > input[list]')
          .each(function() {
            // Set to empty, add hiding class and remove
            // value classifying classes and trigger change
            $(this).val('')
              .addClass('hiddenInput')
              .removeClass('good-word repetition intrusion')
              .trigger('change');
          });
        // Update the shown hidden inputs
        _showFirstEmptyWordlistInput();
        break;
      case '10':
        // For every radio input of task 10
        $('#task10-container input[type=radio]').each(function() {
          // Set to unchecked
          $(this).prop('checked', false);
        });
        // Trigger change on first radio to blank calculated fields
        $('#task10-container input[type=radio]').first().trigger('change');
        break;
      case '11':
        // For all radio buttons
        $('#task11-container input[type=radio]').each(function() {
          // Set to unchecked and trigger change to blank calculated fields
          $(this).prop('checked', false).trigger('change');
        });
        // For all text inputs (answers and repetition and intrusions counters)
        $('#task11-container input[type=text]').each(function() {
          // Set to blank
          $(this).val('');
        });
        break;
      case '12':
        // For all radio buttons
        $('#task12-container input[type=radio]').each(function() {
          // Set to unchecked and trigger change to blank calculated fields
          $(this).prop('checked', false).trigger('change');
        });
        break;
      default: break;
    }
  });
}

/**
 * Add listeners to process clicks on the various task cheat buttons.
 * @private
 */
function _addTaskCheatButtonsListeners() {
  // For all clicks on a task cheat button
  $('button.task-cheat-button').on('click', function(e) {
    // Prevent propagation
    e.preventDefault();
    // Get the task number
    let task = $(e.target).val();
    // Get the type of cheat
    let cheat = $(e.target).attr('correctness');
    // Switch based on the task
    switch (task) {
      case '1':
        // For all datalist linked text input of task 1
        $('#task1-trials-container > div[trial] > div.wordlist-trial-container > input[list]').each(function() {
          // Set to empty, add hiding class and remove classifying classes
          $(this).val('')
            .addClass('hiddenInput')
            .removeClass('good-word repetition intrusion');
        });
        // Update the shown hidden inputs
        _showFirstEmptyWordlistInput();
        // For all calculated fields of task 1
        $('#task1-container input.calculated-field').each(function() {
          // Set calculated field to 0
          $(this).val('0');
        });
        break;
      case '2':
        $('#task2-container input[type="radio"]').each(function() {
          // Set input depending on correctness then trigger change on input
          $(this).prop(
            'checked',
            ($(this).val() === '1' && cheat === 'correct') ||
            ($(this).val() === '0' && cheat === 'wrong')
          ).trigger('change');
        });
        break;
      case '3':
        $('#task3-container input[type="radio"]').each(function() {
          // Set input depending on correctness then trigger change on input
          $(this).prop(
            'checked',
            ($(this).val() === '1' && cheat === 'correct') ||
            ($(this).val() === '0' && cheat === 'wrong')
          ).trigger('change');
        });
        break;
      case '4':
        // For every data entry input of the task
        $('#task4-container input.data-entry').each(function() {
          // Get the field's row
          let row = $(this).closest('tr');
          // Copy the correct response value (3rd column) into the field
          // then trigger a change
          $(this).val($('td:nth-child(3)', row).text()).trigger('change');
        });
        break;
      case '5':
        $('#task5-container input[type="radio"]').each(function() {
          // Set input depending on correctness then trigger change on input
          $(this).prop(
            'checked',
            ($(this).val() === '1' && cheat === 'correct') ||
            ($(this).val() === '0' && cheat === 'wrong')
          ).trigger('change');
        });
        break;
      case '7':
        // For all rows of the results table
        $('#task7-container #data-entry-table14 > tbody > tr').each(function() {
          // Depending on the type of cheat
          if (cheat === 'correct') {
            // Check the input for correct response to the first trial of the row
            $('td:nth-child(3) > div > label:nth-child(1) > input', this)
              .prop('checked', true).trigger('change');
          } else {
            // Check the input for the wrong response for first trial
            // and correct response for second trial
            $('td:nth-child(3) > div > label:nth-child(2) > input', this)
              .prop('checked', true).trigger('change');
            $('td:nth-child(5) > div > label:nth-child(1) > input', this)
              .prop('checked', true).trigger('change');
          }
        });
        break;
      case '8':
        // If the cheat is all correct
        if (cheat === 'correct') {
          // Set total for max value
          $('#T8_Total').val('89');
          // If the cheat is for all wrong
        } else {
          // Set total for min value
          $('#T8_Total').val('0');
        }
        break;
      case '9':
        // For all datalist linked text input of the task
        $('#task9-trial-container > div.wordlist-trial-container > input[list]')
          .each(function() {
            // Set to empty, add hiding class and remove
            // value classifying classes and trigger change
            $(this).val('')
              .addClass('hiddenInput')
              .removeClass('good-word repetition intrusion')
              .trigger('change');
          });
        // Update the shown hidden inputs
        _showFirstEmptyWordlistInput();
        // For all calculated fields of task 9
        $('#task9-container input.calculated-field').each(function() {
          // Set calculated field to 0
          $(this).val('0');
        });
        break;
      case '10':
        // For all radio inputs of task 10
        $('#task10-container input[type="radio"]').each(function() {
          // Get the field value
          let value = $(this).val();
          // Check the input based on the cheat type
          $(this).prop(
            'checked',
            (value === value.toUpperCase() && cheat === 'correct') ||
            (value === value.toLowerCase() && cheat === 'wrong')
          );
        });
        // Trigger change on the first input to update calculated fields
        $('#task10-container input[type="radio"]').first().trigger('change');
        break;
      case '11':
        $('#task11-container input[type="radio"]').each(function() {
          // Set input depending on correctness then trigger change on input
          $(this).prop(
            'checked',
            ($(this).val() === '1' && cheat === 'correct') ||
            ($(this).val() === '0' && cheat === 'wrong')
          ).trigger('change');
        });
        break;
      case '12':
        $('#task12-container input[type="radio"]').each(function() {
          // Set input depending on correctness then trigger change on input
          $(this).prop(
            'checked',
            ($(this).val() === '1' && cheat === 'correct') ||
            ($(this).val() === '0' && cheat === 'wrong')
          ).trigger('change');
        });
        break;
      default: break;
    }
  });
}

/**
 * Function to add listeners for the instrument-wide reset button
 * @private
 */
function _addFormResetButtonListener() {
  // For clicks on the instrument-wide reset button
  $('#reset_button').on('click', function(e) {
    // Stop propagation
    e.preventDefault();
    // Instrument wide controls
    $('#Embargo').val('Internal');
    $('#General_Comments').val('');
    // Trigger all reset buttons
    $('button.task-reset-button').trigger('click');
  });
}

/**
 * Function which adds a listener to the submit button of the data entry
 * page to allow for in-page validations before submission.
 * @private
 */
function _addSubmitButtonListener() {
  // For clicks on the submit button of the data entry page
  $('#fire_control').on('click', function(e) {
    // Initialize the invalid elements
    let errors = {};
    // Validate that no comments (task or general) features
    // unsupported characters
    $('textarea[name$="_Comments"]').each(function() {
      let matches = $(this).val().match(/[^0-9a-z',\.\-àâçéèêëîïôûùüÿñæœ ]/gi);
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
        ' on the form: ',
        'Invalid Comments Characters');
      return;
    }
    // Validate that the words of task 1, 6 and 9 don't include unsupported
    // characters
    $('#task1-trials-container input[list],' +
      '#task6-container ol > li > input,' +
      '#task9-trial-container input[list]').each(function() {
        let word = $(this).val();
        if (word !== '') {
          let matches = word.match(/[^a-z'\-àâçéèêëîïôûùüÿñæœ]/gi);
          if (matches) {
            e.preventDefault();
            errors[$(this).prop('name')] = matches.toString();
          }
        }
      });
    // Prompt error message for invalid characters in word inputs
    if (Object.keys(errors).length !== 0) {
      _submitErrorMessage(
        errors,
        'There are some invalid characters in some of the' +
        ' word inputs in the form (Tasks #1, #6 and #9): ',
        'Word Inputs Errors'
      );
      return;
    }
    // If administration is complete, check that all tasks have the
    // required fields
    if ($('#Administration').val() === 'All') {
      let totalFields = {
        T1_Score_1: '#1, Missing Trial 1 data',
        T1_Score_2: '#1, Missing Trial 2 data',
        T1_Score_3: '#1, Missing Trial 3 data',
        T1_Score_4: '#1, Missing Trial 4 data',
        T1_Total: '#1, Missing Total',
        T1_Repetitions: '#1, Missing Repetitions Value',
        T1_Intrusions: '#1, Missing Intrusions Value',
        T2_Total: '#2, Missing Total',
        T2_Repetitions: '#2, Missing Repetitions Value',
        T2_Intrusions: '#2, Missing Intrusions Value',
        T3_Drawing_Score: '#3, Missing Drawing Total',
        T3_Placement_Score: '#3, Missing Placement Total',
        T3_Total: '#3, Missing Total',
        T4_Total: '#4, Missing Total',
        T5_Total: '#5, Missing Total',
        T6_Raw_Total: '#6, Missing Raw Total',
        T6_Repetitions: '#6, Missing Repetitions Value',
        T6_Intrusions: '#6, Missing Intrusions Value',
        T7_Span_Width: '#7, Missing Span Width',
        T7_Total: '#7, Missing Total',
        T8_Total: '#8, Missing Total',
        T9_Total: '#9, Missing Total',
        T9_Repetitions: '#9, Missing Repetitions Value',
        T9_Intrusions: '#9, Missing Intrusions Value',
        T10_Total: '#10, Missing Total',
        T10_Distractor_Score: '#10, Missing Distractor Score',
        T10_Targets_Score: '#10, Missing Targets Score',
        T11_Total: '#11, Missing Total',
        T11_Repetitions: '#11, Missing Repetitions Value',
        T11_Intrusions: '#11, Missing Intrusions Value',
        T12_Drawing_Score: '#12, Missing Drawing Total',
        T12_Placement_Score: '#12, Missing Placement Total',
        T12_Total: '#12, Missing Total'};
      Object.keys(totalFields).forEach(function(element) {
        if ($(`#${element}`).val() === '') {
          e.preventDefault();
          errors[element] = totalFields[element];
        }
      });
      // Prompt error message for missing info on tasks
      if (Object.keys(errors).length !== 0) {
        _submitErrorMessage(
          errors,
          'Some task are missing information for full' +
          ' administration: ',
          'Incomplete Tasks');
        return;
      }
    }
  });
}

/**
 * Function which shows the first empty input for tasks with variable length
 * number of text inputs.
 */
function _showFirstEmptyWordlistInput() {
  // For each trial of task 1
  $('#task1-trials-container > div[trial]').each(function() {
    // for each input of the trial
    $('div.wordlist-trial-container > input', this).each(function() {
      // if the content is empty
      if ($(this).val() === '') {
        // remove the hiding class
        $(this).removeClass('hiddenInput');
        // break out of loop for that specific trial
        return false;
      }
    });
  });
  // For each input with a list property of task 9
  $('#task9-trial-container > div.wordlist-trial-container > input[list]')
    .each(function() {
      // if the content is empty
      if ($(this).val() === '') {
        // remove the hiding class
        $(this).removeClass('hiddenInput');
        // break out of loop
        return false;
      }
    });
}

/**
 * Function to show the first empty text input of task 6
 */
function _showFirstEmptyTextInput() {
  // for each list item of task 6
  $('#task6-container li').each(function() {
    // if the input is not empty
    if ($('input', this).val() === '') {
      // remove the hiding class from the list item
      $(this).removeClass('hiddenInput');
      // break out of loop
      return false;
    }
  });
}

/**
 * Function to show the first empty radio button of task 7.
 */
function _showFirstEmptyRadioInput() {
  // Disable all radio inputs of task 7
  $('#task7-container #data-entry-table14 > tbody > tr input[type=radio]')
    .prop('disabled', true);
  // for each row of task 7
  $('#task7-container #data-entry-table14 > tbody > tr')
    .each(function(index, row) {
      // Get the values of the scores for the row
      let series1 = $('td:nth-child(3) > div > label > input:checked', row)
        .val();
      let series2 = $('td:nth-child(5) > div > label > input:checked', row)
        .val();
      // If the first score is undefined
      if (series1 === undefined) {
        // Enable the radio input
        $('td:nth-child(3) > div > label > input', row).prop('disabled', false);
        // Break out
        return false;
        // If the first score is failed and the second is undefined
      } else if (series1 === '0' && series2 === undefined) {
        // Enable both inputs from the row
        $('td > div > label > input', row).prop('disabled', false);
        // Break out
        return false;
        // If the first score is failed but the second is correct
      } else if (series1 === '0' && series2 === '1') {
        // Enable both inputs on the row and continue to next row
        $('td > div > label > input', row).prop('disabled', false);
        // If both score are failed
      } else if (series1 === '0' && series2 === '0') {
        // Enable both inputs
        $('td > div > label > input', row).prop('disabled', false);
        // Break out
        return false;
        // If the first score is correct
      } else if (series1 === '2') {
        // Enable first score and continue to the next row
        $('td:nth-child(3) > div > label > input', row).prop('disabled', false);
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
  if ($('input[type=hidden][name=page]').val() !== 'Data_Entry') {
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
 * Function which adds listeners to the session buttons of the top page.
 */
function addSessionButtonListeners() {
  // For every checkbox type input with a sessionButton label
  $('label.sessionButton > input[type=checkbox]').on('change', function(e) {
    // If selected
    if ($(e.target).prop('checked')) {
      // Remove the hidden class from the matching row in the results table
      $('#' + $(e.target).prop('id').slice(0, -6) + 'row').removeClass('hiddenRow');
      // If deselected
    } else {
      // Hide the matching row from the results table
      $('#' + $(e.target).prop('id').slice(0, -6) + 'row').addClass('hiddenRow');
    }
    // Update the chart to match the currently shown results
    updateResultsChart();
  });
}

/**
 * Function which updates the longitudinal results' charts to match the currently
 * displayed information.
 */
function updateResultsChart() {
  // If the chart exists
  if (longitudinalResultsChartByVisits !== undefined &&
    longitudinalResultsChartByVisits !== null) {
    // Given the limitations of the C3 API, dynamic categories can't be loaded
    // and unloaded in an existing chart, so it must be destroyed with each
    // update
    longitudinalResultsChartByVisits = longitudinalResultsChartByVisits.destroy();
    // Build the data object for the results by visits
    let data = buildLongitudinalByVisitDataObject();
    // Build the config object based on the calculated data object
    let configObjects = buildLongitudinalConfigObject(data);
    // Generate the C3 chart using both objects
    longitudinalResultsChartByVisits = _generateC3Chart(
      '#longitudinalResultsChartByVisits',
      configObjects.types,
      data,
      configObjects.axes,
      'Domains',
      'Index Score',
      'Index Z-Scores',
      [{value: 85, text: 'Index Score Lower Bound'},
        {value: 115, text: 'Index Score Upper Bound'}],
      configObjects.series);
    // Set default visibility for the matching chart
    _setDefaultVisibilityLongitudinalByVisits();
  }
  // If the chart exists
  if (longitudinalResultsChartByDomains !== undefined &&
    longitudinalResultsChartByDomains !== null) {
    // Unload the chart's values
    // Note: async issues if done is not used
    longitudinalResultsChartByDomains.unload({
      // When done
      done: function() {
        // Build the data object for the matching chart
        let data = buildLongitudinalByDomainDataObject();
        // If there's at least 1 point to display
        if (data[0].length > 1) {
          // Load the data into the chart
          longitudinalResultsChartByDomains.load({
            done: _setDefaultVisibilityLongitudinalByDomains,
            columns: data
          });
        }
      }
    });
  }
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
      let defaults = [lrMap.Visit, lrMap.Language, lrMap.Version, lrMap.Idx1,
        lrMap.Idx2, lrMap.Idx3, lrMap.Idx4, lrMap.Idx5, lrMap.Idx6];
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
 * Function which calculates the data object and display the matching chart
 * if on the top page.
 */
function initializeResultsCharts() {
  // If on the top page
  if ($('input[type=hidden][name=page]').val() !== 'Data_Entry') {
    // Construct the charts
    displayChartedResults();
    // Show default data on charts
    showDefaultChartData();
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
    {'Index Scores': 'line',
      'Index Z-Scores': 'line'},
    data,
    {'Index Scores': 'y',
      'Index Z-Scores': 'y2'},
    'Domains',
    'Index Scores',
    'Index Z-Scores',
    [{value: 85, text: 'Index Score Lower bound'},
      {value: 115, text: 'Index Score Upper bound'}],
    ['Index Z-Scores'],
    false,
    false);
  // Build the data object for the longitudinal results (viewed by visits)
  data = buildLongitudinalByVisitDataObject();
  // Build the config object based on the calculated data object
  let configObjects = buildLongitudinalConfigObject(data);
  // Generate the longitudinal results' (visits) chart
  longitudinalResultsChartByVisits = _generateC3Chart(
    '#longitudinalResultsChartByVisits',
    configObjects.types,
    data,
    configObjects.axes,
    'Domains',
    'Index Score',
    'Index Z-Scores',
    [{value: 85, text: 'Index Score Lower bound'},
      {value: 115, text: 'Index Score Upper bound'}],
    configObjects.series);
  // Build the data object for the longitudinal results (viewed by domains)
  data = buildLongitudinalByDomainDataObject();
  // Build the config object based on the calculated data object
  configObjects = buildLongitudinalConfigObject(data);
  // Generate the longitudinal results' (domains) chart
  longitudinalResultsChartByDomains = _generateC3Chart(
    '#longitudinalResultsChartByDomains',
    configObjects.types,
    data,
    configObjects.axes,
    'Visit',
    'Index Scores',
    'Index Z-Scores',
    [{value: 85, text: 'Index Score Lower bound'},
      {value: 115, text: 'Index Score Upper bound'}],
    configObjects.series);
}

/**
 * Function which builds the data object for the C3 chart of the currents
 * results on the top page.
 * @return {[]}    array of arrays that can be used as a column value for C3
 */
function buildCurrentResultsChartData() {
  // Initialize data array
  let data = [];
  // Initialize array for current results
  data = [
    ['x', 'Immediate Memory', 'Visuospatial/Constructional', 'Language',
      'Attention', 'Delayed Memory', 'Total Scale'],
    ['Index Scores'],
    ['Index Z-Scores']];
  // Get the first row (index score results) of the body of the current
  // results table
  let row = $('#results-table > tbody > tr:nth-child(1)');
  // Initialize the indices array
  let indices = [];
  // For each column matching an index score
  [crMap.Idx1, crMap.Idx2, crMap.Idx3,
    crMap.Idx4, crMap.Idx5, crMap.Idx6].forEach(function(value) {
      // Push the parsed value for the index domain to the indices array
      indices.push(parseIntegerCell(value, row));
    });
  // If at least one value of the indices is not null
  if (indices.filter(value => value !== null).length >= 1) {
    // Push all indices to the matching array of the data object
    data[1] = data[1].concat(indices);
  }
  // Get the second row (normalized index score results) of the body of the current results table
  row = $('#results-table > tbody > tr:nth-child(2)');
  // Initialize the normalized indices array
  let normalizedIndices = [];
  // For each column matching a normalized index domain
  [crMap.Idx1, crMap.Idx2, crMap.Idx3,
    crMap.Idx4, crMap.Idx5, crMap.Idx6].forEach(function(value) {
      // Push the parsed value for the normalized index domain to the normalized indices array
      normalizedIndices.push(parseNormalizedCell(value, row));
    });
  // If at least one value of the normalized indices is not null
  if (normalizedIndices.filter(value => value !== null).length >= 1) {
    // Push all normalized indices to the matching array of the data object
    data[2] = data[2].concat(normalizedIndices);
  }
  // Return the array
  return data;
}

/**
 * Function which builds the data object for the longitudinal results' C3 chart
 * when viewed as a progression of visits.
 * @return {[]}  array of arrays that can be used as a column value for C3
 */
function buildLongitudinalByVisitDataObject() {
  // Initialize array for longitudinal results (visits)
  let data = [
    ['x', 'Immediate Memory', 'Visuospatial/Constructional', 'Language',
      'Attention', 'Delayed Memory', 'Total Scale']];
  // For all rows of the results table which are not hidden
  $('#longitudinal-results-table > tbody > tr:not(.hiddenRow)')
    .each(function(index, element) {
      // Take the visit label from the first cell of the row
      let visitLabel = (($('td:nth-child(1) > a', element).html())
        .replace('<br><span class="font-xsmall">', ' (')).replace('</span>', ')');
      // Initialize the indices array
      let indices = [];
      // For all index score columns of the domains
      [lrMap.Idx1, lrMap.Idx2, lrMap.Idx3,
        lrMap.Idx4, lrMap.Idx5, lrMap.Idx6].forEach(function(value) {
          // Push the parsed value of the index score to the indices array
          indices.push(parseIntegerCell(value, element));
        });
      // If at least one index value is not null
      if (indices.filter(value => value !== null).length >= 1) {
        // Push the name of the visit to the data array
        data.push([`${visitLabel} Index Scores`]);
        // Get the index of the last element of the data array
        let index = data.length - 1;
        // Push all indices to that last element
        data[index] = data[index].concat(indices);
      }
      // Initialize the normalized indices array
      let normalizedIndices = [];
      // For all domain columns matching a normalized index value
      [lrMap.NIdx1, lrMap.NIdx2, lrMap.NIdx3,
        lrMap.NIdx4, lrMap.NIdx5, lrMap.NIdx6].forEach(function(value) {
          // Push the parsed value to the normalized indices array
          normalizedIndices.push(parseNormalizedCell(value, element));
        });
      // If at least one normalized index value is not null
      if (normalizedIndices.filter(value => value !== null).length >= 1) {
        // Push the name of the visit to the data array
        data.push([`${visitLabel} Index Z-Scores`]);
        // Get the index of the last element of the data array
        let index = data.length - 1;
        // Push all normalized indices to the last element of the data array
        data[index] = data[index].concat(normalizedIndices);
      }
    });
  // Return the array
  return data;
}

/**
 * Function which builds the data object for the longitudinal results' C3 chart
 * when viewed changes in domain values over time.
 * @return {[]} array of arrays that can be used as a column value for C3
 */
function buildLongitudinalByDomainDataObject() {
  // Initialize array for longitudinal results (domains)
  let data = [
    ['x'],
    ['Immediate Memory (Index Scores)'],
    ['Immediate Memory (Index Z-Scores)'],
    ['Visuospatial/Constructional (Index Scores)'],
    ['Visuospatial/Constructional (Index Z-Scores)'],
    ['Language (Index Scores)'],
    ['Language (Index Z-Scores)'],
    ['Attention (Index Scores)'],
    ['Attention (Index Z-Scores)'],
    ['Delayed Memory (Index Scores)'],
    ['Delayed Memory (Index Z-Scores)'],
    ['Total Scale (Index Scores)'],
    ['Total Scale (Index Z-Scores)']];
  // For all rows of the results table which are not hidden
  $('#longitudinal-results-table > tbody > tr:not(.hiddenRow)')
    .each(function(index, element) {
      // Take the visit label from the first cell of the row
      let visitLabel = (($('td:nth-child(1) > a', element).html())
        .replace('<br><span class="font-xsmall">', ' (')).replace('</span>', ')');
      // Initialize the indices and normalized indices arrays
      let indices = [];
      let normalizedIndices = [];
      // For all columns matching a domain's index score
      [lrMap.Idx1, lrMap.Idx2, lrMap.Idx3,
        lrMap.Idx4, lrMap.Idx5, lrMap.Idx6].forEach(function(value) {
          // Push the parsed values to the indices array
          indices.push(parseIntegerCell(value, element));
        });
      // For all columns matching a domain's normalized index score
      [lrMap.NIdx1, lrMap.NIdx2, lrMap.NIdx3,
        lrMap.NIdx4, lrMap.NIdx5, lrMap.NIdx6].forEach(function(value) {
          // Push the parsed values to the normalized indices array
          normalizedIndices.push(parseNormalizedCell(value, element));
        });
      // If either the indices or normalized indices arrays have one or more
      // non-null values
      if (normalizedIndices.filter(value => value !== null).length >= 1 ||
        indices.filter(value => value !== null).length >= 1) {
        // Push the name of the visit to the data array
        data[0].push(`${visitLabel}`);
        // Push the index scores to the matching indices of the data array
        // Domain #1: 1     Domain #2: 3    Domain #3: 5
        // Domain #4: 7     Domain #5: 9    Domain #6: 11
        [1, 3, 5, 7, 9, 11].forEach(function(index, position) {
          data[index].push(indices[position]);
        });
        // Push the normalized index scores to the matching indices of the data array
        // Domain #1: 2     Domain #2: 4    Domain #3: 6
        // Domain #4: 8     Domain #5: 10    Domain #6: 12
        [2, 4, 6, 8, 10, 12].forEach(function(index, position) {
          data[index].push(normalizedIndices[position]);
        });
      }
    });
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
      // If the name of the row doesn't match normalized data
      if (element[0].search('Z-Scores') === -1) {
        // Add row name to the types as a line
        configObject.types[element[0]] = 'line';
        // Add row name to the axes as belonging to the main axis
        configObject.axes[element[0]] = 'y';
        // If the name of the row matches normalized data
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
 * @param {string} bindElement    ID of the DIV anchor
 * @param {Object}  types         List of the series and their types
 * @param {[][]}  columns         Series data using the C3 object format
 * @param {Object}  axes          List of the series and the axis they belong to
 * @param {string}  xLabel        Name of the X axis
 * @param {string}  yLabel        Name of the Y axis
 * @param {string}  y2Label       Name of the secondary Y axis
 * @param {[]}  lines             Names and location of the extra Y grid lines
 * @param {[]}  y2Series          List of the series belonging to the secondary
 *                                Y axis
 * @param {boolean} isZoomable    Zoom functionality of the chart
 * @param {boolean} isRescalable  Rescaling functionality of the chart
 * @param {string}  xPosition     Position of the label of the X axis
 * @param {string}  yPosition     Position of the label of the Y axis
 * @param {string}  y2Position    Position of the label of the secondary Y axis
 * @return {Object}   handle on the generated C3 chart
 * @private
 */
function _generateC3Chart(
  bindElement,
  types,
  columns,
  axes,
  xLabel = '',
  yLabel = '',
  y2Label = '',
  lines = [],
  y2Series = [],
  isZoomable = true,
  isRescalable = true,
  xPosition = 'outer-center',
  yPosition = 'outer-middle',
  y2Position = 'outer-middle') {
  return c3.generate({
    bindto: bindElement,
    data: {
      types: types,
      empty: {
        label: {
          text: 'No Displayable Data Selected'
        }
      },
      x: 'x',
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
        padding: 0,
        min: 40,
        max: 160,
        label: {
          text: yLabel,
          position: yPosition
        }
      },
      y2: {
        center: 0,
        show: true,
        label: {
          text: y2Label,
          position: y2Position
        },
        tick: {
          format: function(d) {
            return d.toFixed(4);
          }
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
          // Toggle the series matching the legend element clicked
          this.api.toggle(id);
          // List all series shown
          let seriesShown = this.api.data.shown();
          // Filter all series shown that belong to the secondary axis
          let y2SeriesShown = seriesShown
            .filter(series => y2Series
              .includes(series.id)).length;
          // Set the visibility of the secondary axis based on the presence
          // of series belonging to the secondary axis
          _sety2AxisVisibility(
            y2SeriesShown >= 1,
            this.api);
          // If only secondary axis series are shown
          if (seriesShown.length === y2SeriesShown) {
            // Remove the extra Y grid lines
            this.api.ygrids.remove();
            // If at least one primary axis series is shown
          } else {
            // Add the extra Y grid lines
            this.api.ygrids.add(lines);
          }
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
 * Function which resets the charts' visibilities to the default
 */
function showDefaultChartData() {
  _setDefaultVisibilityCurrentResults();
  _setDefaultVisibilityLongitudinalByVisits();
  _setDefaultVisibilityLongitudinalByDomains();
}

/**
 * Function which sets the default visibility of the longitudinal results' chart
 * (domains) which is showing the index and hiding the normalized values.
 */
function _setDefaultVisibilityLongitudinalByDomains() {
  // If the chart is defined
  if (longitudinalResultsChartByDomains !== undefined) {
    // Show all series
    longitudinalResultsChartByDomains.show();
    // Initialize the second axis series' array
    let y2Series = [];
    // For each series shown
    longitudinalResultsChartByDomains.data.shown().forEach(function(element) {
      // If the series is part of the second axis, normalized values,
      if (element.id.search('Z-Scores') !== -1) {
        // Push the series' id to the array
        y2Series.push(element.id);
      }
    });
    // Hide all second axis series
    longitudinalResultsChartByDomains.hide(y2Series);
    // Hide the second axis
    _sety2AxisVisibility(false, longitudinalResultsChartByDomains);
  }
}

/**
 * Function which sets the default visibility of the longitudinal results' chart
 * (visits) which is showing the index and hiding the normalized values.
 */
function _setDefaultVisibilityLongitudinalByVisits() {
  // If the chart is defined
  if (longitudinalResultsChartByVisits !== undefined) {
    // Show all series
    longitudinalResultsChartByVisits.show();
    // Initialize the second axis series array
    let y2Series = [];
    // For each series shown
    longitudinalResultsChartByVisits.data.shown().forEach(function(element) {
      // If part of the second axis, normalized values
      if (element.id.search('Z-Scores') !== -1) {
        // Add id to the array
        y2Series.push(element.id);
      }
    });
    // Hide all second axis series
    longitudinalResultsChartByVisits.hide(y2Series);
    // Hide second axis
    _sety2AxisVisibility(false, longitudinalResultsChartByVisits);
  }
}

/**
 * Function which sets the default visibility of the current results' chart.
 */
function _setDefaultVisibilityCurrentResults() {
  // If the chart is defined
  if (currentResultsChart !== undefined) {
    // Show all series
    currentResultsChart.show();
    // Hide the series with normalized values
    currentResultsChart.hide(['Index Z-Scores']);
    // Hide the second axis
    _sety2AxisVisibility(false, currentResultsChart);
  }
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
 * Function which parses the data of a normalized cell result into a number.
 * @param {int} column  Number of the column of the cell in the results table
 * @param {jQuery} element  jQuery node of the cell's row
 * @return {?number}  Normalized scaled score or null
 */
function parseNormalizedCell(column, element) {
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
 * Function which parses the data of a normalized cell result into a number.
 * @param {int} column  Number of the column of the cell in the results table
 * @param {jQuery} element  jQuery node of the cell's row
 * @return {?number}  Normalized scaled score
 */
function parseIntegerCell(column, element) {
  // Take the value from the cell of the column identified using the
  // context provided
  let result = $('td:nth-child(' + column + ')', element).html();
  // If the value is empty, null or doesn't exist, set to null, otherwise,
  // parse to float
  result = result === undefined ||
  result === null ||
  result === '' ?
    null :
    isNaN(Number.parseInt(result, 10)) ?
      null :
      Number.parseInt(result, 10);
  return result;
}

/**
 * Function which validates that the content of the field specified as an integer
 * between the set limits.
 * @param {string} fieldID      ID of the field to be tested
 * @param {int} lower           Lower bound for the integer
 * @param {int} upper           Upper bound for the integer
 * @return {?Number}           The parsed value if valid, null otherwise
 * @private
 */
function _validatedIntegerTextInput(fieldID, lower = 0, upper = 15) {
  // parse the content as int
  let parsedNumber = Number.parseInt($(fieldID).val(), 10);
  // Return the value if valid
  if (!isNaN(parsedNumber) &&
        parsedNumber >= lower &&
        parsedNumber <= upper) {
    return parsedNumber;
  }
  // Return null if invalid
  return null;
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
