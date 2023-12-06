/**
 * Helper script for the two pages of the MST instrument.
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
  // Add event handler for the button to redirect to the Media module for
  // File Uploads
  addMediaUploadButtonEventHandler();
  // Add event handler for the reset button
  addResetButtonEventHandler();
  // Add event handler for the Extraction button
  addExtractionButtonEventHandler();
  // Add event handler for the Calculate button
  addCalculationButtonEventHandler();
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
    let difference = Math.abs(
      parseInt($('#windowDifferenceCell > p').html(), 10)
    );
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
      // Instrument Settings
      $('#version').val('0.96');
      $('#stim_set').val('64');
      $('#list_setting').val('64');
      $('#duration').val('2.000');
      $('#isi').val('0.500');
      $('#set_setting').val('1');
      // Response rates
      $('#Old_given_Target').val('');
      $('#Old_given_Target_raw_rate').val('');
      $('#Old_given_Target_corrected_rate').val('');
      $('#Similar_given_Target').val('');
      $('#Similar_given_Target_raw_rate').val('');
      $('#Similar_given_Target_corrected_rate').val('');
      $('#New_given_Target').val('');
      $('#New_given_Target_raw_rate').val('');
      $('#New_given_Target_corrected_rate').val('');
      $('#Old_given_Lure').val('');
      $('#Old_given_Lure_raw_rate').val('');
      $('#Old_given_Lure_corrected_rate').val('');
      $('#Similar_given_Lure').val('');
      $('#Similar_given_Lure_raw_rate').val('');
      $('#Similar_given_Lure_corrected_rate').val('');
      $('#New_given_Lure').val('');
      $('#New_given_Lure_raw_rate').val('');
      $('#New_given_Lure_corrected_rate').val('');
      $('#Old_given_Foil').val('');
      $('#Old_given_Foil_raw_rate').val('');
      $('#Old_given_Foil_corrected_rate').val('');
      $('#Similar_given_Foil').val('');
      $('#Similar_given_Foil_raw_rate').val('');
      $('#Similar_given_Foil_corrected_rate').val('');
      $('#New_given_Foil').val('');
      $('#New_given_Foil_raw_rate').val('');
      $('#New_given_Foil_corrected_rate').val('');
      // Bin Statistics
      $('#Old_given_Lure1').val('');
      $('#Similar_given_Lure1').val('');
      $('#New_given_Lure1').val('');
      $('#Old_given_Lure2').val('');
      $('#Similar_given_Lure2').val('');
      $('#New_given_Lure2').val('');
      $('#Old_given_Lure3').val('');
      $('#Similar_given_Lure3').val('');
      $('#New_given_Lure3').val('');
      $('#Old_given_Lure4').val('');
      $('#Similar_given_Lure4').val('');
      $('#New_given_Lure4').val('');
      $('#Old_given_Lure5').val('');
      $('#Similar_given_Lure5').val('');
      $('#New_given_Lure5').val('');
      $('#No_response_given_Lure1').val('');
      $('#No_response_given_Lure2').val('');
      $('#No_response_given_Lure3').val('');
      $('#No_response_given_Lure4').val('');
      $('#No_response_given_Lure5').val('');
      // Responses to...
      $('#Total_Response_To_Targets').val('');
      $('#Total_Response_To_Lures').val('');
      $('#Total_Response_To_Foils').val('');
      // Correctness
      $('#Correct_Responses').val('');
      $('#Percent_Correct_raw').val('');
      $('#Percent_Correct_corrected').val('');
      $('#Bias_Metric').val('');
    }
    $('#comments').val('');
    $('#embargo').val('Restricted');
  });
}
/**
 * Function which adds an event handler for the extractor button
 * to launch the extraction of data from an uploaded TXT file
 * linked to the form.
 *
 * Note: the current implementation is designed to work with
 * the TXT output of the C++ implementation of the 0.96 software
 * version. Another implementation will be required if the output
 * changes in further versions.
 */
