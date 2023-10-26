/**
 * Helper script for the two pages of the AXCPT instrument.
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
    // If the administration is none, those fields won't be generated
    // so resetting non-existing fields would lead to errors
    if ($('#administration').val() !== 'None') {
      $('#No_Press_On_Correct_Image').val('');
      $('#Press_On_Correct_Image').val('');
      $('#Correct_Images').val('');
      $('#Press_On_Incorrect_Image').val('');
      $('#No_Press_On_Incorrect_Image').val('');
      $('#Incorrect_Images').val('');
      $('#Mean_RT_Press_On_Correct_Image').val('');
      $('#SD_RT_Press_On_Correct_Image').val('');
      $('#Mean_RT_Press_On_Incorrect_Image').val('');
      $('#SD_RT_Press_On_Incorrect_Image').val('');
      $('#Premature_Presses').val('');
    }
    // Those fields will exist regardless of the administration status
    // and thus will always need to be reset
    $('#comments').val('');
    $('#Embargo').val('Restricted');
    $('#Program_Version').val(0.9);
    $('#Stimulus_Version').val(1);
  });
}
/**
 * Function which adds an event handler to the extractor button
 * to launch the extraction of data from an uploaded CSV file
 * linked to the form.
 */
function addExtractionButtonEventHandler() {
  $('#extractor').on('click', function() {
    // If the cell with the link to the csv file has a blank link or no link
    if ($('#experiment-file-cell > span > a:first-child').prop('href') === undefined) {
      // Prompt an error warning that the CSV file is missing
      fancyErrorPrompt('Missing CSV Experiment File', 'You haven\'t selected a CSV Experiment file.');
      // If the cell with the link to the CSV file has multiple items, in case
      // of duplicate uploads
    } else if ($('#experiment-file-cell> span > a').length > 2) {
      // Prompt an error that multiple CSV files were uploaded
      fancyErrorPrompt('Duplicate CSV Experiment files', 'You have uploaded multiple CSV Experiment files. There should only be one.');
      // If the link to the CSV file exists and there is only one file uploaded
    } else {
      // Get the URI of the CSV file
      let csvFileLink = $('#experiment-file-cell > span > a:first-child').prop('href');
      // Use the link and PapaParse to parse the CSV file to an array
      Papa.parse(csvFileLink, {
        download: true,
        complete: function(results, file) {
          // Strip the address from the URI to get the filename of the file
          let filename = file.match(/.+File=(.+)$/)[1];
          //
          // The AXCPT experiment has a variable number of lines of data based
          // on the performance of the task. As such, all the lines must be
          // processed for the descriptive statistics of those lines to be
          // calculated. The disqualifying state would be an experiment file
          // with only training data.
          //
          // Extracting the headers of the CSV file
          let headers = results.data.shift();
          // Using a set to avoid duplicates and faster access
          let validImages = new Set();
          // Data object that matches population and RT for all outcome scenarios
          // in the CSV file
          let data = {
            PressOnValidImage: {
              n: 0,
              RT: []
            },
            NoPressOnValidImage: {
              n: 0
            },
            PressOnInvalidImage: {
              n: 0,
              RT: []
            },
            NoPressOnInvalidImage: {
              n: 0
            },
            PrematurePresses: {
              n: 0
            }
          };
          // For each row of the data file
          for (let row of results.data) {
            // If the row has training data
            if (row[headers.indexOf('Stage')] === 'Training') {
              // Skip to the next row
              continue;
              // If the row has trial data
            } else {
              // Switch on the 'Outcome' parameter
              switch (row[headers.indexOf('Outcome')]) {
                // Outcome 1 which matches a press on a valid image
                case '1':
                  // Add image name to the valid images set
                  validImages.add(row[headers.indexOf('Trial Type')]);
                  // If the response time can be parsed as a float
                  if (!isNaN(parseFloat(row[headers.indexOf('Response Latency')]))) {
                    // Increment the number of presses on valid images
                    data.PressOnValidImage.n += 1;
                    // Add the parsed response time to the data object's corresponding
                    // property and array
                    // Note that the response time is multiplied by 1000.0 to both
                    // preserve float operations and scale to ms since the data
                    // file uses seconds for response times
                    data.PressOnValidImage.RT.push(
                      1000.0 * parseFloat(
                        row[headers.indexOf('Response Latency')]
                      )
                    );
                  }
                  // Go to next row
                  break;
                  // Outcome 2 which matches not pressed on valid image
                case '2':
                  // Add image name to the valid images set
                  validImages.add(row[headers.indexOf('Trial Type')]);
                  // Increment population of not pressed on valid image
                  data.NoPressOnValidImage.n += 1;
                  // Go to next row
                  break;
                  // Outcome 3 which is pressed on invalid image
                case '3':
                  // If the response time can be parsed to a float
                  if (!isNaN(parseFloat(row[headers.indexOf('Response Latency')]))) {
                    // Increment the population of press on invalid image
                    data.PressOnInvalidImage.n += 1;
                    // Add the parsed response time to the corresponding property
                    // and array
                    // Note: like the response time for valid presses on valid
                    // images, the response time needs to be scaled to ms since
                    // the data file uses seconds for response times
                    data.PressOnInvalidImage.RT.push(
                      1000.0 * parseFloat(
                        row[headers.indexOf('Response Latency')]
                      )
                    );
                  }
                  // Go to next row
                  break;
                  // Outcome 4 which is no press on invalid image
                case '4':
                  // Increment the population of no press on invalid images
                  data.NoPressOnInvalidImage.n += 1;
                  // Go to next row
                  break;
                  // Outcome 5 which is premature presses
                case '5':
                  // Increment population of premature presses
                  data.PrematurePresses.n += 1;
                  // Go to next row
                  break;
                  // If the outcome is not defined or equal to an unsupported value
                default:
                  // Go to next row
                  break;
              }
            }
          }
          // Calculating the means of valid and invalid presses
          data.PressOnValidImage.mean = data.PressOnValidImage.RT.reduce((accumulator, currentValue) => {
            return accumulator + currentValue;
          }, 0) / data.PressOnValidImage.n;
          data.PressOnInvalidImage.mean = data.PressOnInvalidImage.RT.reduce((accumulator, currentValue) => {
            return accumulator + currentValue;
          }, 0) / data.PressOnInvalidImage.n;
          // Calculating the squared differences between the response times and their respective
          // means
          data.PressOnValidImage.RT = data.PressOnValidImage.RT.map(value => {
            return Math.pow((value - data.PressOnValidImage.mean), 2);
          });
          data.PressOnInvalidImage.RT = data.PressOnInvalidImage.RT.map(value => {
            return Math.pow((value - data.PressOnInvalidImage.mean), 2);
          });
          // Calculating the sums of the squared differences
          data.PressOnValidImage.sum = data.PressOnValidImage.RT.reduce((accumulator, currentValue) => {
            return accumulator + currentValue;
          }, 0);
          data.PressOnInvalidImage.sum = data.PressOnInvalidImage.RT.reduce((accumulator, currentValue) => {
            return accumulator + currentValue;
          }, 0);
          // Calculating the rounded standard deviation for a sample
          data.PressOnValidImage.SD = (data.PressOnValidImage.n - 1) > 0 ? Math.round(Math.sqrt(data.PressOnValidImage.sum / (data.PressOnValidImage.n - 1))) : 0;
          data.PressOnInvalidImage.SD = (data.PressOnInvalidImage.n - 1) > 0 ? Math.round(Math.sqrt(data.PressOnInvalidImage.sum / (data.PressOnInvalidImage.n - 1))) : 0;
          // Calculating the rounded mean
          data.PressOnValidImage.roundedMean = Math.round(data.PressOnValidImage.mean);
          data.PressOnInvalidImage.roundedMean = Math.round(data.PressOnInvalidImage.mean);
          // Determining the Stimulus version based on the correct images set
          if (validImages.has('BW_latticemech1a') || validImages.has('BW_fern3')) {
            data.StimulusVersion = 1;
          } else if (validImages.has('BW_fan3strip3c') || validImages.has('BW_orb4a-a3')) {
            data.StimulusVersion = 2;
          } else {
            data.StimulusVersion = 0;
          }
          //
          // Based on the results
          //
          // If the data doesn't match a supported stimulus version
          if (data.StimulusVersion === 0) {
            fancyErrorPrompt('Unsupported Stimulus Version',
              'The file ' + filename + '\'s data doesn\'t match either ' +
              ' of the currently supported Stimulus Versions. Please verify data ' +
              ' integrity and versions for both the program and the stimuli used.');
          } else if (data.PressOnValidImage.n +
                      data.PressOnInvalidImage.n +
                      data.NoPressOnInvalidImage.n +
                      data.NoPressOnValidImage +
                      data.PrematurePresses.n === 0) {
            fancyErrorPrompt('No trial data',
              'The file ' + filename + '\'s data doesn\'t contain any ' +
              ' usable trial data. Please verify data file.');
          } else {
            // Use the SweetAlert equivalent of the confirm-style prompt to display
            // the extracted values as a table matching the visual aspect of
            // the form
            // Note1: the way to call such a function as changed in later
            // versions of SweetAlert
            // Note2: the {$varname} syntax might look like "smarty" but is,
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
                      <p>I'm getting the following values from the Experiment CSV file:</p>
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
                              <th class="info">Valid Images</th>
                              <td>${data.NoPressOnValidImage.n}</td>
                              <td>${data.PressOnValidImage.n}</td>
                              <td>${data.PressOnValidImage.n + data.NoPressOnValidImage.n}</td>
                          </tr>
                          <tr>
                              <th class="info">Invalid Images</th>
                              <td>${data.PressOnInvalidImage.n}</td>
                              <td>${data.NoPressOnInvalidImage.n}</td>
                              <td>${data.PressOnInvalidImage.n + data.NoPressOnInvalidImage.n}</td>
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
                              <th class="info">Reaction Times with Valid Images</th>
                              <td>${data.PressOnValidImage.roundedMean}</td>
                              <td>${data.PressOnValidImage.SD}</td>
                          </tr>
                          <tr>
                              <th class="info">Reaction Times with Invalid Images</th>
                              <td>${data.PressOnInvalidImage.roundedMean}</td>
                              <td>${data.PressOnInvalidImage.SD}</td>
                          </tr>
                        </tbody>
                      </table>
                      <br/>
                      <table class="table table-bordered extracted-data-table">
                        <thead>
                          <tr>
                              <th class="no-top-border no-left-border"></th>
                              <th class="info">n</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                              <th class="info">Premature Presses</th>
                              <td>${data.PrematurePresses.n}</td>
                          </tr>
                        </tbody>
                      </table>
`
            }, function() {
              // If the user confirmed the prompt, set the values extracted
              // to matching the matching inputs
              // Default values
              $('#Embargo').val('Restricted');
              $('#program_version').val('0.9');
              // Calculated from the image set
              $('#Stimulus_Version').val(data.StimulusVersion);
              // Calculated from the trial data
              $('#No_Press_On_Correct_Image').val(data.NoPressOnValidImage.n);
              $('#Press_On_Correct_Image').val(data.PressOnValidImage.n);
              $('#Correct_Images').val(data.NoPressOnValidImage.n + data.PressOnValidImage.n);
              $('#Press_On_Incorrect_Image').val(data.PressOnInvalidImage.n);
              $('#No_Press_On_Incorrect_Image').val(data.NoPressOnInvalidImage.n);
              $('#Incorrect_Images').val(data.PressOnInvalidImage.n + data.NoPressOnInvalidImage.n);
              $('#Mean_RT_Press_On_Correct_Image').val(data.PressOnValidImage.roundedMean);
              $('#SD_RT_Press_On_Correct_Image').val(data.PressOnValidImage.SD);
              $('#Mean_RT_Press_On_Incorrect_Image').val(data.PressOnInvalidImage.roundedMean);
              $('#SD_RT_Press_On_Incorrect_Image').val(data.PressOnInvalidImage.SD);
              $('#Premature_Presses').val(data.PrematurePresses.n);
            });
          }
        },
        // If the parsing produced an error
        error: function(error, file) {
          // Produce a prompt warning the user to enter the data manually due
          // to an error with the TSV file
          fancyErrorPrompt('Error while parsing the CSV Experiment file',
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
  // Adding the tooltips for the instrument settings
  //
  addBootstrapTooltip(
    'embargo_label',
    '<p><span class="bold">Restricted:</span> For exclusive use of the original laboratory.</p><p><span class="bold">Internal:</span> Can be shared within the research group.</p><p><span class="bold">Open:</span> Can be shared outside the research group.</p>');
  addBootstrapTooltip(
    'program_version_label',
    '<p><span class="bold">0.9</span> Version used in the ChAD 2 and 3 waves.</p>');
  addBootstrapTooltip(
    'stimulus_version_label',
    '<p><span class="bold">1</span> Identified as <span class="emphasis">iCPT2GStim1</span> on the protocol selection page of the program.</p><p><span class="bold">2</span> Identified as <span class="emphasis">iCPT2GStim2</span> on the protocol selection page of the program.</p>');
  //
  // Adding the tooltips for the first table
  //
  addBootstrapTooltip(
    'valid-image-row',
    '<p>Either of the two images designated as valid in the stimuli set or the training image.</p>');
  addBootstrapTooltip(
    'invalid-image-row',
    '<p>Any other image in the stimuli set.</p>');
  addBootstrapTooltip(
    'error-column',
    '<p><span class="bold">Valid Image:</span> not pressed</p><p><span class="bold">Invalid Image:</span> pressed</p>');
  addBootstrapTooltip(
    'ok-column',
    '<p><span class="bold">Valid Image:</span> pressed</p><p><span class="bold">Invalid Image:</span> not pressed</p>');
  addBootstrapTooltip(
    'n-column',
    '<p>Total number of each</p>');
  //
  // Adding the tooltips for the middle table
  //
  addBootstrapTooltip(
    'mean-response-time',
    '<p>Average Reaction Time (ms)</p>');
  addBootstrapTooltip(
    'sd-mean-response-time',
    '<p>Standard Deviation of the Reaction Times (ms)</p>');
  addBootstrapTooltip(
    'correct-images-press-row',
    '<p>Descriptive Statistics for Correct Presses\' Reaction Times</p>');
  addBootstrapTooltip(
    'incorrect-images-press-row',
    '<p>Descriptive Statistics for Incorrect Presses\' Reaction Times</p>');
  //
  // Adding the tooltips for the last table
  //
  addBootstrapTooltip(
    'premature-presses',
    '<p>Total number of premature presses</p>');
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
