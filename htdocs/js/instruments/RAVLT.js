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
  // Add listeners for select elements
  addSelectInputListeners();
  // Add listeners for buttons
  addButtonListeners();
  // Add listeners for calculated values
  addTextInputListeners();
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
  if ($('#data-entry-table1, #data-entry-table5').length) {
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
  // For the select control with the test-setttings class
  $('select.test-settings').on('change', function(e) {
    // Prevent the default behavior
    e.preventDefault();
    // Parse the candID, sessionID and commentID from the address produced
    // by the .htaccess rewrite rules of the site
    let locationParameters = $(location).attr('href').match(/^https:\/\/.+\/([0-9]+)\/([0-9]+).+commentID=([0-9A-Za-z_]+)$/);
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
      'RAVLT/Data_Entry/?' +
      'Test_Language=' + testLanguage +
      '&Test_Version=' + testVersion +
      '&commentID=' + commentID;
  });
}

/**
 * Function which adds the listeners for the buttons of both
 * pages of the instrument
 */
function addButtonListeners() {
  // Add a listener for the reset button of the data entry page
  addResetButtonListener();
  // Add session button listeners for the top page
  addSessionButtonListeners();
  // Initialize the buttons on the top page
  $('label.sessionButton > input[type=checkbox]').trigger('change');
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
 * Function which adds a listener for the reset button of the data
 * entry page.
 */
function addResetButtonListener() {
  $('#reset_button').on('click', function(e) {
    // Prevent default behavior
    e.preventDefault();
    // Set instrument settings to default values
    $('#test_language').val('fr');
    $('#test_version').val('1');
    $('#Embargo').val('Internal');
    // Empty the comments
    $('#Comments').val('');
    // Empty the input fields
    $('input.text-input').each(function(index, element) {
      $(element).val('');
    });
    // Parse the candID, sessionID and commentID from the address
    let locationParameters = $(location).attr('href').match(/^https:\/\/.+\/([0-9]+)\/([0-9]+).+commentID=([0-9A-Za-z_]+)$/);
    // Assign the values to separate variables
    let candID = locationParameters[1];
    let sessionID = locationParameters[2];
    let commentID = locationParameters[3];
    // Adjust address to remove GET parameters
    window.history.pushState(
      {},
      document.title,
      '/' +
      candID + '/' +
      sessionID + '/' +
      'RAVLT/Data_Entry/?commentID=' + commentID);
  });
}

/**
 * Function which adds the listeners for the text input elements
 * of the data entry page.
 */
function addTextInputListeners() {
  // When an input with the text input class changes
  $('input.text-input').on('change', function(event) {
    // Recalculate the fields
    calculateFields();
    // Blank the scored field or fields associated with the change
    // since scoring is done in the back-end
    blankScoredFields(event);
  });
}

/**
 * Function which computes the values for the calculated fields. Note: as for
 * the scored fields, this value is scored in the back-end and is calculated here
 * only for display purposes.
 */
function calculateFields() {
  // If the field for the number of words recognized exists
  if ($('#A_Recognition_Recognized').length === 1) {
    // If the field for the number of word recognized is empty
    if ($('#A_Recognition_Recognized').val() === '') {
      // Set the number of words forgotten to empty
      $('#A_Recognition_Forgotten').val('');
      // If the field for the number of words recognized has a value
    } else {
      // Parse the value to integer
      let words = parseInt($('#A_Recognition_Recognized').val(), 10);
      // If value is valid (list of 15 words)
      if (words >= 0 && words <= 15) {
        // Set the number of words forgotten as the difference
        $('#A_Recognition_Forgotten').val(15 - words);
        // If the value is invalid
      } else {
        // Set the number of words forgotten to empty
        $('#A_Recognition_Forgotten').val('');
      }
    }
  }
  // Initialize the sum of the scores for the first 5 trials as empty
  let sum = '';
  // For each of the first five trials
  for (let i = 1; i < 6; i++) {
    // If all relevant fields exist and are not empty
    if ($('#A_Trial' + i + '_Correct').length === 1 &&
      $('#A_Trial' + i + '_Correct').val() !== '' &&
      $('#A_Trial' + i + '_Repetitions').length === 1 &&
      $('#A_Trial' + i + '_Repetitions').val() !== '' &&
      $('#A_Trial' + i + '_Incorrect').length === 1 &&
      $('#A_Trial' + i + '_Incorrect').val() !== '') {
      // Parse the score as an integer
      let words = parseInt($('#A_Trial' + i + '_Correct').val(), 10);
      // If the value is valid (list is 15 words long)
      if (words >= 0 && words <= 15) {
        // If the sum is empty
        if (sum === '') {
          // Set the sum to the value of the score
          sum = words;
          // If the sum is not empty
        } else {
          // Add the score to the sum
          sum += words;
        }
      }
    }
  }
  // Set the scored field to the value of the sum calculated
  $('#Sum_Score_Trial_1_5').val(sum);
}

/**
 * Function which blanks the associated scored field when a linked text input
 * is changed. Note: this blanking is for display purposes only, the back-end
 * calculates the scoring and ignores the front-end value set for the field when
 * saving the data.
 * @param {jQuery} event  event where a text input fired a change event
 */
function blankScoredFields(event) {
  // Based on the changed field, blank the associated scored field
  if (['A_Trial1_Correct',
    'A_Trial1_Repetitions',
    'A_Trial1_Incorrect'].includes($(event.target).prop('id'))) {
    $('#Z_Score_Trial1').val('');
    $('#Z_Score_Trial1_5').val('');
  } else if (['A_Trial2_Correct',
    'A_Trial2_Repetitions',
    'A_Trial2_Incorrect',
    'A_Trial3_Correct',
    'A_Trial3_Repetitions',
    'A_Trial3_Incorrect',
    'A_Trial4_Correct',
    'A_Trial4_Repetitions',
    'A_Trial4_Incorrect',
    'A_Trial5_Correct',
    'A_Trial5_Repetitions',
    'A_Trial5_Incorrect'].includes($(event.target).prop('id'))) {
    $('#Z_Score_Trial1_5').val('');
  } else if (['B_Recall_Correct',
    'B_Recall_Repetitions',
    'B_Recall_Incorrect',
    'B_Recall_A_Intrusions'].includes($(event.target).prop('id'))) {
    $('#Z_Score_Interference_List').val('');
  } else if (['A_Immediate_Correct',
    'A_Immediate_Repetitions',
    'A_Immediate_Incorrect',
    'A_Immediate_B_Intrusions'].includes($(event.target).prop('id'))) {
    $('#Z_Score_Immediate_Recall').val('');
  } else if (['A_Delayed_Correct',
    'A_Delayed_Repetitions',
    'A_Delayed_Incorrect',
    'A_Delayed_B_Intrusions'].includes($(event.target).prop('id'))) {
    $('#Z_Score_Delayed_Recall').val('');
  } else if (['A_Recognition_Recognized'].includes($(event.target).prop('id'))) {
    $('#Percentile_Recognition').val('');
  }
}

/**
 * Function which adds the tooltips necessary for both pages
 */
function addTooltips() {
  // Construct wordlist tooltips
  addWordListTooltips();
  // Add defined max sizes text input tooltips
  addMaxSizeTooltips();
  // For all session buttons when on top page
  $('label.sessionButton').each(function(index, element) {
    // Make the button tooltip
    makeSessionButtonTooltip(element);
  });
}

/**
 * Function which adds appropriate list tooltips for the
 * matching elements with the matching class on the data entry
 * page.
 */
function addWordListTooltips() {
  // For each element with a listAList class
  $('.listAList').each(function(index, element) {
    makeWordListTooltip('List A', element);
  });
  // For each element with a listBList class
  $('.listBList').each(function(index, element) {
    makeWordListTooltip('List B', element);
  });
  // For each element with a recognitionList class
  $('.recognitionList').each(function(index, element) {
    makeWordListTooltip('Recognition List', element);
  });
}

/**
 * Function which takes a category and jQuery element and binds
 * a Bootstrap tooltip matching the category to the element.
 * @param {string} category   Name of the list
 * @param {jQuery} e          Element to which the tooltip must be associated
 */
function makeWordListTooltip(category, e) {
  // Get the list of words
  let words = JSON.parse($(e).attr('data_words'));
  // Initialize the HTML string
  let HTMLString = '<p><span class="bold underline">' + category + '</span></p>';
  // Add a class to govern the number of columns based on the length of the list
  if (words.length > 15) {
    HTMLString += '<ul class="longWordList">';
  } else {
    HTMLString += '<ul class="shortWordList">';
  }
  // For each word of the list, adda list item
  words.forEach(function(word) {
    HTMLString += '<li>' + word + '</li>';
  });
  // Close the list
  HTMLString += '</ul>';
  // Remove the attributes used as data sources
  $(e).removeAttr('data_words');
  // Add a bootstrap tooltip using the generated string to the node
  addBootstrapTooltip($(e).prop('id'), HTMLString);
}

/**
 * Function which adds a simple tooltip for field with a defined max length.
 */
function addMaxSizeTooltips() {
  // For every text input of the text-input class with a defined title property
  $('input[type=text][title].text-input').each(function(index, element) {
    // If the element matches the only element with a defined max length other
    // than 15
    if ($(element).prop('id') === 'A_Recognition_False_Positive') {
      // Add a tooltip for the alternative length
      addBootstrapTooltip($(element).prop('id'),
        '<span class="bold smaller emphasis"> / 35 </span>');
      // For all other elements
    } else {
      // Add a tooltip with the common length
      addBootstrapTooltip($(element).prop('id'),
        '<span class="bold smaller emphasis"> / 15 </span>');
    }
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
    ['Z-Score Trial 1'],
    ['Z-Score Trial 1-5'],
    ['Z-Score Interference List'],
    ['Z-Score Immediate Recall'],
    ['Z-Score Delayed Recall'],
    ['Recognition Percentile']
  ];
  // For all rows of the results table which are not hidden
  $('#longitudinal-results-table > tbody > tr:not(.hiddenRow)').each(function(index, element) {
    // Take the visit label from the first cell of the row
    let visitLabel = (($('td:nth-child(1) > a', element).html())
      .replace('<br><span class="font-xsmall">', ' (')).replace('</span>', ')');
    // Take the value from the 3rd cell, the Z-Score for Trial 1
    let trial1 = $('td:nth-child(3)', element).html();
    // If the value is empty, null or doesn't exist, set to null, otherwise,
    // parse to float
    trial1 = trial1 === undefined ||
              trial1 === null ||
              trial1 === '' ?
              null :
              Number.parseFloat(trial1);
    // Take the value from the 4th cell, the Z-Score for Trial 1-5
    let trial15 = $('td:nth-child(4)', element).html();
    // If the value is empty, null or doesn't exist, set to null, otherwise,
    // parse to float
    trial15 = trial15 === undefined ||
              trial15 === null ||
              trial15 === '' ?
              null :
              Number.parseFloat(trial15);
    // Take the value from the 5th cell, the Z-Score for the interference trial
    let interference = $('td:nth-child(5)', element).html();
    // If the value is empty, null or doesn't exist, set to null, otherwise,
    // parse to float
    interference = interference === undefined ||
                    interference === null ||
                    interference === '' ?
                    null :
                    Number.parseFloat(interference);
    // Take the value from the 6th cell, the Z-Score for immediate recall
    let immediate = $('td:nth-child(6)', element).html();
    // If the value is empty, null or doesn't exist, set to null, otherwise,
    // parse to float
    immediate = immediate === undefined ||
                immediate === null ||
                immediate === '' ?
                null :
                Number.parseFloat(immediate);
    // Take the value from the 7th cell, the Z-Score for delayed recall
    let delayed = $('td:nth-child(7)', element).html();
    // If the value is empty, null or doesn't exist, set to null, otherwise,
    // parse to float
    delayed = delayed === undefined ||
              delayed === null ||
              delayed === '' ?
              null :
              Number.parseFloat(delayed);
    // Take the value from the 8th cell, the recognition percentile
    let recognition = $('td:nth-child(8)', element).html();
    if (recognition === undefined || recognition === null || recognition === '') {
      recognition = null;
    } else {
      let matches = recognition.match(/((?<single>\d{1,3})%|(?<low>\d{1,3})-(?<high>\d{1,3})%)/);
      if(matches === null) {
        recognition = null;
      } else {
        if(matches.groups.single !== undefined) {
          recognition = parseInt(matches.groups.single, 10);
        }else if (matches.groups.low !== undefined && matches.groups.high !== undefined){
          recognition = ((Number.parseFloat(matches.groups.low) + Number.parseFloat(matches.groups.high))/2.0).toFixed(1);
        } else {
          recognition = null;
        }
      }
    }
    // If any of the Z-Score are defined
    if (trial1 !== null ||
        trial15 !== null ||
        interference !== null ||
        immediate !== null ||
        delayed !== null ||
        recognition !== null) {
      // Add label and values to array
      // Note: adding null in the sequence of values will represent the empty
      // value correctly for C3 instead of offsetting the sequence
      data[0].push(visitLabel);
      data[1].push(trial1);
      data[2].push(trial15);
      data[3].push(interference);
      data[4].push(immediate);
      data[5].push(delayed);
      data[6].push(recognition);
    }
  });
  // Return the array
  return data;
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
        'Z-Score Trial 1': 'line',
        'Z-Score Trial 1-5': 'line',
        'Z-Score Interference List': 'line',
        'Z-Score Immediate Recall': 'line',
        'Z-Score Delayed Recall': 'line',
        'Recognition Percentile': 'scatter'
      },
      empty: {
        label: {
          text: 'No Displayable Data Selected'
        }
      },
      x: 'x',
      columns: data,
      axes: {
        'Z-Score Trial 1': 'y',
        'Z-Score Trial 1-5': 'y',
        'Z-Score Interference List': 'y',
        'Z-Score Immediate Recall': 'y',
        'Z-Score Delayed Recall': 'y',
        'Recognition Percentile': 'y2'
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
          // This part of the code plays directly with the chart object since
          // the functionality to remove the y2 axis when hiding the y2 data
          // series through API calls on the object doesn't exist. VERY FRAGILE
          // and dependent on the exact current config. On updating the library,
          // will have to either update the hack, use the feature
          // if they've added it or remove the feature and leave y2 visible
          // regardless of the series displayed
          if(id === 'Recognition Percentile') {
            chart.internal.config.axis_y2_show =
              !chart.internal.config.axis_y2_show;
            chart.internal.axes.y2.style(
              'visibility',
              chart.internal.config.axis_y2_show ?
                'visible' :
                'hidden');
          }
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
            columns: data
          });
        }
      }
    });
  }
}
