/**
 * Helper script for the two pages of the TMT2 instrument.
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
  // Add listeners for the reset button
  addResetButtonListener();
  // Add listeners for user text inputs
  addInputListeners();
  // Add tooltips
  addTooltips();
  // Initialize, if necessary, the results' chart
  initializeChartResultsChart();
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
 * Function which adds a listener to the reset button
 * to overload the default of resetting the fields
 * to the first values displayed and instead setting
 * them to the proper default values.
 */
function addResetButtonListener() {
  $('#reset_button').on('click', function(e) {
    // Prevent default Behaviour
    e.preventDefault();
    // Set the default values for fields that are always
    // present
    $('#Embargo').val('Internal');
    $('#test_version').val('N/A');
    $('#test_language').val('fr');
    $('#Comments').val('');
    // If the text inputs are present (not in none mode)
    if ($('input[name=Administration]').val() !== 'None') {
      // Set fields to default values instead of the values they
      // loaded with
      $('#TMT_A_Time').val('');
      $('#TMT_B_Time').val('');
      $('#TMT_Total_Time').val('');
      $('#TMT_A_Errors').val('');
      $('#TMT_B_Errors').val('');
      $('#TMT_Total_Error').val('');
      $('#Z_Score_A').val('');
      $('#Z_Score_B').val('');
    }
  });
}

/**
 * Function which adds listeners to the inputs of the page.
 */
function addInputListeners() {
  // Add text input listeners
  addTextInputListeners();
  // Add session button listeners
  addSessionButtonListeners();
  // Initialize the buttons
  $('label.sessionButton > input[type=checkbox]').trigger('change');
}

/**
 * Function which add listeners to the text inputs of the data
 * entry page.
 */
function addTextInputListeners() {
  // For every text input of the data entry page, on change:
  $('input.user-text-input').on('change focusout', function(e) {
    // Calculate the sum fields for errors and time
    calculateFields();
    // If the change came from either the time or error field of trail A
    if ($(e.target).prop('id') === 'TMT_A_Time' || $(e.target).prop('id') === 'TMT_A_Errors') {
      // Empty the Z-Score to show that it needs to be recalculated
      $('#Z_Score_A').val('');
      // If the change came from either the time or error field of trail B
    } else if ($(e.target).prop('id') === 'TMT_B_Time' || $(e.target).prop('id') === 'TMT_B_Errors') {
      // Empty the Z-Score to show that it needs to be recalculated
      $('#Z_Score_B').val('');
    }
  });
}

/**
 * Function which calculates the values from the sum fields of both trail
 * depending on the validity and presence of the different values.
 */
function calculateFields() {
  // Check for time validity
  let timeA = _validateTime('TMT_A_Time');
  let timeB = _validateTime('TMT_B_Time');
  // If both time are valid
  if (timeA && timeB) {
    // The sum is equal to the sum as a float with precision 2
    $('#TMT_Total_Time').val((Number($('#TMT_A_Time').val()) + Number($('#TMT_B_Time').val())).toFixed(2));
    // If time A is valid
  } else if (timeA) {
    // The sum is equal to time A as a float with precision 2
    $('#TMT_Total_Time').val((Number($('#TMT_A_Time').val())).toFixed(2));
    // If time B is valid
  } else if (timeB) {
    // The sum is equal to time B as a float with precision 2
    $('#TMT_Total_Time').val((Number($('#TMT_B_Time').val())).toFixed(2));
    // If neither time are valid
  } else {
    // The sum is empty
    $('#TMT_Total_Time').val('');
  }
  // Check for error validity
  let errorA = _validateErrors('TMT_A_Errors');
  let errorB = _validateErrors('TMT_B_Errors');
  // If both error are valid
  if (errorA && errorB) {
    // The sum is equal to the sum as an integer
    $('#TMT_Total_Error').val(Number($('#TMT_A_Errors').val()) + Number($('#TMT_B_Errors').val()));
    // If errorA is valid
  } else if (errorA) {
    // The sum is equal to errorA as an integer
    $('#TMT_Total_Error').val(Number($('#TMT_A_Errors').val()));
    // If errorB is valid
  } else if (errorB) {
    // The sum is equal to errorB as an integer
    $('#TMT_Total_Error').val(Number($('#TMT_B_Errors').val()));
    // If neither errors are valid
  } else {
    // The sum is empty
    $('#TMT_Total_Error').val('');
  }
}

