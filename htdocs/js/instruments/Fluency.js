/**
 * Helper script for the two pages of the Fluency instrument.
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
  // Adds an event handler for changes to the instrument settings controls
  instrumentSettingsEventHandler();
  // Adds an event handler for clicks on the clear all inputs button
  addClearAllInputsHandler();
  // Adds an event handler for clicks on the calculation button
  addCalculateTotalsHandler();
  // Adds an event handler for clicks on the remove word buttons
  addRemoveWordButtonHandler();
  // Adds an event handler for clicks on the add word buttons
  addAddWordButtonHandler();
  // Add Tooltips for the pages
  addTooltips();
});

/**
 * Function which removes default elements from the display to maximize
 * the space available for data entry.
 */
function adjustDefaultDisplayElementsForDataEntry() {
  // If the data entry table structure exists (data entry page only)
  if ($('#data-entry-table1').length || $('#administration[value="None"]').length) {
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
      // of the color gradient after expressing it as a percentage of 180
      // (divided by 1.8)
      backgroundColor = gradients[Math.round(Math.round((difference / 1.8)) / 5) * 5];
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
    let languageID = $('#languageID_select').val();
    let limitationID = $('#limitationID_select').val();
    // Reload the page following the format accepted by the rewrite rules
    window.location.href = '/' +
      candID + '/' +
      sessionID + '/' +
      'Fluency/Data_Entry/?' +
      'LanguageID=' + languageID +
      '&LimitationID=' + limitationID +
      '&commentID=' + commentID;
  });
}

/**
 * Function which adds a handler for the click event of the clear all inputs
 * button. This handler then blanks all inputs of the data entry table.
 *
 * Note: The blanking here uses the empty string since a blank space is an
 * acceptable value for null fields, that is fields for values which need to be
 * null (not answered) instead of 0.
 */
function addClearAllInputsHandler() {
  // For the click event of the clear all inputs buttons
  $('#clear-inputs-button').on('click', function(e) {
    // Prevent the defaults
    e.preventDefault();
    // For each input of each row of the data entry table
    $('#data-entry-table1 > tbody > tr > td > input').each(function() {
      // Set the input value to blank
      $(this).val('');
    });
    // Set the comments to empty
    $('#comments').val('');
    // Remove all words
    $('div.word-container').remove();
  });
}

/**
 * Function which adds a handler for clicks on the calculate button. Upon a
 * click, take the data entry fields, calculates the totals and assign the totals
 * to the appropriate input fields.
 */
function addCalculateTotalsHandler() {
  // For the click event of the calculate button
  $('#calculations-button').on('click', function(e) {
    // Prevent the defaults
    e.preventDefault();
    // Defining the parameters of each total
    let totals = [
      {name: '#total_correct', validNumber: 4, index: '2'},
      {name: '#total_intrusions', validNumber: 4, index: '3'},
      {name: '#total_repetitions', validNumber: 4, index: '4'}
    ];
    // For each total
    totals.forEach(function(total) {
      // Update the total using the extracted column values, the selector name
      // and the specified index
      updateTotals(
        total.name,
        total.validNumber,
        extractRowValues(total.index));
    });
  });
  // To make the changes to the input fields dynamic, on their change event
  $('td.col-md-2 > input.col-md-10').on('change', function() {
    // Trigger a click to the calculation button
    $('#calculations-button').trigger('click');
  });
}

/**
 *  Function which extract the values of the non-readOnly inputs from a column
 *  of the data entry table and add those values to a return array if they
 *  are positive integers.
 *
 * @param   {string}  index     position of the column to be examined in data entry
 *                              table (1-indexed)
 * @return  {array}   values    values of the column specified which are positive
 *                              integers
 */
function extractRowValues(index) {
  // Initialize the return array
  let values = [];
  // For each non-disabled input of the column specified
  $('#data-entry-table1 > tbody > tr > td:nth-child(' + index + ') > input:not([readOnly])').each(function() {
    // Get the value of the input
    let value = $(this).val();
    // If the input is defined, not empty, can be parsed as a base-10 integer
    // and that integer is positive
    if (typeof value !== 'undefined' &&
      value !== '' &&
      Number.isInteger(parseInt(value, 10)) &&
      parseInt(value, 10) >= 0) {
      // Add value to the returns array
      values.push(value);
    }
  });
  // return the valid values
  return values;
}

/**
 * Function which takes a list of values and, if the size of the list matches
 * the number of values specified, update the specified total input with the
 * value of the sum of those values, parsed as integers.
 *
 * @param {string}  outputCellID      ID of the input to update with the sum
 *                                    total
 * @param {number}  numberOfValues    Number of values that the list must have
 *                                    for all values to be valid
 * @param {array}   values            List of all values to be computed
 */
