/**
 * Helper script for the two pages of the Everyday Cognition (ECog) instrument.
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
// Handle for the C3 graph object of the ECog results
let eCogChart;
// Handle for the C3 graph object of the Subjective Complaints results
let subjectiveChart;
// Data array for the subjective complaints
let subjectiveComplaints;
// Data array for the subjective complaints longitudinal data
let longitudinalSubjectiveComplaints;
// jQuery function for waiting until the page is ready
$(document).ready(function() {
  // Adjusts the background color of the Window Difference cell
  dynamicallyAdjustWindowDifferenceBackgroundColor();
  // Removes the info tables for the data entry page
  adjustDefaultDisplayElementsForDataEntry();
  // Add listeners for conditional questions
  addConditionalListeners();
  // Add listeners for select elements
  addSelectInputListeners();
  // Add listeners for the buttons
  addButtonListeners();
  // Add tooltips
  addTooltips();
  // Initialize the radio buttons
  $('input[type="radio"]:checked').trigger('change');
  // Initialize the session buttons
  $('label.sessionButton > input[type=checkbox]').trigger('change');
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
  if ($('#data-entry-table3').length) {
    // Detach the current lorisworkspace div
    let currentSpace = $('#lorisworkspace').detach();
    // Remove the two information tables from their div and append the
    // saved structure to the proper element
    $('div.inset > div:nth-child(2)').empty().append(currentSpace);
  }
}

/**
 * Function which adds listeners for conditional fields in the data entry
 * page.
 */
function addConditionalListeners() {
  // Initialize a set for the question names
  let questions = new Set();
  // For every radio button of a conditional question
  $('input[type="radio"][conditional-on]').each(function(index, element) {
    let linkedFieldName = $(element).prop('name');
    // If the question has yet to be examined
    if (questions.has(linkedFieldName) === false) {
      // Get the node of the field the conditional question is dependent on
      let primaryField = 'question' + $(element).attr('conditional-on');
      // Get the values for which the primary field triggers the conditional one
      let conditionalTriggers = $(element).attr('conditional-triggers').split(',');
      // Add listener for each radio button of a primary field
      $(`input[type="radio"][name="${primaryField}"]`).on(
        'change',
        {triggers: conditionalTriggers, linkedField: linkedFieldName},
        function(e) {
        // Check if the field value is part of the triggers to determine activation
        let activateLinkedField = e.data.triggers.includes($(e.target).val());
        // For all buttons which aren't optional for the conditional field,
        // set required dependent on activation and administration value
        $(`input:not([optional])[type="radio"][name="${e.data.linkedField}"]`)
          .prop(
            'required',
            activateLinkedField && $('input[name="Administration"]')
              .val() === 'All');
        // Set the disabled value opposed to the required value
        $(`input[type="radio"][name="${e.data.linkedField}"]`)
          .prop(
            'disabled',
            $('input[type="hidden"][name="Frozen"]')
              .val() === '1' ?
              true :
              !activateLinkedField);
        // If the field is activated
        if (activateLinkedField) {
          // Remove conditional class from the container div
          $(`input[type="radio"][name="${e.data.linkedField}"]`)
            .parent().parent().parent().removeClass('conditional');
          // If the field is deactivated
        } else {
          // Remove the checked information and add the conditional class to the
          // container div
          $(`input[type="radio"][name="${e.data.linkedField}"]`)
            .prop('checked', false);
          $(`input[type="radio"][name="${e.data.linkedField}"]`)
            .parent().parent().parent().addClass('conditional');
        }
      });
      // Add the question name to the set
      questions.add(linkedFieldName);
    }
  }).bind(questions);
}

/**
 * Function to add listeners for the select elements of
 * the data entry page which set instrument-wide values.
 */
function addSelectInputListeners() {
  // Add the listeners for the test settings of the data entry page
  addTestSettingsListeners();
  // Add listener for the selector of subjective complaints on
  // the top page
  addSubjectiveComplaintsSelectListener();
}

/**
 * Function which adds listeners to the test setting select
 * elements of the data entry page.
 */
function addTestSettingsListeners() {
  // For the select control with the test-settings class
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
      'ecog/Data_Entry/?' +
      'Test_Language=' + testLanguage +
      '&Test_Version=' + testVersion +
      '&commentID=' + commentID;
  });
}

/**
 * Function which adds a listener to the select element
 * that controls which subjective complaints is graphed on the
 * top page.
 */
function addSubjectiveComplaintsSelectListener() {
  // For the select control of the subjective complaints chart
  $('#subjectiveComplaintsSelect').on('change', function(e) {
    updateResultsChart(e);
  });
}

/**
 * Function which adds the listeners for the various buttons of the instrument
 */