function addExtractionButtonEventHandler() {
  $('#extractor').on('click', function() {
    // If the cell with the link to the txt file has a blank link or no link
    if ($('#txt-cell > span > a:first-child').prop('href') === undefined) {
      // Prompt an error warning that the TSV file is missing
      fancyErrorPrompt(
        'Missing TXT Log File',
        'You haven\'t selected a TXT log file.');
      // If the cell with the link to the TXT file has multiple items, in case
      // of duplicate uploads
    } else if ($('#txt-cell > span > a').length > 2) {
      // Prompt an error that multiple TXT files were uploaded
      fancyErrorPrompt(
        'Duplicate TXT File',
        'You have uploaded multiple TXT files. ' +
        'There should only be one.');
      // If the link to the TXT file exists and there is only one file uploaded
    } else {
      // Get the URI of the TXT file
      let txtFileLink = $('#txt-cell > span > a:first-child').prop('href');
      // Use the link and jQuery to access the TXT log file (given the numerous
      // errors and inconsistencies in the log's format, a more advanced parser
      // is not useful)
      $.ajax({
        url: txtFileLink,
        type: 'GET',
        success: function(data) {
          // Parse the file to an array, split on the Windows-style newline
          // Note: the proper Windows-Style newline is not always
          // respected in the rest of the file, which is compensated by
          // careful regex. If the log is fixed in further versions,
          // the parsing function could be simplified
          let log = data.split('\r\n');
          // The log file contains a study phase then a test phase, the
          // following gives the index of the constant name of the test phase
          let testPhaseNameIndex = log.indexOf('Test phase');
          // Removing the study phase from the log array
          // The magic number 2 is included to add the version and date lines
          // of the test phase to the new, smaller, array
          log = log.slice(
            testPhaseNameIndex - 2 > 0 ?
              testPhaseNameIndex - 2 :
              0
          );
          // Initializing object to contain extracted values
          let extractedValues = {};
          // Starting a buffer variable
          let buffer;
          // Replacing the comma from the version number with a period and
          // then extracting the version number via RegEx
          buffer = log &&
            log[0] &&
            log[0].replaceAll(',', '.').match(/^.*([0-9]{1,2}\.[0-9]{2})$/) ||
            null;
          // Validating that the regex returned an array and that the first
          // group exists before assigning value
          extractedValues.version = buffer &&
            buffer.length >= 2 &&
            buffer[1] || null;
          // Removing the 4 first elements (version, date, name and id)
          log = log.slice(log && log.length >= 4 ? 4 : 0);
          // Parsing the Set used (C,D,E,F,1,2,3,4,5,6,ScC)
          buffer = log &&
            log[0] &&
            log[0].match(/^Set:\sSet\s(C|D|E|F|1|2|3|4|5|6|ScC)$/) || null;
          // Validating that the regex returned an array and that the first
          // group exists before assigning value
          extractedValues.set = buffer && buffer[1] || null;
          // Removing the next 3 elements (set, internal index, randomization)
          log = log.slice(log && log.length >= 3 ? 3 : 0);
          // Replacing the comma with periods and then parsing Duration
          // and ISI to buffer variable
          buffer = log &&
            log[0] &&
            log[0].replaceAll(',', '.')
              .match(/^.*([0-9]{1,2}\.[0-9]{3}).*([0-9]{1,2}\.[0-9]{3}).+$/i) ||
            null;
          // Assigning parameters to extracted values object
          extractedValues.duration = buffer && buffer[1] || null;
          extractedValues.ISI = buffer && buffer[2] || null;
          // The magic 12 number is to go from the static line used to the start
          // of the summary section
          let summarySectionStartIndex =
            log.indexOf('\nLure Bin Statistics (raw counts)') - 12;
          // Removing the elements preceding the summary section from the log
          // array
          log = log.slice(
            summarySectionStartIndex > 0 ?
              summarySectionStartIndex :
              0
          );
          // Parsing the total correct answers from the log line
          buffer = log && log[0] && log[0].match(/([0-9]{1,3})/) || null;
          // Assigning value to values object
          extractedValues.correctResponses = buffer && buffer[1] || null;
          // Removing the correct response and rates header line
          log.shift();
          // Defining the order of the responses and stimuli in the rates table
          let responses = [
            'old',
            'similar',
            'new',
            'old',
            'similar',
            'new',
            'old',
            'similar',
            'new'
          ];
          let stimuli = [
            'Target',
            'Target',
            'Target',
            'Lure',
            'Lure',
            'Lure',
            'Foil',
            'Foil',
            'Foil'
          ];
          // For each line of the rates table
          for (let i = 0; i < responses.length; i++) {
            // Extract the rates for the response/stimulus combination
            extractRates(extractedValues, log[0], responses[i], stimuli[i]);
            // Shift the extracted item from the log
            log.shift();
          }
          // Removing the next 4 lines (explanation, explanation,
          // bin stat section title, bin stat headers)
          log = log.slice(log && log.length >= 4 ? 4 : 0);
          // Extracting bin stats to buffer by splitting on tabs
          buffer = log && log[0] && log[0].split('\t');
          // Assigning extracted values to the values object
          extractedValues.L1O = buffer && buffer[0] || null;
          extractedValues.L1S = buffer && buffer[1] || null;
          extractedValues.L1N = buffer && buffer[2] || null;
          extractedValues.L2O = buffer && buffer[3] || null;
          extractedValues.L2S = buffer && buffer[4] || null;
          extractedValues.L2N = buffer && buffer[5] || null;
          extractedValues.L3O = buffer && buffer[6] || null;
          extractedValues.L3S = buffer && buffer[7] || null;
          extractedValues.L3N = buffer && buffer[8] || null;
          extractedValues.L4O = buffer && buffer[9] || null;
          extractedValues.L4S = buffer && buffer[10] || null;
          extractedValues.L4N = buffer && buffer[11] || null;
          extractedValues.L5O = buffer && buffer[12] || null;
          extractedValues.L5S = buffer && buffer[13] || null;
          extractedValues.L5N = buffer && buffer[14] || null;
          // Removing the first line and the header for the second
          // line of bin stats
          log = log.slice(log && log.length >= 2 ? 2 : 0);
          // Extracting bin stats to buffer by splitting on tabs
          buffer = log && log[0] && log[0].split('\t');
          // Assigning extracted values to the values object
          extractedValues.L1NR = buffer && buffer[0] || null;
          extractedValues.L2NR = buffer && buffer[1] || null;
          extractedValues.L3NR = buffer && buffer[2] || null;
          extractedValues.L4NR = buffer && buffer[3] || null;
          extractedValues.L5NR = buffer && buffer[4] || null;
          // Removing the second line of bin stats
          log.shift();
          // Parsing number of stimuli per set from line
          buffer = log && log[0] && log[0].match(/([0-9]{1,3})/i) || null;
          // Assigning value to the values object
          extractedValues.nStimPerSet = buffer && buffer[1] || null;
          // Removing stimuli per set line
          log.shift();
          // Parsing responses per set line
          buffer = log &&
            log[0] &&
            log[0]
              .match(/.*\s([0-9]{1,3})\s.*\s([0-9]{1,3})\s.*\s([0-9]{1,3})/) ||
            null;
          // Assigning responses totals to values object
          extractedValues.totalResponsesTarget = buffer && buffer[1] || null;
          extractedValues.totalResponsesLure = buffer && buffer[2] || null;
          extractedValues.totalResponsesFoil = buffer && buffer[3] || null;
          // Removing the responses per set line
          log.shift();
          // Parsing percent correct corrected after replacing comma with
          // periods
          buffer = log &&
            log[0] &&
            log[0].replaceAll(',', '.').match(/([0-9]{1,3}\.[0-9]{2})$/) ||
            null;
          // Assigning percent correct corrected to values object
          extractedValues.percentCorrectCorrected = buffer && buffer[1] || null;
          // Removing the percent correct corrected line
          log.shift();
          // Parsing the percent correct raw from log line
          buffer = log &&
            log[0] &&
            log[0].replaceAll(',', '.').match(/([0-9]{1,3}\.[0-9]{2})$/) ||
            null;
          // Assigning the percent correct raw to values object
          extractedValues.percentCorrectRaw = buffer && buffer[1] || null;
          // Removing the percent correct raw line
          log.shift();
          // Parsing the bias metric from line
          buffer = log &&
            log[0] &&
            log[0].replaceAll(',', '.')
              .match(/(-?[0-9]{1,3}\.[0-9]{2})$/) || null;
          // Assigning bias metric value to values object
          extractedValues.biasMetric = buffer && buffer[1] || null;
          // Initializing empty array for all null properties
          let missingValues = [];
          // Iterate through each property of the extraction object
          // to find the missing ones (null values)
          for (const [key, value] of Object.entries(extractedValues)) {
            if (value === null) {
              missingValues.push(key);
            }
          }
          // If all values were extracted
          if (missingValues.length === 0) {
            // Use the SweetAlert equivalent of the 'confirm' prompt to display
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
              text: `<p>All the expected values were found.</p>
                      <br/>`
            }, function() {
              // If the user confirmed the prompt, set the values extracted
              // to matching the matching inputs
              // Instrument properties
              $('#version').val(extractedValues.version);
              $('#stim_set').val(extractedValues.nStimPerSet);
              $('#duration').val(extractedValues.duration);
              $('#isi').val(extractedValues.ISI);
              $('#set_setting').val(extractedValues.set);
              // Response rates
              $('#Old_given_Target')
                .val(extractedValues.oldTargetN);
              $('#Old_given_Target_raw_rate')
                .val(extractedValues.oldTargetRaw);
              $('#Old_given_Target_corrected_rate')
                .val(extractedValues.oldTargetCorrected);
              $('#Similar_given_Target')
                .val(extractedValues.similarTargetN);
              $('#Similar_given_Target_raw_rate')
                .val(extractedValues.similarTargetRaw);
              $('#Similar_given_Target_corrected_rate')
                .val(extractedValues.similarTargetCorrected);
              $('#New_given_Target')
                .val(extractedValues.newTargetN);
              $('#New_given_Target_raw_rate')
                .val(extractedValues.newTargetRaw);
              $('#New_given_Target_corrected_rate')
                .val(extractedValues.newTargetCorrected);
              $('#Old_given_Lure')
                .val(extractedValues.oldLureN);
              $('#Old_given_Lure_raw_rate')
                .val(extractedValues.oldLureRaw);
              $('#Old_given_Lure_corrected_rate')
                .val(extractedValues.oldLureCorrected);
              $('#Similar_given_Lure')
                .val(extractedValues.similarLureN);
              $('#Similar_given_Lure_raw_rate')
                .val(extractedValues.similarLureRaw);
              $('#Similar_given_Lure_corrected_rate')
                .val(extractedValues.similarLureCorrected);
              $('#New_given_Lure')
                .val(extractedValues.newLureN);
              $('#New_given_Lure_raw_rate')
                .val(extractedValues.newLureRaw);
              $('#New_given_Lure_corrected_rate')
                .val(extractedValues.newLureCorrected);
              $('#Old_given_Foil')
                .val(extractedValues.oldFoilN);
              $('#Old_given_Foil_raw_rate')
                .val(extractedValues.oldFoilRaw);
              $('#Old_given_Foil_corrected_rate')
                .val(extractedValues.oldFoilCorrected);
              $('#Similar_given_Foil')
                .val(extractedValues.similarFoilN);
              $('#Similar_given_Foil_raw_rate')
                .val(extractedValues.similarFoilRaw);
              $('#Similar_given_Foil_corrected_rate')
                .val(extractedValues.similarFoilCorrected);
              $('#New_given_Foil')
                .val(extractedValues.newFoilN);
              $('#New_given_Foil_raw_rate')
                .val(extractedValues.newFoilRaw);
              $('#New_given_Foil_corrected_rate')
                .val(extractedValues.newFoilCorrected);
              // Lure Bin stats
              $('#Old_given_Lure1').val(extractedValues.L1O);
              $('#Similar_given_Lure1').val(extractedValues.L1S);
              $('#New_given_Lure1').val(extractedValues.L1N);
              $('#Old_given_Lure2').val(extractedValues.L2O);
              $('#Similar_given_Lure2').val(extractedValues.L2S);
              $('#New_given_Lure2').val(extractedValues.L2N);
              $('#Old_given_Lure3').val(extractedValues.L3O);
              $('#Similar_given_Lure3').val(extractedValues.L3S);
              $('#New_given_Lure3').val(extractedValues.L3N);
              $('#Old_given_Lure4').val(extractedValues.L4O);
              $('#Similar_given_Lure4').val(extractedValues.L4S);
              $('#New_given_Lure4').val(extractedValues.L4N);
              $('#Old_given_Lure5').val(extractedValues.L5O);
              $('#Similar_given_Lure5').val(extractedValues.L5S);
              $('#New_given_Lure5').val(extractedValues.L5N);
              $('#No_response_given_Lure1').val(extractedValues.L1NR);
              $('#No_response_given_Lure2').val(extractedValues.L2NR);
              $('#No_response_given_Lure3').val(extractedValues.L3NR);
              $('#No_response_given_Lure4').val(extractedValues.L4NR);
              $('#No_response_given_Lure5').val(extractedValues.L5NR);
              // Total responses
              $('#Total_Response_To_Targets')
                .val(extractedValues.totalResponsesTarget);
              $('#Total_Response_To_Lures')
                .val(extractedValues.totalResponsesLure);
              $('#Total_Response_To_Foils')
                .val(extractedValues.totalResponsesFoil);
              // Correctness percentages
              $('#Correct_Responses')
                .val(extractedValues.correctResponses);
              $('#Percent_Correct_raw')
                .val(extractedValues.percentCorrectRaw);
              $('#Percent_Correct_corrected')
                .val(extractedValues.percentCorrectCorrected);
              $('#Bias_Metric')
                .val(extractedValues.biasMetric);
            });
          } else {
            fancyErrorPrompt(
              'Missing Values',
              'The following values are missing: ' + missingValues);
          }
        },
        error: function() {
          fancyErrorPrompt(
            'Can\'t access the log file',
            'The log file is not accessible. Please check with your' +
            ' nearest IT person.');
        }
      });
    }
  });
}
/**
 * Function which adds an event handler to the calculation button
 * to launch the computation of all fields which can be determined given
 * data already entered on the page.
 */