function updateTotals(outputCellID, numberOfValues, values) {
  // if the list has the right number of values
  if (values.length === numberOfValues) {
    // Reduce the list to the sum of its values, parsed as integers, and update
    // the total input
    $(outputCellID).val(values.reduce(function(previousValue, currentValue) {
      return previousValue + parseInt(currentValue, 10);
    }, 0));
    // if the list doesn't have the right number of values
  } else {
    // set the total input to the empty string, that is the null value
    $(outputCellID).val(' ');
  }
}

/**
 * Function which adds a handler to the dynamically created Remove Word buttons
 * that removes the container of the word button clicked and then triggers
 * a renumbering of all word containers.
 */
function addRemoveWordButtonHandler() {
  // Using the document object and the descendant selector allows the click
  // event handler to be assigned to the dynamically created remove word buttons
  $(document).on('click', 'button.remove_word_button', function(e) {
    // Prevent the defaults of the click
    e.preventDefault();
    // Removes the inputs for the word: button => div of button => container div
    // of word
    $($(e.target).parent().parent()).remove();
    // Renumber word containers' elements
    reNumberWordsRows();
  });
}

/**
 * Function which adds a handler to the Create Word buttons that allows for
 * the addition of word containers to the section of the button clicked
 */
function addAddWordButtonHandler() {
  // Note that unlike the remove word button, being statically created, the
  // handler can be added directly to the buttons instead of the document
  // object
  $('button.add-word-button').on('click', function(e) {
    // Prevent the defaults of the click
    e.preventDefault();
    // Add the generated word row node to just before the Add word button in
    // the targeted cell (button => div of button)
    $($(e.target).parent()).before(generateWordRow());
    // Trigger a renumbering of the word rows for all sections
    reNumberWordsRows();
  });
}

/**
 * Function which generates a word container with all six elements.
 * @return {Object}  jQuery word container node
 */
function generateWordRow() {
  // Creating containers
  let container = $('<div />',
    {
      class: 'col-md-12 word-container form-row'
    });
  let intrusionContainer = $('<div />',
    {
      class: 'col col-md-2'
    });
  let repetitionContainer = $('<div />',
    {
      class: 'col col-md-2'
    });
  let wordContainer = $('<div />',
    {
      class: 'col col-md-5'
    });
  let removeButtonContainer = $('<div />',
    {
      class: 'col col-md-3'
    });
  // Creating labels
  let intrusionLabel = $('<label />',
    {
      class: 'checkbox-label col-md-3',
      title: 'Intrusion?',
      for: 'intrusion'
    }).text('I?');
  let repetitionLabel = $('<label />',
    {
      class: 'checkbox-label col-md-3',
      title: 'Repetition?',
      for: 'repetition'
    }).text('R?');
  // Creating checkboxes
  let intrusionCheckbox = $('<input />',
    {
      class: 'col-md-9',
      type: 'checkbox',
      name: 'intrusion',
      id: 'intrusion',
      title: 'Intrusion?',
      tabIndex: '-1'
    });
  let repetitionCheckbox = $('<input />',
    {
      class: 'col-md-9',
      type: 'checkbox',
      name: 'repetition',
      id: 'repetition',
      title: 'Repetition?',
      tabIndex: '-1'
    });
  // Creating text input
  // Note that the double escape for the hyphen is necessary to produce
  // a valid pattern in the DOM from that method of construction
  let wordInput = $('<input />',
    {
      class: 'col-md-12',
      type: 'text',
      name: 'word',
      id: 'word',
      maxLength: '75',
      pattern: '[a-zA-Z][a-zA-Z\\-\']{0,73}[a-zA-Z]'
    }).prop('required', true);
  // Creating button
  let removeWordButton = $('<button />',
    {
      id: 'remove_word',
      class: 'button btn remove_word_button col-md-10 col-md-offset-1',
      tabIndex: '-1'
    });
  // Creating the icon for the button
  let removeWordIcon = $('<span />',
    {
      class: 'glyphicon glyphicon-remove'
    });
  // Filling the intrusion and repetition containers
  intrusionContainer
    .append(intrusionCheckbox)
    .append(intrusionLabel);
  repetitionContainer
    .append(repetitionCheckbox)
    .append(repetitionLabel);
  // Filling the word container
  wordContainer.append(wordInput);
  // Filling the button
  removeWordButton.append(removeWordIcon);
  // Filling the button container
  removeButtonContainer.append(removeWordButton);
  // Assembling the main container
  container
    .append(intrusionContainer)
    .append(repetitionContainer)
    .append(wordContainer)
    .append(removeButtonContainer);
  // Returning the main container
  return container;
}

/**
 * Function which renumbers all the appropriate word container elements to
 * reflect their positions in the current DOM configuration.
 */