function addButtonListeners() {
  // Add reset button listener on the data entry page
  addResetButtonListener();
  // Add submit button listener on the data entry page
  addSubmitButtonListener();
  // Add session button listeners for the top page
  addSessionButtonListeners();
}

/**
 * Add listener to the reset button of the data entry page which overloads
 * the default behaviour with a reset to actual default values instead
 * of using the values first displayed
 */
function addResetButtonListener() {
  // For clicks on the reset button
  $('#reset_button').on('click', function(e) {
    // Prevent default behavior
    e.preventDefault();
    // Set instrument embargo and method to default values
    $('#Embargo').val('Internal');
    $('#Method').val('1');
    // Empty the comments
    $('#Comments').val('');
    // Empty the radios
    $('input[type=radio]').each(function(index, element) {
      $(element).prop('checked', false);
    });
    // Empty the text boxes of calculated scores
    $('input[type=text]').each(function(index, element) {
      $(element).val('');
    });
    // Initialize a set for the question names
    let questions = new Set();
    // For each radio button of a conditional question
    $('input[type="radio"][conditional-on]').each(function(index, element) {
      let linkedFieldName = $(element).prop('name');
      // If the question has yet to be treated
      if (questions.has(linkedFieldName) === false) {
        // Get all buttons of the question
        let linkedFieldNodes = $(`input[type="radio"][name="${linkedFieldName}"]`);
        // Set the buttons to not required and disabled
        linkedFieldNodes.prop('required', false);
        linkedFieldNodes.prop('disabled', true);
        // Add the conditional class to the container div
        linkedFieldNodes.parent().parent().parent().addClass('conditional');
        // Add the question name to the set
        questions.add(linkedFieldName);
      }
    }).bind(questions);
  });
}

/**
 * Function which adds a listener to the submit button of the data entry page
 * which adds a content validation check on the value of the comments.
 */
function addSubmitButtonListener() {
  $('#fire_control').on('submit click', function(e) {
    // For all textareas
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
            `The Comments field uses unsupported characters:` + matches);
          // Break out of the each() loop using a false return
          return false;
        }
      }
    });
  });
}

/**
 * Function which adds listeners to the session buttons of the top page to
 * enable manipulation of the results tables and charts.
 */
function addSessionButtonListeners() {
  // For every checkbox type input with a sessionButton label
  $('label.sessionButton > input[type=checkbox]').on('change', function(e) {
    // If selected
    if ($(e.target).prop('checked')) {
      // Remove the hidden class from the matching row in the results table
      $(`#${$(e.target).prop('id').slice(0, -6)}row`).removeClass('hiddenRow');
      // If deselected
    } else {
      // Hide the matching row from the results table
      $(`#${$(e.target).prop('id').slice(0, -6)}row`).addClass('hiddenRow');
    }
    // Update the chart to match the currently shown results
    updateResultsChart(e);
  });
}

/**
 * Function which crafts an HTML string to be used as a bootstrap tooltip for
 * each session button based on information stored in the session button's
 * attributes.
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
  // Calculate the color of the flag based on value
  let flagStatus1Color = flagStatus1 === 'Complete' ? 'good-value' : flagStatus1 === 'Incomplete' ? 'bad-value' : 'emphasis';
  // Get the completion of the instrument for both entries
  let instrumentStatus1 = $(e).attr('data_Completion');
  // Calculate the color of the completion based on value
  let instrumentStatus1Color = instrumentStatus1 === 'Complete' ? 'good-value' : 'bad-value';
  // Get the administration value for both entries
  let administration1 = $(e).attr('data_Administration');
  // Calculate the color of the administration based on value
  let administration1Color = administration1 === 'All' ? 'good-value' : administration1 === 'Partial' ? 'bad-value' : 'emphasis';
  // Append a short table with all the calculated values and colors
  HTMLString += `<table>
      <thead>
          <th></th>
          <th class="text-center bold">#1</th>
      </thead>
      <tbody>
          <tr class="text-center">
              <td>Administration</td>
              <td><span class="${administration1Color}">${administration1 === undefined || administration1 === '' ? 'Empty' : administration1}</span></td>
          </tr>
          <tr class="text-center">
              <td>Flag</td>
              <td><span class="${flagStatus1Color}">${flagStatus1 === undefined || flagStatus1 === '' ? 'Empty' : flagStatus1}</span></td>
          </tr>
          <tr class="text-center">
              <td>Instrument</td>
              <td><span class="${instrumentStatus1Color}">${instrumentStatus1}</span></td>
          </tr>
      </tbody>
  </table>`;
  // Remove the attributes used as data sources
  $(e).removeAttr('data_level data_Visit_label data_visit data_Date_visit data_Data_entry data_Completion data_Administration ');
  // Add a bootstrap tooltip using the generated string to the node
  addBootstrapTooltip($(e).prop('id'), HTMLString);
}

/**
 * Function which initializes the charts for the longitudinal results
 */