function addCalculationButtonEventHandler() {
  $('#calculator').on('click', function() {
    // Object to hold the computed values
    let cData = {};
    // Object to hold the extracted values
    let eData = {};
    // Extract data
    eData.oldTargetN = $('#Old_given_Target').val() === '' ?
        null :
        parseFloat($('#Old_given_Target').val()
        );
    eData.similarTargetN = $('#Similar_given_Target').val() === '' ?
      null :
      parseFloat($('#Similar_given_Target').val()
      );
    eData.newTargetN = $('#New_given_Target').val() === '' ?
      null :
      parseFloat($('#New_given_Target').val()
      );
    eData.oldLureN = $('#Old_given_Lure').val() === '' ?
      null :
      parseFloat($('#Old_given_Lure').val()
      );
    eData.similarLureN = $('#Similar_given_Lure').val() === '' ?
      null :
      parseFloat($('#Similar_given_Lure').val()
      );
    eData.newLureN = $('#New_given_Lure').val() === '' ?
      null :
      parseFloat($('#New_given_Lure').val()
      );
    eData.oldFoilN = $('#Old_given_Foil').val() === '' ?
      null :
      parseFloat($('#Old_given_Foil').val()
      );
    eData.similarFoilN = $('#Similar_given_Foil').val() === '' ?
      null :
      parseFloat($('#Similar_given_Foil').val()
      );
    eData.newFoilN = $('#New_given_Foil').val() === '' ?
      null :
      parseFloat($('#New_given_Foil').val()
      );
    eData.stimuliPerSet = $('#stim_set').val() === '' ?
      null :
      parseFloat($('#stim_set').val()
      );
    // Checking for missing or invalid values
    let missingValues = Object.keys(eData)
      .filter(value => eData[value] === null);
    // If no values are missing, proceed with calculations
    if (missingValues.length === 0) {
      // Total responses to each type of stimuli
      cData.responsesToTargets =
        eData.oldTargetN + eData.similarTargetN + eData.newTargetN;
      cData.responsesToLures =
        eData.oldLureN + eData.similarLureN + eData.newLureN;
      cData.responsesToFoils =
        eData.oldFoilN + eData.similarFoilN + eData.newFoilN;
      // Corrected ratio using the total responses for each type of stimuli
      // instead of the total stimuli shown
      cData.otcr = rateDivision(eData.oldTargetN, cData.responsesToTargets);
      cData.stcr = rateDivision(eData.similarTargetN, cData.responsesToTargets);
      cData.ntcr = rateDivision(eData.newTargetN, cData.responsesToTargets);
      cData.olcr = rateDivision(eData.oldLureN, cData.responsesToLures);
      cData.slcr = rateDivision(eData.similarLureN, cData.responsesToLures);
      cData.nlcr = rateDivision(eData.newLureN, cData.responsesToLures);
      cData.ofcr = rateDivision(eData.oldFoilN, cData.responsesToFoils);
      cData.sfcr = rateDivision(eData.similarFoilN, cData.responsesToFoils);
      cData.nfcr = rateDivision(eData.newFoilN, cData.responsesToFoils);
      // Raw ratio using the total of stimuli per type
      cData.otrr = rateDivision(eData.oldTargetN, eData.stimuliPerSet);
      cData.strr = rateDivision(eData.similarTargetN, eData.stimuliPerSet);
      cData.ntrr = rateDivision(eData.newTargetN, eData.stimuliPerSet);
      cData.olrr = rateDivision(eData.oldLureN, eData.stimuliPerSet);
      cData.slrr = rateDivision(eData.similarLureN, eData.stimuliPerSet);
      cData.nlrr = rateDivision(eData.newLureN, eData.stimuliPerSet);
      cData.ofrr = rateDivision(eData.oldFoilN, eData.stimuliPerSet);
      cData.sfrr = rateDivision(eData.similarFoilN, eData.stimuliPerSet);
      cData.nfrr = rateDivision(eData.newFoilN, eData.stimuliPerSet);
      // Total of correct responses (target=>old, lure=>similar, foil=>new)
      cData.correctResponses =
        eData.oldTargetN + eData.similarLureN + eData.newFoilN;
      // Corrected percentage using the responses instead of the total shown
      // expressed as percentages
      cData.correctPercentageCorrected = rateDivision(
        100.0 * (
          eData.oldTargetN +
          eData.similarLureN +
          eData.newFoilN
        ),
        (
          cData.responsesToTargets +
          cData.responsesToLures +
          cData.responsesToFoils)
      );
      // Raw correct percentage using the total shown (3 types, each with the
      // same N per type) expressed as percentage
      cData.correctPercentageRaw = rateDivision(
        100.0 * (
          eData.oldTargetN +
          eData.similarLureN +
          eData.newFoilN
        ),
        (3.0 * eData.stimuliPerSet)
      );
      // Bias metric evaluated as the difference between the ratio of
      // lures identified as similar on the total responses to lures and
      // the ratio of foils identified as similar on the total responses
      // to foils, expressed as percentages
      cData.bias = 100.0 * (
        (
          cData.responsesToLures === 0 ?
            0.00 :
            eData.similarLureN / cData.responsesToLures) -
        (
          cData.responsesToFoils === 0 ?
            0.00 :
            eData.similarFoilN / cData.responsesToFoils)
      );
      // Assigning results to fields
      // Rates for targets
      $('#Old_given_Target_corrected_rate').val(cData.otcr);
      $('#Old_given_Target_raw_rate').val(cData.otrr);
      $('#Similar_given_Target_corrected_rate').val(cData.stcr);
      $('#Similar_given_Target_raw_rate').val(cData.strr);
      $('#New_given_Target_corrected_rate').val(cData.ntcr);
      $('#New_given_Target_raw_rate').val(cData.ntrr);
      // Rates for lures
      $('#Old_given_Lure_corrected_rate').val(cData.olcr);
      $('#Old_given_Lure_raw_rate').val(cData.olrr);
      $('#Similar_given_Lure_corrected_rate').val(cData.slcr);
      $('#Similar_given_Lure_raw_rate').val(cData.slrr);
      $('#New_given_Lure_corrected_rate').val(cData.nlcr);
      $('#New_given_Lure_raw_rate').val(cData.nlrr);
      // Rates for foils
      $('#Old_given_Foil_corrected_rate').val(cData.ofcr);
      $('#Old_given_Foil_raw_rate').val(cData.ofrr);
      $('#Similar_given_Foil_corrected_rate').val(cData.sfcr);
      $('#Similar_given_Foil_raw_rate').val(cData.sfrr);
      $('#New_given_Foil_corrected_rate').val(cData.nfcr);
      $('#New_given_Foil_raw_rate').val(cData.nfrr);
      // Responses by stimuli type
      $('#Total_Response_To_Targets')
        .val(cData.responsesToTargets.toFixed(0));
      $('#Total_Response_To_Lures')
        .val(cData.responsesToLures.toFixed(0));
      $('#Total_Response_To_Foils')
        .val(cData.responsesToFoils.toFixed(0));
      // Correctness percentages
      $('#Correct_Responses').val(cData.correctResponses.toFixed(0));
      $('#Percent_Correct_corrected').val(cData.correctPercentageCorrected);
      $('#Percent_Correct_raw').val(cData.correctPercentageRaw);
      $('#Bias_Metric').val(cData.bias.toFixed(2));
      // Prompt the user for the missing values
    } else {
      fancyErrorPrompt(
        'Calculations',
        'Some values are missing. Please add them then try again.');
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
    'version_label',
    '<p>Version of the MST software used to give the test. As of the writing of this, the version used is the C++ standalone 0.96.</p><p>The automatic parsing is based on that specific log format.</p><p>Reference: <a href="https://faculty.sites.uci.edu/starklab/mnemonic-similarity-task-mst/">Stark Lab</a></p>');
  addBootstrapTooltip(
    'stim_set_label',
    '<p>Number of stimuli per set, with a set taken as a type of stimuli (Target, Lure or Foil).</p><p>The default value is 64 but that value can be modulated through list settings or manually.</p>');
  addBootstrapTooltip(
    'list_setting_label',
    '<p>The list setting dictates how the stimuli per set can be transformed into sub-lists and be pruned.</p><p>The default value is 64 (maximum stimuli length per set), which means no sublist or pruning.</p>');
  addBootstrapTooltip(
    'duration_label',
    '<p>The duration parameter indicates how long each stimulus is shown during the test.</p><p>The default value is 2.000 seconds.</p>');
  addBootstrapTooltip(
    'isi_label',
    '<p>The inter stimulation interval sets the time between each stimulus during the test.</p><p>The default value is 0.500 seconds.</p>');
  addBootstrapTooltip(
    'set_setting_label',
    '<p>The set parameter shows which set of stimuli were used during the test.</p><p><span class="bold">Set C/D/E/F:</span> sets which are independent and where both C and D and E and F are matched.</p><p><span class="bold">Set 1-6:</span> sets which are reshuffles of sets C-H (G and H were not released publicly).</p><p>The default value used is Set 1.</p>');
  addBootstrapTooltip(
    'embargo_label',
    '<p><span class="bold">Restricted:</span> For exclusive use of the original laboratory.</p><p><span class="bold">Internal:</span> Can be shared within the research group.</p><p><span class="bold">Open:</span> Can be shared outside the research group.</p>');
  //
  // Adding the tooltips for the first table
  //
  addBootstrapTooltip(
    'category-column',
    '<p>Response given a stimulus</p>');
  addBootstrapTooltip(
    'corrected-rate-column',
    '<p>Rate of that response using the sum of all responses to that type of stimulus instead of the total number of that type of stimulus</p><p><span class="bold">Range: </span>[0.00, 1.00]</p>');
  addBootstrapTooltip(
    'raw-rate-column',
    '<p>Rate of that response using the total number of that type of stimulus</p><p><span class="bold">Range: </span>[0.00, 1.00]</p>');
  addBootstrapTooltip(
    'response-count-column',
    '<p>Total number of that response to that type of stimulus</p><p><span class="bold">Range: </span>[0, <span class="emphasis">n</span>]</p>');
  //
  // Adding the tooltips for the middle table
  //
  addBootstrapTooltip(
    'L1O-column',
    '<p><span class="emphasis">Old</span> response to a lure from bin 1</p>');
  addBootstrapTooltip(
    'L1S-column',
    '<p><span class="emphasis">Similar</span> response to a lure from bin 1</p>');
  addBootstrapTooltip(
    'L1N-column',
    '<p><span class="emphasis">New</span> response to a lure from bin 1</p>');
  addBootstrapTooltip(
    'L2O-column',
    '<p><span class="emphasis">Old</span> response to a lure from bin 2</p>');
  addBootstrapTooltip(
    'L2S-column',
    '<p><span class="emphasis">Similar</span> response to a lure from bin 2</p>');
  addBootstrapTooltip(
    'L2N-column',
    '<p><span class="emphasis">New</span> response to a lure from bin 2</p>');
  addBootstrapTooltip(
    'L3O-column',
    '<p><span class="emphasis">Old</span> response to a lure from bin 3</p>');
  addBootstrapTooltip(
    'L3S-column',
    '<p><span class="emphasis">Similar</span> response to a lure from bin 3</p>');
  addBootstrapTooltip(
    'L3N-column',
    '<p><span class="emphasis">New</span> response to a lure from bin 3</p>');
  addBootstrapTooltip(
    'L4O-column',
    '<p><span class="emphasis">Old</span> response to a lure from bin 4</p>');
  addBootstrapTooltip(
    'L4S-column',
    '<p><span class="emphasis">Similar</span> response to a lure from bin 4</p>');
  addBootstrapTooltip(
    'L4N-column',
    '<p><span class="emphasis">New</span> response to a lure from bin 4</p>');
  addBootstrapTooltip(
    'L5O-column',
    '<p><span class="emphasis">Old</span> response to a lure from bin 5</p>');
  addBootstrapTooltip(
    'L5S-column',
    '<p><span class="emphasis">Similar</span> response to a lure from bin 5</p>');
  addBootstrapTooltip(
    'L5N-column',
    '<p><span class="emphasis">New</span> response to a lure from bin 5</p>');
  addBootstrapTooltip(
    'L1NR-column',
    '<p><span class="emphasis">No Response</span> response to a lure from bin 1</p>');
  addBootstrapTooltip(
    'L2NR-column',
    '<p><span class="emphasis">No Response</span> response to a lure from bin 2</p>');
  addBootstrapTooltip(
    'L3NR-column',
    '<p><span class="emphasis">No Response</span> response to a lure from bin 3</p>');
  addBootstrapTooltip(
    'L4NR-column',
    '<p><span class="emphasis">No Response</span> response to a lure from bin 4</p>');
  addBootstrapTooltip(
    'L5NR-column',
    '<p><span class="emphasis">No Response</span> response to a lure from bin 5</p>');
  //
  // Adding the tooltips for the last table
  //
  addBootstrapTooltip(
    'total_responses_to_targets_row',
    '<p>Sum of all responses to Target-type stimuli</p>');
  addBootstrapTooltip(
    'total_responses_to_lures_row',
    '<p>Sum of all responses to Lure-type stimuli</p>');
  addBootstrapTooltip(
    'total_responses_to_foils_row',
    '<p>Sum of all responses to Foil-type stimuli</p>');
  addBootstrapTooltip(
    'total-correct-responses-row',
    '<p>Sum of all correct responses to stimuli:</p><p><span class="emphasis">Old</span> for Targets</p><p><span class="emphasis">Similar</span> for Lures</p><p><span class="emphasis">New</span> for Foils</p>');
  addBootstrapTooltip(
    'correct-percentage-corrected-row',
    '<p>Number of correct responses on the total number of responses, expressed as a percentage</p><p><span class="bold">Range: </span>[0.00, 100.00]</p>');
  addBootstrapTooltip(
    'correct-percentage-raw-row',
    '<p>Number of correct responses on the total number of stimuli, expressed as a percentage</p><p><span class="bold">Range: </span>[0.00, 100.00]</p>');
  addBootstrapTooltip(
    'bias-metric-row',
    '<p>Measure of the bias given as the difference between the ratio of <span class="emphasis">Similar</span> responses on the total number lures and the ratio of <span class="emphasis">Similar</span> responses on the total number of foils, expressed as a percentage</p><p><span class="bold">Range: </span>[-100.00, 100.00]</p>');
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
/**
 * Function which takes a response and stimuli, the log line and outputs
 * the count, the raw rate and the corrected rate extracted from said line.
 * @param {object}  values      values object which will receive the extracted
 *                              values
 * @param {string}  logLine     line from the log file which contains the rates
 *                              for the specified response and stimulus
 * @param {string}  response    response given by the user to the stimulus (old,
 *                              new, similar)
 * @param {string}  stimulus    image given to the user (target, lure, foil)
 * @return {boolean}            lack of error in the extraction
 */
function extractRates(
  values,
  logLine = '',
  response = '',
  stimulus = '') {
  // if all strings are specified and the output object exists
  if (logLine !== '' &&
    response !== '' &&
    stimulus !== '' &&
    typeof values !== 'undefined') {
    // Given the pattern of the line
    let pattern = new RegExp('^' +
      response +
      '|' +
      stimulus +
      '\\s+(1\\.00|0\\.[0-9]{2})\\s+\\((1\\.00|0\\.[0-9]{2})\\s+([0-9]{1,3})\\)$');
    // Replace all commas with proper periods then match to pattern
    let buffer = logLine.replaceAll(',', '.')
      .match(pattern);
    // Assign extracted values to properties of the output object
    values[response.toLowerCase() +
    stimulus.charAt(0).toUpperCase() +
    stimulus.slice(1).toLowerCase() +
    'Corrected'] = buffer && buffer.length >= 2 && buffer[1] || null;
    values[response.toLowerCase() +
    stimulus.charAt(0).toUpperCase() +
    stimulus.slice(1).toLowerCase() +
    'Raw'] = buffer && buffer.length >= 3 && buffer[2] || null;
    values[response.toLowerCase() +
    stimulus.charAt(0).toUpperCase() +
    stimulus.slice(1).toLowerCase() +
    'N'] = buffer && buffer.length >= 4 && buffer[3] || null;
    // Return true to signal correct execution
    return true;
  }
  // Return false because of missing inputs
  return false;
}
/**
 * Function to calculate the rates given the possibility of a zero value
 * denominator (rate when no instances were observed)
 * @param {number} numerator   numerator of the ratio
 * @param {number} denominator denominator of the ration
 * @return {string}  ratio returned as a string with a two-digit precision
 */
function rateDivision(numerator, denominator) {
  return denominator === 0 ?
    '0.00' :
    (numerator / denominator).toFixed(2);
}