function reNumberWordsRows() {
  // For every cell of the word column
  $('tr > td.col-md-5').each(function(sectionIndex, section) {
    // For every word container of each section
    $('div.word-container', section).each(function(wordIndex, word) {
      // For all elements of each word container
      $('div > *', word).each(function(elementIndex, element) {
        // Given the static nature of the order, switch on the positional
        // index to customize treatment based on the element
        switch (elementIndex) {
          // Checkbox for intrusion
          case 0:
            // Update name and ID to reflect the section and word indices
            $(element).prop('name', 'intrusion_' + sectionIndex + '_' + wordIndex);
            $(element).prop('id', 'intrusion_' + sectionIndex + '_' + wordIndex);
            // break to next element
            break;
            // Label of intrusion checkbox
          case 1:
            // Update the for property of the label
            $(element).prop('for', 'intrusion_' + sectionIndex + '_' + wordIndex);
            // Break to next element
            break;
            // Checkbox for repetition
          case 2:
            // Update name and ID to reflect the section and word indices
            $(element).prop('name', 'repetition_' + sectionIndex + '_' + wordIndex);
            $(element).prop('id', 'repetition_' + sectionIndex + '_' + wordIndex);
            // Break to next element
            break;
            // Label of the repetition checkbox
          case 3:
            // Update the for property of the label element
            $(element).prop('for', 'repetition_' + sectionIndex + '_' + wordIndex);
            // Break to next element
            break;
            // Text input of the word
          case 4:
            // Update name and ID to reflect the section and word indices
            $(element).prop('name', 'word_' + sectionIndex + '_' + wordIndex);
            $(element).prop('id', 'word_' + sectionIndex + '_' + wordIndex);
            // Break to next element
            break;
            // Remove word button
          case 5:
            // Update the ID of the remove word button
            $(element).prop('id', 'remove_word_' + sectionIndex + '_' + wordIndex);
            // Break to next element
            break;
            // Ignore further elements
          default: break;
        }
      });
    });
  });
}

/**
 * Function which defines and add the tooltips for all elements on the page.
 */
function addTooltips() {
  //
  // Adding the tooltips for the instrument settings
  //
  addBootstrapTooltip(
    'languageID_label',
    '<p>Language in which the test was administered</p>');
  addBootstrapTooltip(
    'limitationID_label',
    '<p>Limitation given for the words to be generated.</p>');
  //
  // Adding the tooltips for the test parameters
  //
  addBootstrapTooltip(
    'embargo_label',
    '<p><span class="bold">Restricted:</span> For exclusive use of the original laboratory.</p><p><span class="bold">Internal:</span> Can be shared within the research group.</p><p><span class="bold">Open:</span> Can be shared outside the research group.</p>');
  //
  // Adding the tooltips for the columns headers
  //
  addBootstrapTooltip(
    'correct_column_header',
    '<p>Number of words given that match the limitation used</p>');
  addBootstrapTooltip(
    'intrusions_column_header',
    '<p>Number of words given that do not match the limitation used</p>');
  addBootstrapTooltip(
    'repetitions_column_header',
    '<p>Number of words given that are repetitions of previously used words</p>');
  addBootstrapTooltip(
    'words_column_header',
    '<p>Ordered list of the words given with appropriate intrusions and repetitions annotations</p>');
  //
  // Adding the tooltips for the row headers
  //
  addBootstrapTooltip(
    'section1_header',
    '<p>Words and errors for the first section (0-15s)</p>');
  addBootstrapTooltip(
    'section2_header',
    '<p>Words and errors for the second section (15-30s)</p>');
  addBootstrapTooltip(
    'section3_header',
    '<p>Words and errors for the first section (30-45s)</p>');
  addBootstrapTooltip(
    'section4_header',
    '<p>Words and errors for the first section (45-60s)</p>');
  addBootstrapTooltip(
    'totals_header',
    '<p>Cumulative totals for the words and errors</p>');
  //
  // Adding the tooltips for the buttons
  //
  addBootstrapTooltip(
    'clear-inputs-button',
    '<p>Clear all inputs, including removing words, from the form</p>');
  addBootstrapTooltip(
    'calculations-button',
    '<p>Calculate totals based on the numerical inputs given</p>');
  addBootstrapTooltip(
    'add_word_1',
    '<p>Append a word to the first section</p>');
  addBootstrapTooltip(
    'add_word_2',
    '<p>Append a word to the second section</p>');
  addBootstrapTooltip(
    'add_word_3',
    '<p>Append a word to the third section</p>');
  addBootstrapTooltip(
    'add_word_4',
    '<p>Append a word to the fourth section</p>');
}
/**
 * Function which adds a Bootstrap tooltip using the specified parameters.
 * @param {string}  id          ID of the HTML element to which the tooltip is
 *                              linked
 * @param {string}  text        HTML formatted text to be displayed in the
 *                              tooltip
 * @param {string}  placement   Position to place the tooltip (top, right,
 *                              bottom, left)
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