function initializeChartResultsChart() {
  // If on the top page (absence of the data entry table)
  if ($('#data-entry-table1').length === 0) {
    // Build the data object for scores and complaints
    let data = buildChartDataObject();
    // Construct the scores' chart
    displayChartedResults(data);
    // Construct the subjective complaints' bar chart
    displayBarResults(data);
  }
}

/**
 * Function which builds the data array to be used when constructing the chart
 * objects.
 * @return {Object}    Data which needs to be added to the chart object
 */
function buildChartDataObject() {
    // Initializing the data object
    let data = {'scores': [], 'complaints': []};
    // Initialize the array for the scores columns
    data.scores = [
      ['x'],
      ['Memory Score'],
      ['Language Score'],
      ['VisuoSpatial Score'],
      ['Planning Score'],
      ['Organization Score'],
      ['Divided Attention Score'],
      ['Total Score']
    ];
    // For all rows of the results table which are not hidden
    $('#longitudinal-results-table > tbody > tr:not(.hiddenRow)').each(function(index, element) {
      // Take the visit label from the first cell of the row
      let visitLabel = (($('td:nth-child(1) > a', element).html())
        .replace('<br><span class="font-xsmall">', ' (')).replace('</span>', ')');
      let memory = parseResultsCell(5, element);
      let language = parseResultsCell(6, element);
      let visuospatial = parseResultsCell(7, element);
      let planning = parseResultsCell(8, element);
      let organization = parseResultsCell(9, element);
      let dividedAttention = parseResultsCell(10, element);
      let total = parseResultsCell(11, element);
      // If any of the value computed are not null
      if (
        [memory,
          language,
          visuospatial,
          planning,
          organization,
          dividedAttention,
          total].filter(value => value !== null).length >= 1) {
        // Add label and values to array
        // Note: adding null in the sequence of values will represent the empty
        // value correctly for C3 instead of offsetting the sequence
        data.scores[0].push(visitLabel);
        data.scores[1].push(memory);
        data.scores[2].push(language);
        data.scores[3].push(visuospatial);
        data.scores[4].push(planning);
        data.scores[5].push(organization);
        data.scores[6].push(dividedAttention);
        data.scores[7].push(total);
      }
    });
    // Get the value of the select element
    let questionID = $('#subjectiveComplaintsSelect').val();
    // if no subjective complaints exist (no longitudinal data)
    if (questionID === null || questionID === '' || questionID === undefined) {
      // Initialize array to empty state
      data.complaints = [
        ['x']
      ];
      // If there is longitudinal data
    }else{
      // Initialize array
      data.complaints = [
        ['x'],
        [subjectiveComplaints[questionID].QuestionText.en]
      ];
      // Given the questionID, for every visit
      Object
        .keys(longitudinalSubjectiveComplaints[questionID])
        .forEach(function(visitLabel) {
        // If the answers is not null
        if(longitudinalSubjectiveComplaints[questionID][visitLabel].Answer !== null){
          // Push the visit label and the answer
          data.complaints[0]
            .push(visitLabel + ' (' + longitudinalSubjectiveComplaints[questionID][visitLabel].Date_Visit + ')');
          data.complaints[1]
            .push(longitudinalSubjectiveComplaints[questionID][visitLabel].Answer);
        }
      });
    }
    // Return the array
    return data;
}

/**
 * Function which parses the content of a results cell to extract the mean.
 * @param {int} position    Position of the cell in the results table
 * @param {jQuery} element  jQuery node of the row to use as context
 * @returns {?float} value of the cell
 */
function parseResultsCell(position, element) {
  // Get the HTML of the cell specified
  let result = $(`td:nth-child(${position})`, element).html();
  // If the cell is empty, doesn't exist or there's an error
  if (result === undefined || result === null || result === '') {
    return null;
    // If the cell has content
  } else {
    // Match to parse the average
    let matches = result.match(/(?<average>\d\.\d{2})(?<whitespace>\s*)(?<items>\(\d{1,2}\))/);
    // If there are no matches
    if(matches === null) {
      return null;
      // If there are matches
    } else {
      // If the labeled group average has data
      if(matches.groups.average !== undefined) {
        // If that data can't be parsed as a float
        return isNaN(parseFloat(matches.groups.average)) ?
          // Return null
          null :
          // return the parsed data as a float with a 2 precision
          parseFloat(matches.groups.average).toFixed(2);
      // if the labeled group average doesn't have data
      } else {
        return null;
      }
    }
  }
}