/**
 * Function which takes a key and validates whether
 * the linked field is a valid error value.
 * @param {string} key identifier of the error field
 * @return {boolean} Is the error value valid
 */
function _validateErrors(key) {
  // If the error is not empty, is a number, is an integer and is
  // larger than 0
  return $('#' + key).val() !== '' &&
    !Number.isNaN(Number($('#' + key).val())) &&
    Number.isInteger(Number($('#' + key).val())) &&
    Number($('#' + key).val()) >= 0;
}

/**
 * Function which takes a key and validates whether
 * the linked field is a valid time value.
 * @param {string} key identifier of the time field
 * @return {boolean} Is the time value valid
 */
function _validateTime(key) {
  // If the time value is not empty, is a number and is larger or equal
  // to 0
  return $('#' + key).val() !== '' &&
    !Number.isNaN(Number($('#' + key).val())) &&
    Number($('#' + key).val()) >= 0;
}

/**
 * Function which adds listeners on all checkbox type inputs from
 * the top page.
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
 * Function which defines and add the tooltips for all elements on the page.
 */
function addTooltips() {
  addBootstrapTooltip(
    'time-header',
    '<p>In seconds</p>');
  addBootstrapTooltip(
    'z-score-header',
    '<p>Larger value, Worse performance</p>');
  // For all session buttons when on top page
  $('label.sessionButton').each(function(index, element) {
    // Make the button tooltip
    makeSessionButtonTooltip(element);
  });
}

/**
 * Function which builds a HTML string to serve
 * as a tooltip for the node provided using its
 * data attributes. Those data attributes are then cleared.
 * @param {jQuery} e node of the button
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
 * Function which initializes the C3 results chart when
 * on the top page.
 */
function initializeChartResultsChart() {
  // If on the top page (absence of the data entry table)
  if ($('#data-entry-table1').length === 0) {
    // Build the data object
    let data = buildChartDataObject();
    // Construct the chart
    displayChartedResults(data);
  }
}

/**
 * Function which builds a mixed multidimensional array to load
 * the data shown from the results table into a C3 line chart.
 * @return {[][]} columns array for C3 chart
 */
function buildChartDataObject() {
  // Initialize array with both lines
  let data = [
    ['x'],
    ['Z-Score Trail A'],
    ['Z-Score Trail B']
  ];
  // For all rows of the results table which are not hidden
  $('#longitudinal-results-table > tbody > tr:not(.hiddenRow)').each(function(index, element) {
    // Take the visit label from the first cell of the row
    let visitLabel = (($('td:nth-child(1) > a', element).html()).replace('<br><span class="font-xsmall">', ' (')).replace('</span>', ')');
    // Take the value from the 4th cell, the Z-Score for A
    let scoreA = $('td:nth-child(4)', element).html();
    // If the value is empty, null or doesn't exist, set to null, otherwise, parse
    // to float
    scoreA = scoreA === undefined || scoreA === null || scoreA === '' ? null : Number.parseFloat(scoreA);
    // Take the value from the 7th cell, the Z-Score for B
    let scoreB = $('td:nth-child(7)', element).html();
    // If the value is empty, null or doesn't exist, set to null, otherwise, parse
    // to float
    scoreB = scoreB === undefined || scoreB === null || scoreB === '' ? null : Number.parseFloat(scoreB);
    // If either of the Z-Score are defined
    if (scoreA !== null || scoreB !== null) {
      // Add label and values to array
      // Note: adding null in the sequence of values will represent the empty
      // value correctly for C3 instead of offsetting the sequence
      data[0].push(visitLabel);
      data[1].push(scoreA);
      data[2].push(scoreB);
    }
  });
  // Return the array
  return data;
}

/**
 * Function which generates a C3 line chart based on the provided
 * columns' array and links it to an element on the page.
 * @param {[][]} data multi-dimensional array for the columns of the chart
 */
function displayChartedResults(data) {
  chart = c3.generate({
    bindto: '#resultsChart',
    data: {
      type: 'line',
      empty: {
        label: {
          text: 'No Displayable Data Selected'
        }
      },
      x: 'x',
      columns: data
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
        label: {
          text: 'Z-Score',
          position: 'outer-middle'
        },
        tick: {
          format: function(d) {
            return d.toFixed(4);
          }
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
 * Function which, if the C3 chart exists, updates its values
 * with the currently displayed ones.
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
            columns: data
          });
        }
      }
    });
  }
}
