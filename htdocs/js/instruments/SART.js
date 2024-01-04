/**
 * Helper script for the two pages of the SART instrument.
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
  // Adds an event handler to update the calculated fields when entering data
  textFieldsEventHandler();
  // Add event handler for the button to redirect to the Media module for
  // File Uploads
  addMediaUploadButtonEventHandler();
  // Add event handler for the reset button
  addResetButtonEventHandler();
  // Add event handler for the Extraction button
  addExtractionButtonEventHandler();
  // Add tooltips for the various elements
  addTooltips();
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
 * Function which toggles the 'required' property for text fields to force
 * the validation on any text field that has a non-empty value.
 */
function textFieldsEventHandler() {
  // Event handler on changes to the input text fields
  $('tr.calculated-field-row > td > input[type=text]').on('input', function(e) {
    // Get handle on the row with the calculated field
    let eventRowChildren = $(e.target).parent().parent().children();
    // Get handle on the calculated field
    let calculatedField = $(eventRowChildren[3]).children()[0];
    // Parse the first field to int
    let first = parseInt($($(eventRowChildren[1]).children()[0]).val(), 10);
    // Parse the second field to int
    let second = parseInt($($(eventRowChildren[2]).children()[0]).val(), 10);
    // Set the calculated field to N/A if either of the two first field are
    // empty or if the sum of the two is larger than a 3-digits number. If not,
    // set the calculated field value to the sum of the two fields
    $(calculatedField).val(first + second > 999 || isNaN(first) || isNaN(second) ? 'N/A' : first + second);
  });
}
/**
 * Function which add an event handler for clicks on the Media upload
 * button. This handler redirects to the Media module with all currently
 * working pre-populated data.
 */
function addMediaUploadButtonEventHandler() {
  $('#uploadLink').on('click', function() {
    // Get the Session and Candidate value from the hidden fields
    let PSCID = $('#PSCID').val();
    let visitLabel = $('#visit_label').val();
    // Encode the instrument name to account for spaces
    let instrumentName = encodeURI($('#test_name').val());
    // Redirect to the Media module with the visit, PSCID, instrument
    // and page (#upload) already selected
    window.location.href = '/media/?' +
      'pSCID=' + PSCID +
      '&visitLabel=' + visitLabel +
      '&instrument=' + instrumentName +
      '#upload';
  });
}
/**
 * Event handler for the Reset button which blanks all input fields from
 * the form.
 */
function addResetButtonEventHandler() {
  // Using a specific handler is required since, if the page
  // is loaded with existing data, the built-in reset control
  // will try to restore the initial data instead of blanking
  // the inputs
  $('#reset_button').on('click', function(e) {
    e.preventDefault();
    if ($('#administration').val() !== 'None') {
      $('#good_number_not_pressed').val('');
      $('#good_number_pressed').val('');
      $('#good_numbers').val('');
      $('#bad_number_pressed').val('');
      $('#bad_number_not_pressed').val('');
      $('#bad_numbers').val('');
      $('#valid_press_mean_RT').val('');
      $('#valid_press_RT_SD').val('');
      $('#pre_invalid_press_mean_consecutive_valid_press_RT').val('');
      $('#pre_invalid_press_consecutive_valid_press_RT_SD').val('');
      $('#pre_invalid_press_consecutive_valid_presses').val('');
      $('#post_invalid_press_mean_consecutive_valid_press_RT').val('');
      $('#post_invalid_press_consecutive_valid_press_RT_SD').val('');
      $('#post_invalid_press_consecutive_valid_presses').val('');
    }
    $('#comments').val('');
    $('#embargo').val('Restricted');
  });
}
/**
 * Function which adds an event handler to the extractor button
 * to launch the extraction of data from an uploaded TSV file
 * linked to the form.
 */
