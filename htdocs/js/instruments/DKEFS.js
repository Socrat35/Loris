/**
 * Helper script for the two pages of the RAVLT instrument.
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
// Handle for the C3 graph object
let chart;
// jQuery function for waiting until the page is ready
$(document).ready(function() {
  // Adjusts the background color of the Window Difference cell
  dynamicallyAdjustWindowDifferenceBackgroundColor();
  // Removes the info tables for the data entry page
  adjustDefaultDisplayElementsForDataEntry();
  // Add listeners for buttons elements
  addButtonListeners();
  // Add listeners for text inputs
  addTextInputListeners();
  // Add tooltips
  addTooltips();
  // Add modal state handlers
  addModalStateHandlers();
  // Initialize, if necessary, the results' chart
  initializeChartResultsChart();
});

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
  if ($('#data-entry-table1, #data-entry-table5').length) {
    // Detach the current lorisworkspace div
    let currentSpace = $('#lorisworkspace').detach();
    // Remove the two information tables from their div and append the
    // saved structure to the proper element
    $('div.inset > div:nth-child(2)').empty().append(currentSpace);
  }
}

/**
 * Function which adds listeners for the various buttons.
 */
function addButtonListeners() {
  // Adding listener for the reset button of the data entry page
  addResetButtonListener();
  // Add session button listeners for the top page
  addSessionButtonListeners();
  // Add defaults button listener for the longitudinal table of the top page
  addDefaultsButtonListener();
  // Add customization button listeners
  addCustomizationButtonListeners();
  // Initialize the buttons on the top page
  $('label.sessionButton > input[type=checkbox]').trigger('change');
  $('#setDefaultTableBtn').trigger('change');
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
 * Function which adds a listener to the reset button of the data
 * entry page.
 */
function addResetButtonListener() {
  $('#reset_button').on('click', function(e) {
    // Prevent default behavior
    e.preventDefault();
    // Set instrument settings to default values
    $('#Embargo').val('Internal');
    $('#test_version').val('N/A');
    $('#test_language').val('fr');
    // Empty the comments
    $('#Comments').val('');
    // Empty the input fields, each of the scored
    // fields will also be emptied by their tied-in listeners
    $('input.text-input').each(function(index, element) {
      $(element).val('');
    });
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
 * Function which adds a listener to the defaults button of the top page.
 */
function addDefaultsButtonListener() {
  $('#setDefaultTableBtn').on('change', function(e) {
    if ($(e.target).prop('checked')) {
      // Hide all columns
      $('#longitudinal-results-table > thead > tr > th,' +
        '#longitudinal-results-table > tbody > tr > td').each(function(index, element) {
          $(element).hide();
        });
      // The default columns as per their position in the longitudinal
      // results table:
      // 1) Visit
      // 2) Language
      // 8) C1 Normalized Scaled Score
      // 15) C2 Normalized Scaled Score
      // 18) Combined C1 and C2 Normalized Scaled Score
      // 24) C3 Normalized Scaled Score
      // 34) C4 Normalized Scaled Score
      // 49) Comments
      let defaults = [1, 2, 8, 15, 18, 24, 34, 49];
      // Show the default columns
      defaults.forEach(function(value) {
        $('#longitudinal-results-table > thead > tr > th:nth-child(' + value + '),' +
          '#longitudinal-results-table > tbody > tr > td:nth-child(' + value + ')').each(function(index, element) {
            $(element).show();
          });
      });
    } else {
      // Show all columns
      $('#longitudinal-results-table > thead > tr > th,' +
        '#longitudinal-results-table > tbody > tr > td').each(function(index, element) {
          $(element).show();
        });
    }
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
 * Function which adds listeners to the text inputs.
 */
function addTextInputListeners() {
  // Add listeners for calculated fields
  addCalculatedFieldsListeners();
  // Add listeners for blanking scored fields
  addScoredFieldsBlankersListeners();
}

/**
 * Function which adds listeners to the calculated fields inputs
 * of the data entry page to calculate the total errors sums.
 */
function addCalculatedFieldsListeners() {
  $('input:not([readonly]).error-field').on('change', function(e) {
    let table = $(e.target).parent().parent().parent();
    let sum = [];
    $('tr > td > input:not([readonly]).error-field', table).each(function(index, value) {
      if (validateErrorValue($(value).val())) {
        sum.push(parseInt($(value).val(), 10));
      }
    });
    if (sum.length === 2) {
      $('tr > td > input[readonly].error-field', table).val(sum[0] + sum[1]);
    } else {
      $('tr > td > input[readonly].error-field', table).val('');
    }
  });
}

/**
 * Function which validates the error value of an input field.
 * @param {string}  value   Error value
 * @returns {boolean}   Is the error value valid
 */
function validateErrorValue(value) {
  return value !== '' && parseInt(value, 10) >= 0;
}

/**
 * Function which adds listeners to the scored fields which blanks their
 * values when changes to the linked inputs are done.
 */
function addScoredFieldsBlankersListeners() {
  // Directional associations between changed fields (keys) and the fields
  // that need to be blanked because their value needs to be re-scored (values)
  let directionalAssociations = {
    C1_Time: ['Time_C1_Scaled_Score',
              'Time_C1_Scaled_Score_Normalized',
              'Time_C_1_2_Scaled_Score',
              'Time_C_1_2_Scaled_Score_Normalized',
              'Contrast_C3_C1_Scaled_Score',
              'Contrast_C3_C1_Scaled_Score_Normalized',
              'Contrast_C4_C_1_2_Scaled_Score',
              'Contrast_C4_C_1_2_Scaled_Score_Normalized',
              'Contrast_C4_C1_Scaled_Score',
              'Contrast_C4_C1_Scaled_Score_Normalized'],
    C1_Corrected_Errors: ['Errors_C1_Total_Errors_Percentile'],
    C1_Uncorrected_Errors: ['Errors_C1_Total_Errors_Percentile'],
    C1_Total_Errors: ['Errors_C1_Total_Errors_Percentile'],
    C2_Time: ['Time_C2_Scaled_Score',
              'Time_C2_Scaled_Score_Normalized',
              'Time_C_1_2_Scaled_Score',
              'Time_C_1_2_Scaled_Score_Normalized',
              'Contrast_C4_C_1_2_Scaled_Score',
              'Contrast_C4_C_1_2_Scaled_Score_Normalized',
              'Contrast_C4_C2_Scaled_Score',
              'Contrast_C4_C2_Scaled_Score_Normalized'],
    C2_Corrected_Errors: ['Errors_C2_Total_Errors_Percentile'],
    C2_Uncorrected_Errors: ['Errors_C2_Total_Errors_Percentile'],
    C2_Total_Errors: ['Errors_C2_Total_Errors_Percentile'],
    C3_Time: ['Time_C3_Scaled_Score',
              'Time_C3_Scaled_Score_Normalized',
              'Contrast_C3_C1_Scaled_Score',
              'Contrast_C3_C1_Scaled_Score_Normalized',
              'Contrast_C4_C3_Scaled_Score',
              'Contrast_C4_C3_Scaled_Score_Normalized'],
    C3_Corrected_Errors: ['Errors_C3_Corrected_Errors_Percentile',
                          'Errors_C3_Total_Errors_Scaled_Score',
                          'Errors_C3_Total_Errors_Scaled_Score_Normalized'],
    C3_Uncorrected_Errors: ['Errors_C3_Uncorrected_Errors_Percentile',
                            'Errors_C3_Total_Errors_Scaled_Score',
                            'Errors_C3_Total_Errors_Scaled_Score_Normalized'],
    C3_Total_Errors: ['Errors_C3_Total_Errors_Scaled_Score',
                      'Errors_C3_Total_Errors_Scaled_Score_Normalized'],
    C4_Time: ['Time_C4_Scaled_Score',
              'Time_C4_Scaled_Score_Normalized',
              'Contrast_C4_C_1_2_Scaled_Score',
              'Contrast_C4_C_1_2_Scaled_Score_Normalized',
              'Contrast_C4_C3_Scaled_Score',
              'Contrast_C4_C3_Scaled_Score_Normalized',
              'Contrast_C4_C1_Scaled_Score',
              'Contrast_C4_C1_Scaled_Score_Normalized',
              'Contrast_C4_C2_Scaled_Score',
              'Contrast_C4_C2_Scaled_Score_Normalized'],
    C4_Corrected_Errors: ['Errors_C4_Corrected_Errors_Percentile',
                          'Errors_C4_Total_Errors_Scaled_Score',
                          'Errors_C4_Total_Errors_Scaled_Score_Normalized'],
    C4_Uncorrected_Errors: ['Errors_C4_Uncorrected_Errors_Percentile',
                            'Errors_C4_Total_Errors_Scaled_Score',
                            'Errors_C4_Total_Errors_Scaled_Score_Normalized'],
    C4_Total_Errors: ['Errors_C4_Total_Errors_Scaled_Score',
                      'Errors_C4_Total_Errors_Scaled_Score_Normalized']
  };
  Object.entries(directionalAssociations).forEach(function([key, value]) {
    $('#' + key).on('change', function() {
      value.forEach(function(value) {
        $('#' + value).val('');
      });
    });
  });
}

/**
 * Function which adds tooltips to the session buttons.
 */
function addTooltips() {
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
 * Function which calculates the data object and display the matching chart
 * if on the top page.
 */
function initializeChartResultsChart() {
  // If on the top page (absence of the data entry table)
  if ($('#data-entry-table1').length === 0) {
    // Build the data object
    let data = buildChartDataObject();
    // Construct the chart
    displayChartedResults(data);
    // Show default data on chart
    showDefaultChartData();
  }
}

/**
 * Function which builds the data object for the C3 chart of the longitudinal
 * results on the top page.
 * @return {[][]}    C3 data object
 */
function buildChartDataObject() {
  // Initialize array with both lines
  let data = [
    ['x'],
    ['C1 SS'],
    ['C1 Total Error'],
    ['C2 SS'],
    ['C2 Total Error'],
    ['Combined C1-C2 SS'],
    ['C3 SS'],
    ['C3 Total Error SS'],
    ['C3 Corrected Errors'],
    ['C3 Uncorrected Errors'],
    ['C4 SS'],
    ['C4 Total Error SS'],
    ['C4 Corrected Errors'],
    ['C4 Uncorrected Errors'],
    ['C3 Vs. C1 SS'],
    ['C4 Vs. Combined C1-C2 SS'],
    ['C4 Vs. C3 SS'],
    ['C4 Vs. C1 SS'],
    ['C4 Vs. C2 SS']
  ];
  // For all rows of the results table which are not hidden
  $('#longitudinal-results-table > tbody > tr:not(.hiddenRow)').each(function(index, element) {
    // Take the visit label from the first cell of the row
    let visitLabel = (($('td:nth-child(1) > a', element).html())
      .replace('<br><span class="font-xsmall">', ' (')).replace('</span>', ')');
    let C1NormalizedScore = parseNormalizedCell(8, element);
    let C1TotalErrorRank = parsePercentileCell(9, element);
    let C2NormalizedScore = parseNormalizedCell(15 ,element);
    let C2TotalErrorRank = parsePercentileCell(16, element);
    let C1C2NormalizedScore = parseNormalizedCell(18 ,element);
    let C3NormalizedScore = parseNormalizedCell(24, element);
    let C3TotalErrorNormalizedScore = parseNormalizedCell(26, element);
    let C3CorrectedErrors = parsePercentileCell(27, element);
    let C3UncorrectedErrors = parsePercentileCell(28, element);
    let C4NormalizedScore = parseNormalizedCell(34, element);
    let C4TotalErrorNormalizedScore = parseNormalizedCell(36, element);
    let C4CorrectedErrors = parsePercentileCell(37, element);
    let C4UncorrectedErrors = parsePercentileCell(38, element);
    let C3VsC1Normalized = parseNormalizedCell(40, element);
    let C4VsC12Normalized = parseNormalizedCell(42, element);
    let C4VsC3Normalized = parseNormalizedCell(44, element);
    let C4VsC1Normalized = parseNormalizedCell(46, element);
    let C4VsC2Normalized = parseNormalizedCell(48, element);
    // If any of the value computed are not null
    if (
      [ C1NormalizedScore,
        C1TotalErrorRank,
        C2NormalizedScore,
        C2TotalErrorRank,
        C1C2NormalizedScore,
        C3NormalizedScore,
        C3TotalErrorNormalizedScore,
        C3CorrectedErrors,
        C3UncorrectedErrors,
        C4NormalizedScore,
        C4TotalErrorNormalizedScore,
        C4CorrectedErrors,
        C4UncorrectedErrors,
        C3VsC1Normalized,
        C4VsC12Normalized,
        C4VsC3Normalized,
        C4VsC1Normalized,
        C4VsC2Normalized].filter((value) => value !== null).length >= 1) {
      // Add label and values to array
      // Note: adding null in the sequence of values will represent the empty
      // value correctly for C3 instead of offsetting the sequence
      data[0].push(visitLabel);
      data[1].push(C1NormalizedScore);
      data[2].push(C1TotalErrorRank);
      data[3].push(C2NormalizedScore);
      data[4].push(C2TotalErrorRank);
      data[5].push(C1C2NormalizedScore);
      data[6].push(C3NormalizedScore);
      data[7].push(C3TotalErrorNormalizedScore);
      data[8].push(C3CorrectedErrors);
      data[9].push(C3UncorrectedErrors);
      data[10].push(C4NormalizedScore);
      data[11].push(C4TotalErrorNormalizedScore);
      data[12].push(C4CorrectedErrors);
      data[13].push(C4UncorrectedErrors);
      data[14].push(C3VsC1Normalized);
      data[15].push(C4VsC12Normalized);
      data[16].push(C4VsC3Normalized);
      data[17].push(C4VsC1Normalized);
      data[18].push(C4VsC2Normalized);
    }
  });
  // Return the array
  return data;
}

/**
 * Function which parses the data of a normalized cell result into a number.
 * @param {int} column  Number of the column of the cell in the results table
 * @param {jQuery} element  jQuery node of the cell's row
 * @returns {number}  Normalized scaled score
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
 * Function which parses the data from a percentile cell into a number
 * @param {int} column  Number of the cell's column in the results table
 * @param {jQuery} element  Node of the cell's row
 * @returns {number}  Error percentile
 */
function parsePercentileCell(column, element) {
  // Take the percentile from the cell of the column
  // identified using the context provided
  let result = $('td:nth-child(' + column + ')', element).html();
  if (result === undefined || result === null || result === '') {
    result = null;
  } else {
    let matches = result.match(/(?<percentile>\d{1,3})(?<whitespace>(&nbsp;)*|\s*)(?<symbol>%)/);
    if(matches === null) {
      result = null;
    } else {
      if(matches.groups.percentile !== undefined) {
        result = isNaN(parseInt(matches.groups.percentile, 10)) ?
          null :
          parseInt(matches.groups.percentile, 10);
      } else {
        result = null;
      }
    }
  }
  return result;
}

/**
 * Function which takes a calculated data object and generates a matching
 * C3 chart.
 * @param {[][]} data   data object for the C3 chart
 */
function displayChartedResults(data) {
  chart = c3.generate({
    bindto: '#resultsChart',
    data: {
      types: {
        'C1 SS' : 'line',
        'C2 SS': 'line',
        'Combined C1-C2 SS': 'line',
        'C3 SS': 'line',
        'C3 Total Error SS': 'line',
        'C4 SS': 'line',
        'C4 Total Error SS': 'line',
        'C3 Vs. C1 SS': 'line',
        'C4 Vs. Combined C1-C2 SS': 'line',
        'C4 Vs. C3 SS': 'line',
        'C4 Vs. C1 SS': 'line',
        'C4 Vs. C2 SS': 'line',
        'C1 Total Error': 'line',
        'C2 Total Error': 'line',
        'C3 Corrected Errors': 'line',
        'C3 Uncorrected Errors': 'line',
        'C4 Corrected Errors': 'line',
        'C4 Uncorrected Errors': 'line'
      },
      empty: {
        label: {
          text: 'No Displayable Data Selected'
        }
      },
      x: 'x',
      columns: data,
      axes: {
        'C1 SS' : 'y',
        'C2 SS': 'y',
        'Combined C1-C2 SS': 'y',
        'C3 SS': 'y',
        'C3 Total Error SS': 'y',
        'C4 SS': 'y',
        'C4 Total Error SS': 'y',
        'C3 Vs. C1 SS': 'y',
        'C4 Vs. Combined C1-C2 SS': 'y',
        'C4 Vs. C3 SS': 'y',
        'C4 Vs. C1 SS': 'y',
        'C4 Vs. C2 SS': 'y',
        'C1 Total Error': 'y2',
        'C2 Total Error': 'y2',
        'C3 Corrected Errors': 'y2',
        'C3 Uncorrected Errors': 'y2',
        'C4 Corrected Errors': 'y2',
        'C4 Uncorrected Errors': 'y2'
      }
    },
    axis: {
      x: {
        type: 'category',
        label: {
          text: 'Visits',
          position: 'inner-center'
        }
      },
      y: {
        center: 0,
        label: {
          text: 'Z-Score',
          position: 'outer-middle'
        },
        tick: {
          format: function(d) {
            return d.toFixed(4);
          }
        }
      },
      y2: {
        max: 100,
        min: 0,
        show: true,
        label: {
          text: 'Percentile',
          position: 'outer-middle'
        },
        tick: {
          format: function(d) {
            return d.toFixed(0) + '%';
          }
        }
      }
    },
    legend: {
      item: {
        onclick: function(id) {
          chart.toggle(id);
          let y2DataSeries = ['C1 Total Error',
                              'C2 Total Error',
                              'C3 Corrected Errors',
                              'C3 Uncorrected Errors',
                              'C4 Corrected Errors',
                              'C4 Uncorrected Errors'];
          let y2SeriesShown = this.api.data.shown().filter((serie) => y2DataSeries.includes(serie['id']));
          sety2AxisVisibility(y2SeriesShown.length >= 1);
          chart.internal.redraw();
        }
      }
    },
    zoom: {
      enabled: true,
      rescale: true
    }
  });
}

/**
 * Function which, if the handle is associated with an existing
 * chart, unloads the displayed data and rebuilds the chart
 * with the currently visible data.
 */
function updateResultsChart() {
  // If the chart exists
  if (chart !== undefined) {
    // Unload the chart's values
    // Note: async issues if done is not used
    chart.unload({
      // When done
      done: function() {
        // Build the data object
        let data = buildChartDataObject();
        // If there's at least 1 point to display
        if (data[0].length > 1) {
          // Load the data into the chart
          chart.load({
            done: showDefaultChartData,
            columns: data
          });
        }
      }
    });
  }
}

/**
 * Function which resets the chart to the default columns.
 */
function showDefaultChartData() {
  chart.hide();
  chart.show(
    [ 'C1 SS',
      'C2 SS',
      'Combined C1-C2 SS',
      'C3 SS',
      'C4 SS']);
  sety2AxisVisibility(false);
}

/**
 * Function which sets the visibility of the Y2 axis of the chart. This
 * is necessary due to missing functionality in the current API. Should be
 * replaced with a native API call as soon as possible.
 * @param {boolean} visibility  Visibility of the second Y axis
 */
function sety2AxisVisibility(visibility) {
  chart.internal.config.axis_y2_show = visibility;
  chart.internal.axes.y2.style('visibility', visibility ? 'visible' : 'hidden');
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