/**
 * Function which displays the results calculated in the data array as a
 * C3 chart.
 * @param {Object}  data   Data object for both the ecog scores
 *                                and the subjective questions
 */
function displayChartedResults(data) {
    eCogChart = c3.generate({
      bindto: '#resultsChart',
      data: {
        types: {
          'Memory Score': 'line',
          'Language Score': 'line',
          'VisuoSpatial Score': 'line',
          'Planning Score': 'line',
          'Organization Score': 'line',
          'Divided Attention Score': 'line',
          'Total Score': 'line'
        },
        empty: {
          label: {
            text: 'No Displayable Data Selected'
          }
        },
        x: 'x',
        columns: data.scores,
        axes: {
          'Memory Score': 'y',
          'Language Score': 'y',
          'VisuoSpatial Score': 'y',
          'Planning Score': 'y',
          'Organization Score': 'y',
          'Divided Attention Score': 'y',
          'Total Score': 'y'
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
            text: 'Average',
            position: 'outer-middle'
          },
          tick: {
            format: function(d) {
              return d.toFixed(2);
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
 * Function which displays the bar chart of the currently
 * selected subjective question.
 * @param {Object} data  Data object for both the ecog scores
 *                              and the subjective questions
 */
function displayBarResults(data) {
  // Get the value of the selector for the subjective complaint
  let questionID = $('#subjectiveComplaintsSelect').val();
  // C3 initializes the axes even without data, which, given that
  // they're dynamic here for the y axis, there's a need for fallback values
  // when no data is defined
  let yLabel, yMax, yTickCount, yTickValues, yFormatter;
  // If there's no data, set fallback values
  if(data.complaints.length === 1){
    yLabel = 'None';
    yMax = 2;
    yTickCount = 2;
    yTickValues = [1,2];
    yFormatter = function(d){ return d;};
    // If there's data, set to dynamic values
  }else{
    yLabel = subjectiveComplaints[questionID].QuestionText.en;
    yMax = Object.keys(subjectiveComplaints[questionID].Options.en).length;
    yTickCount = Object.keys(subjectiveComplaints[questionID].Options.en).length;
    yTickValues = Object.keys(subjectiveComplaints[questionID].Options.en);
    yFormatter = function (d) {
      return subjectiveComplaints[questionID].Options.en[d];
    };
  }
  // Generate chart
  subjectiveChart = c3.generate({
    bindto: '#resultsHistogram',
    size: {
      height: 320
    },
    data: {
      type: 'bar',
      empty: {
        label: {
          text: 'No Displayable Data Selected'
        }
      },
      columns: data.complaints,
      x: 'x',
      axes: {
        [yLabel]: 'y'
      }
    },
    bar: {
      width: {
        ratio: 0.4
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
        min: 1,
        max: yMax,
        tick: {
          count: yTickCount,
          values: yTickValues,
          format: yFormatter
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
 * Function which updates the chart with the currently displayed results from
 * the results table.
 *
 * @param {Event}  e   jQuery event object of the element that triggered the update
 *
 */
function updateResultsChart(e) {
  // Get the type of the event's target element
  let type = $(e.target)[0].tagName;
  // If triggered by a session button, update scores
  if(type === 'INPUT') {
    // Build the data object
    let data = buildChartDataObject();
    // If the chart exists
    if (eCogChart !== undefined) {
      // Unload the chart's values
      // Note: async issues if done is not used
      eCogChart.unload({
        // When done
        done: function() {
          // If there's at least 1 point to display
          if (data.scores[0].length > 1) {
            // Load the data into the chart
            eCogChart.load({
              columns: data.scores
            });
          }
        }
      });
    }
    // If triggered by the select control, update subjective complaints
  } else if (type === 'SELECT') {
    // Build the data object
    let data = buildChartDataObject();
    // If the chart exists
    if (subjectiveChart !== undefined) {
      // New axes per question makes unload impossible due to lack of
      // implementation in the API functionality regarding either loading axes
      // information or manually setting axes properties more complex than
      // min/max, needs to reset object from scratch
      subjectiveChart = subjectiveChart.destroy();
      // Display bar chart
      displayBarResults(data);
    }
  }
}

/**
 * Function which builds the tooltips for the session buttons of the top page.
 */
function addTooltips() {
  // For all session buttons when on top page
  $('label.sessionButton').each(function(index, element) {
    // Make the button tooltip
    makeSessionButtonTooltip(element);
  });
}

/**
 * Function which generates Bootstrap tooltips based on specified elements.
 * @param {string} id         Identifier of the element to which the tooltip
 *                            must be added
 * @param {string} text       HTML string of the body of the tooltip
 * @param {string} placement  position of the tooltip
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
    text: message
  });
}