function addExtractionButtonEventHandler() {
  $('#extractor').on('click', function() {
    // If the cell with the link to the tsv file has a blank link or no link
    if ($('#tsv-cell > span > a:first-child').prop('href') === undefined) {
      // Prompt an error warning that the TSV file is missing
      fancyErrorPrompt('Missing TSV File', 'You haven\'t selected a TSV file.');
      // If the cell with the link to the tsv file has multiple items, in case
      // of duplicate uploads
    } else if ($('#tsv-cell > span > a').length > 2) {
      // Prompt an error that multiple tsv files were uploaded
      fancyErrorPrompt('Duplicate TSV File', 'You have uploaded multiple TSV files. There should only be one.');
      // If the link to the tsv file exists and there is only one file uploaded
    } else {
      // Get the URI of the TSV file
      let tsvFileLink = $('#tsv-cell > span > a:first-child').prop('href');
      // Use the link and PapaParse to parse the TSV file to an array
      Papa.parse(tsvFileLink, {
        download: true,
        complete: function(results, file) {
          // Strip the address from the URI to get the filename of the file
          let filename = file.match(/.+File=(.+)$/)[1];
          // Get handle on the headers values from the TSV file
          let headers = results.data[0];
          //
          // The SART experiment is static for both the number of columns
          // and the length of the file if the full experiment was completed
          // The magic numbers 237 is the static number of lines and the
          // columns from the header line are the calculated values at the end
          // of the experiment
          //
          // If the experiment was incomplete
          if (results.data.length !== 237 ||
            headers.indexOf('strTrue') === -1 ||
            headers.indexOf('strFalse') === -1 ||
            headers.indexOf('strTrueRT') === -1 ||
            headers.indexOf('strPre') === -1 ||
            headers.indexOf('strPost') === -1
          ) {
            fancyErrorPrompt('Incomplete or Reconstructed File',
              'The file ' + filename + ' is a partial or reconstructed ' +
              'file. It doesn\'t include the descriptive statistics wanted by ' +
              'this form. Please use the Excel file to calculate the ' +
              'statistics or use the values noted on the paper copy of the ' +
              'test.');
          } else {
            // Get handle on the first row of experimental data after the trial
            // runs
            let dataRow = 11;
            // Parse the descriptive statistics calculated at the end of the
            // experiment and added to the EDAT file as global variables
            let strTrue = headers.indexOf('strTrue');
            let strFalse = headers.indexOf('strFalse');
            let strTrueRT = headers.indexOf('strTrueRT');
            let strPre = headers.indexOf('strPre');
            let strPost = headers.indexOf('strPost');

            // Split the good and bad numbers statistics on slashes and unpack
            // into matching variables
            let [goodNumberNotPressed,
                  goodNumberPressed,
                  goodNumbers] = results.data[dataRow][strTrue].split('/');
            let [badNumberPressed,
                  badNumberNotPressed,
                  badNumbers] = results.data[dataRow][strFalse].split('/');

            // Split the aggregate statistics on good presses on slashes and
            // unpack into matching variables
            let [validPressMeanRT,
                  validPressRTSD] = results.data[dataRow][strTrueRT].split('/');

            // Split the pre and post error valid presses statistics on slashes
            // and unpack into matching variables
            let [preInvalidPressMeanConsecutiveValidPressRT,
                  preInvalidPressConsecutiveValidPressRTSD,
                  preInvalidPressConsecutiveValidPresses] = results.data[dataRow][strPre].split('/');
            let [postInvalidPressMeanConsecutiveValidPressRT,
                  postInvalidPressConsecutiveValidPressRTSD,
                  postInvalidPressConsecutiveValidPresses] = results.data[dataRow][strPost].split('/');

            // Use the SweetAlert equivalent of the confirm prompt to display
            // the extracted values as a table matching the visual aspect of
            // the form
            // Note1: the way to call such a function as changed in later
            // versions of SweetAlert
            // Note2: the {$varname} syntax might look like smarty but is,
            // in this case, due to variable substitution on a multi-line
            // string
            swal({
              title: 'Extracted Values',
              type: 'info',
              showCancelButton: true,
              showConfirmButton: true,
              cancelButtonText: 'Cancel',
              confirmButtonText: 'Transcribe Values',
              html: true,
              text: `
                      <p>I'm getting the following values from the TSV file:</p>
                      <br/>
                      <table class="table table-bordered extracted-data-table">
                        <thead>
                            <tr>
                              <th class="no-top-border no-left-border"></th>
                              <th class="info">Error</th>
                              <th class="info">OK</th>
                              <th class="info">n</th>
                            </tr>
                        </thead>
                        <tbody>
                          <tr>
                              <th class="info">Correct Press</th>
                              <td>${goodNumberNotPressed}</td>
                              <td>${goodNumberPressed}</td>
                              <td>${goodNumbers}</td>
                          </tr>
                          <tr>
                              <th class="info">Bad Press</th>
                              <td>${badNumberPressed}</td>
                              <td>${badNumberNotPressed}</td>
                              <td>${badNumbers}</td>
                          </tr>
                        </tbody>
                      </table>
                      <br/>
                      <table class="table table-bordered extracted-data-table">
                        <thead>
                          <tr>
                              <th class="no-top-border no-left-border"></th>
                              <th class="info">Mean</th>
                              <th class="info">Standard Deviation</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                              <th class="info">Correct Press Reaction Time</th>
                              <td>${validPressMeanRT}</td>
                              <td>${validPressRTSD}</td>
                          </tr>
                        </tbody>
                      </table>
                      <br/>
                      <table class="table table-bordered extracted-data-table">
                        <thead>
                          <tr>
                              <th class="no-top-border no-left-border"></th>
                              <th class="info">Mean</th>
                              <th class="info">Standard Deviation</th>
                              <th class="info">n</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                              <th class="info">Pre-False Press Reaction Time</th>
                              <td>${preInvalidPressMeanConsecutiveValidPressRT}</td>
                              <td>${preInvalidPressConsecutiveValidPressRTSD}</td>
                              <td>${preInvalidPressConsecutiveValidPresses}</td>
                          </tr>
                          <tr>
                              <th class="info">Post-False Press Reaction Time</th>
                              <td>${postInvalidPressMeanConsecutiveValidPressRT}</td>
                              <td>${postInvalidPressConsecutiveValidPressRTSD}</td>
                              <td>${postInvalidPressConsecutiveValidPresses}</td>
                          </tr>
                        </tbody>
                      </table>
`
            }, function() {
              // If the user confirmed the prompt, set the values extracted
              // to matching the matching inputs
              $('#good_number_not_pressed').val(goodNumberNotPressed);
              $('#good_number_pressed').val(goodNumberPressed);
              $('#good_numbers').val(goodNumbers);
              $('#bad_number_pressed').val(badNumberPressed);
              $('#bad_number_not_pressed').val(badNumberNotPressed);
              $('#bad_numbers').val(badNumbers);
              $('#valid_press_mean_RT').val(validPressMeanRT);
              $('#valid_press_RT_SD').val(validPressRTSD);
              $('#pre_invalid_press_mean_consecutive_valid_press_RT').val(preInvalidPressMeanConsecutiveValidPressRT);
              $('#pre_invalid_press_consecutive_valid_press_RT_SD').val(preInvalidPressConsecutiveValidPressRTSD);
              $('#pre_invalid_press_consecutive_valid_presses').val(preInvalidPressConsecutiveValidPresses);
              $('#post_invalid_press_mean_consecutive_valid_press_RT').val(postInvalidPressMeanConsecutiveValidPressRT);
              $('#post_invalid_press_consecutive_valid_press_RT_SD').val(postInvalidPressConsecutiveValidPressRTSD);
              $('#post_invalid_press_consecutive_valid_presses').val(postInvalidPressConsecutiveValidPresses);
            });
          }
        },
        // If the parsing produced an error
        error: function(error, file) {
          // Produce a prompt warning the user to enter the data manually due
          // to an error with the TSV file
          fancyErrorPrompt('Error while parsing the TSV file',
            'There was an error reading the ' + file.name + '. Please enter the data manually.');
        }
      });
    }
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
/**
 * Function which defines and add the tooltips for all elements on the page.
 */
function addTooltips() {
  //
  // Adding the tooltips for the embargo select
  //
  addBootstrapTooltip(
    'embargo_label',
    '<p><span class="bold">Restricted:</span> For exclusive use of the original laboratory.</p><p><span class="bold">Internal:</span> Can be shared within the research group.</p><p><span class="bold">Open:</span> Can be shared outside the research group.</p>');
  //
  // Adding the tooltips for the first table
  //
  addBootstrapTooltip(
    'good-numbers-row',
    '<p>Every number except 3.</p>');
  addBootstrapTooltip(
    'bad-numbers-row',
    '<p>The number 3.</p>');
  addBootstrapTooltip(
    'error-column',
    '<p><span class="bold">Good Number:</span> not pressed</p><p><span class="bold">Bad Number:</span> pressed</p>');
  addBootstrapTooltip(
    'ok-column',
    '<p><span class="bold">Good Number:</span> pressed</p><p><span class="bold">Bad Number:</span> not pressed</p>');
  addBootstrapTooltip(
    'n-column',
    '<p>Total number of each</p>');
  //
  // Adding the tooltips for the middle table
  //
  addBootstrapTooltip(
    'mean-correct-press',
    '<p>Average Reaction Time (ms)</p>');
  addBootstrapTooltip(
    'sd-correct-press',
    '<p>Standard Deviation of the Reaction Times (ms)</p>');
  addBootstrapTooltip(
    'correct-press-row',
    '<p>Descriptive Statistics for Correct Presses Reaction Times</p>');
  //
  // Adding the tooltips for the last table
  //
  addBootstrapTooltip(
    'mean-errors',
    '<p>Average reaction times for consecutive correct presses around each error (ms)</p>');
  addBootstrapTooltip(
    'sd-errors',
    '<p>Standard deviation on reaction times for consecutive correct presses around each error (ms)</p>');
  addBootstrapTooltip(
    'n-errors',
    '<p>Total number of consecutive correct presses around each error</p>');
  addBootstrapTooltip(
    'pre-row',
    '<p>Cumulative consecutive correct presses, up to 4 per error, preceding an error for all errors</p>');
  addBootstrapTooltip(
    'post-row',
    '<p>Cumulative consecutive correct presses, up to 4 per error, following an error for all errors</p>');
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
