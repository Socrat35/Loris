/**
 * Helper script for the two pages of the MMSE instrument.
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
  // Adds an event handler for changes to the values of the input text fields
  textFieldsEventHandler();
  // Implements the function for the Clear Inputs button
  clearInputs();
  // Implements the function for the Check Inputs button
  checkInputs();
  // Implements the function for the Best Guess button
  bestGuess();
  // Add Tooltips for the pages
  addTooltips();
});

/**
 * Function which removes default elements from the display to maximize
 * the space available for data entry.
 */
function adjustDefaultDisplayElementsForDataEntry() {
  // If the data entry table structure exists (data entry page only)
  if ($('#data-entry-table').length) {
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
      // of the color gradient
      backgroundColor = gradients[Math.round(difference / 5) * 5];
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
    let locationParameters = $(location).attr('href').match(/^https:\/\/.+\/([0-9]+)\/([0-9]+).+commentID=([0-9A-Za-z]+)$/);
    // Assign the values to separate variables
    let candID = locationParameters[1];
    let sessionID = locationParameters[2];
    let commentID = locationParameters[3];
    // Fetch the values of the select controls and assign them to variables
    let testLanguage = $('#test_language_select').val();
    let question3Version = $('#question3_option_select').val();
    let question4Version = $('#question4_option_select').val();
    // Reload the page following the format accepted by the rewrite rules
    window.location.href = '/' +
      candID + '/' +
      sessionID + '/' +
      'MMSE/Data_Entry/?' +
      'test_language=' + testLanguage +
      '&question3_option=' + question3Version +
      '&question4_option=' + question4Version +
      '&commentID=' + commentID;
  });
}

/**
 * Function which toggles the 'required' property for text fields to force
 * the validation on any text field that has a non-empty value.
 */
function textFieldsEventHandler() {
  // Event handler on changes to the input text fields
  $('input[type=text]').on('input', function(e) {
    // If the value of the field is empty and the field is required
    if ($(e.target).val() === '' && $(e.target).attr('required') !== undefined) {
      // Set the field required property to false
      $(e.target).prop('required', false);
    } else {
      // Set the field required property to true
      $(e.target).prop('required', true);
    }
  });
}

/**
 * Function which clear the text inputs, the checkboxes and the
 * select controls for the data entry page.
 */
function clearInputs() {
  // Event handler on the click event on the clear inputs button
  $('#clear-inputs-button').on('click', function() {
    // For each text input
    $('input[type=text].instrument-input').each(function() {
      // Set the value to null
      $(this).val('');
      // Set the required property to false
      $(this).prop('required', false);
    });
    // For each select input which is not part of the settings of the instrument
    $('select.instrument-input').each(function() {
      // Set the value to null
      $(this).val('');
    });
    // For each checkbox input
    $('input[type=checkbox]').each(function() {
      // Set the checked property to false
      $(this).prop('checked', false);
    });
  });
}

/**
 * Function which checks each checkbox on the data entry page.
 */
function checkInputs() {
  // Event handler on the click event on the check inputs button
  $('#check-inputs-button').on('click', function() {
    // For each checkbox input
    $('input[type=checkbox]').each(function() {
      // Set the property to checked
      $(this).prop('checked', true);
    });
  });
}

/**
 * Function which takes a series of guesses based on the available
 * data and settings to pre-fill answers on the data entry page.
 */
function bestGuess() {
  // Event handler on the click event on the best guess button
  $('#best-guess-button').on('click', function() {
    // Assign the value of the hidden date_taken field to a variable
    let dateString = $('#date_taken').val();
    // Parse the date string while adding the hours element with our local
    // timezone and use the milliseconds value produced to make an instance of
    // a date object
    let dateObject = new Date(Date.parse(dateString + 'T00:00:00.000'));
    // Array reflecting the DB values of the days select input
    let days = {
      0: 'Su',
      1: 'Mo',
      2: 'Tu',
      3: 'We',
      4: 'Th',
      5: 'Fr',
      6: 'Sa'};
    // Set the year input to the full year value
    $('#1_year_value').val(dateObject.getFullYear());
    // Set the months input to the months +1 since JS starts months at 0
    $('#1_month_value').val(dateObject.getMonth() + 1);
    // Set the date input to the date value
    $('#1_date_value').val(dateObject.getDate());
    // Set the day input to the day value using the days object
    $('#1_day_value').val(days[dateObject.getDay()]);
    // Calculate the day of the year using the difference between the date
    // object created and the start of the year of the date object
    let dayOfYear = Math.round((dateObject - new Date(dateObject.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24)) - 1;
    // Initialize the season variable
    let season = '';
    // Magic numbers come from the March 21st(80), June 21st(172),
    // September 21st(264) and December 21st(355) which are the approximate
    // season limits for the Northern Hemisphere
    if (dayOfYear < 80 || dayOfYear >= 355) {
      season = 'winter';
    } else if (dayOfYear >= 80 && dayOfYear < 172) {
      season = 'spring';
    } else if (dayOfYear >= 172 && dayOfYear < 264) {
      season = 'summer';
    } else {
      season = 'autumn';
    }
    $('#1_season_value').val(season);
    // Assign "best guess" values to the text fields
    $($('#2_country_value').val('Canada')).prop('required', true);
    $($('#2_province_value').val($('#test_language_select').val() === 'FR' ? 'Québec' : 'Quebec')).prop('required', true);
    $($('#2_city_value').val($('#test_language_select').val() === 'FR' ? 'Montréal' : 'Montreal')).prop('required', true);
    $($('#2_location_value').val($('#test_language_select').val() === 'FR' ? 'Hôpital Douglas' : 'Douglas Hospital')).prop('required', true);
    $($('#2_floor_value').val('2')).prop('required', true);
    $($('#3_repetitions').val('1')).prop('required', true);
    $($('#4_item1_value').val($('#question4_option_select').val() === '1' ? '93' : $('#test_language_select').val() === 'FR' ? 'E' : 'D')).prop('required', true);
    $($('#4_item2_value').val($('#question4_option_select').val() === '1' ? '86' : $('#test_language_select').val() === 'FR' ? 'D' : 'L')).prop('required', true);
    $($('#4_item3_value').val($('#question4_option_select').val() === '1' ? '79' : $('#test_language_select').val() === 'FR' ? 'N' : 'R')).prop('required', true);
    $($('#4_item4_value').val($('#question4_option_select').val() === '1' ? '72' : $('#test_language_select').val() === 'FR' ? 'O' : 'O')).prop('required', true);
    $($('#4_item5_value').val($('#question4_option_select').val() === '1' ? '65' : $('#test_language_select').val() === 'FR' ? 'M' : 'W')).prop('required', true);
    $($('#6_item1_value').val($('#test_language_select').val() === 'FR' ? 'Crayon' : 'Pencil')).prop('required', true);
    $($('#6_item2_value').val($('#test_language_select').val() === 'FR' ? 'Montre' : 'Watch')).prop('required', true);
    $('#check-inputs-button').trigger('click');
  });
}

/**
 * Function which enables and defines the tooltips for the pages. In this case,
 * only a tooltip for question 4 of the data entry page.
 */
function addTooltips() {
  // Define a scoring comment for Question 4
  let question4ScoringComment = '<p>L\'idée pour le MMSE normalement est de corriger le participant s\'il se trompe. Quand on lui demande 100-7, s\'il se trompe et dit 83, on note sa réponse (=pas de point) et pour le calcul suivant on lui propose le calcul correct, c\'est à dire qu\'on lui demande de calculer 93-7 (= s\'il donne bien 86 il a un point, mais s\'il donne quoi que ce soit d\'autre il n\'aura pas de point).</p>' +
    '<p>Avec cette procédure il n\'est donc pas censé donner une autre "bonne" réponse que ce qui est écrit puisqu\'on lui redonne le calcul à faire à chaque fois ! (à l\'inverse du MoCA où on le laisse calculer et l\'important n\'est pas le chiffre en soit mais le bon résultat du calcul). (courriel de Julie Gonneaud 2 septembre 2021)</p>' +
    '<p>Sylvia demande de continuer d’administrer ce test de la façon dont son équipe l’a fait depuis le début. (29 mars 2022, LH)</p>';
  // Activate the tooltip with HTML support for the element
  $('#question4_scoring_comment').tooltip({
    html: true,
    placement: 'top'
  });
  // When showing the bootstrap tooltip
  $('#question4_scoring_comment').on('show.bs.tooltip', function(e) {
    // Set the text to the defined tooltip text
    $(e.target).attr('data-original-title', question4ScoringComment);
  });
}
